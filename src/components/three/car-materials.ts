import * as THREE from "three";

/**
 * Acabados del coche del hero, aplicados por nombre de material del .glb.
 * Si se sustituye el modelo por otro, los nombres que no coincidan se ignoran y el
 * coche conserva sus materiales originales (solo se ajusta la intensidad de reflejos).
 */
type Finish = Partial<{
  color: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  envMapIntensity: number;
  emissive: string;
  emissiveIntensity: number;
  normalScale: number;
  /** Cristal: transmisión real en calidad alta, cristal tintado opaco en móvil. */
  glass: boolean;
}>;

const FINISHES: Record<string, Finish> = {
  // Carrocería: plata metalizada con barniz (sin la iridiscencia rosa y verde del original).
  "Paint 1 Pearl": {
    color: "#c3c6cb",
    metalness: 0.92,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.025,
    envMapIntensity: 1.6,
    normalScale: 0.18,
  },
  // Techo, pilares y tomas: negro brillante → bitono de deportivo premium.
  "Paint 2 Pearl": {
    color: "#121316",
    metalness: 0.55,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.4,
  },
  Glass: { color: "#8d969f", roughness: 0.02, envMapIntensity: 2, glass: true },
  Mirror: { roughness: 0.02, envMapIntensity: 2 },
  // Llantas en titanio satinado y radios negro brillante.
  Rim2: { color: "#7d8188", metalness: 1, roughness: 0.24, envMapIntensity: 1.5 },
  Rim1: { color: "#0d0e10", metalness: 0.4, roughness: 0.25, clearcoat: 1, envMapIntensity: 1.2 },
  Brake: { color: "#9b1418", metalness: 0.3, roughness: 0.35, clearcoat: 1 },
  Disc: { color: "#8a8d92", metalness: 1, roughness: 0.45 },
  // Caucho: casi negro y mate, apenas refleja el estudio.
  Tireside: { color: "#1a1a1b", metalness: 0, roughness: 0.75, envMapIntensity: 0.7 },
  Tiretread: { color: "#161617", metalness: 0, roughness: 0.85, envMapIntensity: 0.5 },
  // Interior en cuero coñac (el original blanco brillaba a través de las ventanas).
  "Interior 3 Pearl": { color: "#4a2f1f", metalness: 0, roughness: 0.55, envMapIntensity: 0.6 },
  "Interior 1": { roughness: 0.6, envMapIntensity: 0.5 },
  Hardware: { color: "#5b5e63", metalness: 1, roughness: 0.3 },
  // Luces: emisión muy por encima del umbral del bloom (2,2) para que solo ellas tengan halo.
  Headlight: { emissive: "#dfe9ff", emissiveIntensity: 4.5 },
  Brakelight: { emissive: "#ff1a12", emissiveIntensity: 5 },
  Signallight: { emissive: "#ff8a1c", emissiveIntensity: 2.5 },
};

function toPhysical(m: THREE.MeshStandardMaterial): THREE.MeshPhysicalMaterial {
  if (m instanceof THREE.MeshPhysicalMaterial) return m;
  const p = new THREE.MeshPhysicalMaterial();
  THREE.MeshStandardMaterial.prototype.copy.call(p, m);
  // copy() de Standard deja solo el define STANDARD: sin PHYSICAL el barniz no se compila.
  p.defines = { STANDARD: "", PHYSICAL: "" };
  p.name = m.name;
  return p;
}

export function applyFinishes(root: THREE.Object3D, quality: "high" | "low") {
  const cache = new Map<THREE.Material, THREE.Material>();
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const swap = (m: THREE.Material): THREE.Material => {
      const done = cache.get(m);
      if (done) return done;
      if (!(m instanceof THREE.MeshStandardMaterial)) return m;
      const finish = FINISHES[m.name];
      let out: THREE.MeshStandardMaterial = m;
      if (!finish) {
        m.envMapIntensity = 1.2;
      } else {
        const needsPhysical = finish.clearcoat !== undefined || finish.glass;
        out = needsPhysical ? toPhysical(m) : m;
        if (finish.color) out.color.set(finish.color);
        if (finish.metalness !== undefined) out.metalness = finish.metalness;
        if (finish.roughness !== undefined) out.roughness = finish.roughness;
        if (finish.envMapIntensity !== undefined) out.envMapIntensity = finish.envMapIntensity;
        if (finish.emissive) {
          out.emissive.set(finish.emissive);
          out.emissiveIntensity = finish.emissiveIntensity ?? 1;
          out.toneMapped = true;
        }
        if (finish.normalScale !== undefined && out.normalMap) {
          out.normalScale.setScalar(finish.normalScale);
        }
        if (out instanceof THREE.MeshPhysicalMaterial) {
          out.iridescence = 0;
          if (finish.clearcoat !== undefined) {
            out.clearcoat = finish.clearcoat;
            out.clearcoatRoughness = finish.clearcoatRoughness ?? 0.04;
          }
          if (finish.glass) {
            if (quality === "high") {
              out.transmission = 1;
              out.thickness = 0.02;
              out.ior = 1.5;
              out.attenuationColor.set("#5d6670");
              out.attenuationDistance = 0.4;
            } else {
              // En móvil: cristal tintado sin pase de transmisión (mucho más barato).
              out.transmission = 0;
              out.transparent = true;
              out.opacity = 0.55;
              out.color.set("#0b0d10");
            }
          }
        }
        out.needsUpdate = true;
      }
      cache.set(m, out);
      return out;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
  });
}

/**
 * Sombra de oclusión bajo el coche (rectángulo redondeado muy difuminado). Va dentro del
 * grupo que gira, así que acompaña al coche sin coste de render de sombras en tiempo real.
 */
export function createGroundShadowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = "blur(22px)";
  ctx.fillStyle = "rgba(0,0,0,0.95)";
  const pad = 46;
  const r = 50;
  ctx.beginPath();
  ctx.roundRect(pad, pad, size - pad * 2, size - pad * 2, r);
  ctx.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
