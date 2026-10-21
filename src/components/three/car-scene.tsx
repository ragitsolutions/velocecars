"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { heroState } from "@/components/home/hero/hero-progress";
import { applyFinishes, createGroundShadowTexture } from "./car-materials";

/**
 * Escena del hero: un deportivo girando en un estudio fotográfico negro con suelo pulido.
 *
 * Realismo: acabados físicos por material (car-materials.ts), estudio de «lightformers»
 * con tira cenital y luces de recorte, sombra de oclusión bajo el coche y, en calidad
 * alta, postprocesado (oclusión ambiental N8AO, bloom en faros, tono AgX y viñeta).
 *
 * Para sustituir el coche: `node scripts/3d/prepare-hero-model.mjs --source mi-coche.glb`
 * y, si cambia la proporción, ajusta CAR_LENGTH. Ver docs/manual-cliente.md.
 */
export const MODEL_URL = "/models/car.glb";
const DRACO_PATH = "/draco/";
/** Largo del coche en unidades de escena (≈ metros). */
const CAR_LENGTH = 4.6;
const SECONDS_PER_TURN = 20;
/** Ángulo inicial: tres cuartos delantero, como una foto de catálogo. */
export const INITIAL_ANGLE = -Math.PI * 0.22;
/** Teleobjetivo (≈ 85 mm): menos deformación, aspecto de fotografía de producto. */
const FOV = 22;
const BG = "#0a0a0b";

type Quality = "high" | "low";

export type CarSceneProps = {
  quality?: Quality;
  /** Detiene el bucle de render (p. ej. cuando el hero sale de pantalla). */
  paused?: boolean;
  /** Modo captura para generar la secuencia 360° del fallback (ángulo fijo, sin animación). */
  capture?: boolean;
  onReady?: () => void;
};

function Car({
  autoRotate,
  quality,
  onReady,
}: {
  autoRotate: boolean;
  quality: Quality;
  onReady?: () => void;
}) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH);
  const spin = useRef<THREE.Group>(null);

  const { model, mirror, footprint } = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = CAR_LENGTH / Math.max(size.x, size.z);
    root.scale.setScalar(scale);
    // Centrado en planta y apoyado en el suelo (y = 0).
    root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    applyFinishes(root, quality);
    // Copia que comparte geometría y materiales: con escala Y negativa three.js invierte
    // las caras automáticamente, así que no hace falta tocar los materiales.
    const mirrored = quality === "high" ? root.clone(true) : null;
    return { model: root, mirror: mirrored, footprint: { x: size.x * scale, z: size.z * scale } };
  }, [scene, quality]);

  const shadowTexture = useMemo(() => createGroundShadowTexture(), []);

  useFrame((_, delta) => {
    if (autoRotate && spin.current) {
      spin.current.rotation.y += (delta * Math.PI * 2) / SECONDS_PER_TURN;
    }
  });

  // Avisamos cuando el coche ya se ha pintado (dos frames tras montar) para el fundido del póster.
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => onReady?.());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [onReady]);

  return (
    <group ref={spin} rotation-y={INITIAL_ANGLE} name="car-spin">
      <primitive object={model} />
      {mirror && (
        <group scale-y={-1}>
          <primitive object={mirror} />
        </group>
      )}
      <mesh rotation-x={-Math.PI / 2} position-y={0.004} renderOrder={1}>
        <planeGeometry args={[footprint.x * 1.12, footprint.z * 1.1]} />
        <meshBasicMaterial
          map={shadowTexture}
          opacity={0.55}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** Encuadre según la proporción del lienzo + parallax de ratón + recorrido de scroll. */
function Rig({ interactive }: { interactive: boolean }) {
  const { camera, size, scene } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const lookAt = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const vFov = THREE.MathUtils.degToRad(cam.fov);
    const wide = aspect > 1.2;
    // Móvil vertical: el coche llena el ancho. Proporciones intermedias (tablet, ventana
    // estrecha): más aire, porque el titular ocupa casi toda la altura.
    const margin = wide ? 1.3 : aspect < 0.8 ? 1.12 : 1.75;
    const fitWidth = (CAR_LENGTH * margin) / (2 * Math.tan(vFov / 2) * aspect);
    const distance = Math.max(14.5, fitWidth);
    // La niebla acompaña a la distancia de cámara: en móvil la cámara se aleja mucho más.
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = distance + 1;
      scene.fog.far = distance + 12;
    }
    const p = interactive ? heroState.progress : 0;
    const px = interactive ? heroState.pointer.x : 0;
    const py = interactive ? heroState.pointer.y : 0;

    // En escritorio el coche se desplaza a la derecha para dejar sitio al titular.
    const offsetX = wide ? -CAR_LENGTH * 0.42 : 0;
    // Cámara baja (≈ 1,4 m): la mirada de una fotografía de coche, no la de un dron.
    target.set(
      offsetX + distance * 0.55 + px * 0.6,
      1.4 + py * 0.25 + p * 2,
      distance * 0.84 + p * 3,
    );
    // En vertical el coche sube (su centro queda al ~28 % superior) y deja abajo sitio al texto:
    // mirar por debajo del coche lo desplaza hacia arriba en pantalla, en proporción a la distancia.
    lookAt.set(offsetX, wide ? 0.62 : 0.6 - (aspect < 0.8 ? 0.092 : 0.085) * distance, 0);

    if (interactive) {
      cam.position.x = THREE.MathUtils.damp(cam.position.x, target.x, 3, delta);
      cam.position.y = THREE.MathUtils.damp(cam.position.y, target.y, 3, delta);
      cam.position.z = THREE.MathUtils.damp(cam.position.z, target.z, 3, delta);
    } else {
      cam.position.copy(target);
    }
    cam.lookAt(lookAt);
  });
  return null;
}

/**
 * Suelo de estudio. En calidad alta es semitransparente y deja ver el coche reflejado que
 * se dibuja debajo (ver Car): un reflejo exacto que nace en el neumático, más fiable y barato
 * que un reflector en tiempo real. Lambert: sin brillo especular, que en rasante agrisaría el suelo.
 */
function Floor({ quality }: { quality: Quality }) {
  return (
    <mesh rotation-x={-Math.PI / 2} renderOrder={0}>
      <planeGeometry args={[80, 80]} />
      <meshLambertMaterial
        color="#222222"
        transparent={quality === "high"}
        opacity={quality === "high" ? 0.9 : 1}
      />
    </mesh>
  );
}

/**
 * Estudio fotográfico de coches construido con «lightformers» (sin descargar HDRI):
 * tira cenital que dibuja la línea de luz sobre capó y techo, softbox principal en
 * tres cuartos delantero, tiras de recorte traseras y un fondo muy tenue.
 */
function Studio() {
  return (
    <Environment resolution={512} frames={1}>
      <Lightformer
        form="rect"
        intensity={3.2}
        position={[0, 7, 0]}
        rotation-x={Math.PI / 2}
        scale={[2.2, 20, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1.2}
        position={[0, 6.5, 0]}
        rotation-x={Math.PI / 2}
        scale={[12, 12, 1]}
      />
      <Lightformer
        form="rect"
        intensity={2.4}
        position={[-7, 3, 6]}
        target={[0, 0.8, 0]}
        scale={[7, 4, 1]}
      />
      <Lightformer
        form="rect"
        intensity={1}
        position={[7, 2.5, 5]}
        target={[0, 0.8, 0]}
        scale={[5, 3, 1]}
      />
      <Lightformer
        form="rect"
        intensity={6}
        position={[-8, 1.1, -5]}
        target={[0, 0.8, 0]}
        scale={[12, 0.35, 1]}
      />
      <Lightformer
        form="rect"
        intensity={6}
        position={[8, 1.1, -5]}
        target={[0, 0.8, 0]}
        scale={[12, 0.35, 1]}
      />
      {/* Relleno bajo frontal: rescata llantas y faldones de la sombra */}
      <Lightformer
        form="rect"
        intensity={1.4}
        position={[3, 0.6, 9]}
        target={[0, 0.5, 0]}
        scale={[8, 1.4, 1]}
      />
      <Lightformer form="ring" intensity={0.6} position={[0, 3, -12]} scale={8} color="#dfe3ea" />
    </Environment>
  );
}

function Effects({ capture }: { capture: boolean }) {
  return (
    <EffectComposer multisampling={capture ? 8 : 4}>
      <N8AO
        aoRadius={0.9}
        distanceFalloff={0.8}
        intensity={3}
        halfRes={!capture}
        quality={capture ? "high" : "medium"}
      />
      <Bloom
        mipmapBlur
        luminanceThreshold={2.2}
        luminanceSmoothing={0.3}
        intensity={0.5}
        radius={0.5}
      />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <Vignette offset={0.28} darkness={0.62} />
    </EffectComposer>
  );
}

function CaptureBridge() {
  const { invalidate, scene } = useThree();
  useEffect(() => {
    const w = window as typeof window & {
      __veloceTurntable?: { setAngle: (deg: number) => Promise<void> };
    };
    w.__veloceTurntable = {
      async setAngle(deg) {
        const spin = scene.getObjectByName("car-spin");
        if (spin) spin.rotation.y = INITIAL_ANGLE + THREE.MathUtils.degToRad(deg);
        // Varios fotogramas: el reflejo del suelo y la oclusión ambiental se estabilizan.
        for (let i = 0; i < 3; i++) {
          invalidate();
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        }
      },
    };
    document.documentElement.dataset.turntableReady = "true";
  }, [invalidate, scene]);
  return null;
}

export default function CarScene({
  quality = "high",
  paused = false,
  capture = false,
  onReady,
}: CarSceneProps) {
  const interactive = !capture;
  const high = quality === "high" || capture;
  return (
    <Canvas
      dpr={capture ? 1 : high ? [1, 1.75] : [1, 1.25]}
      frameloop={capture ? "demand" : paused ? "never" : "always"}
      camera={{ fov: FOV, near: 0.1, far: 90, position: [9, 1.4, 12] }}
      gl={{
        antialias: !high,
        powerPreference: "high-performance",
        preserveDrawingBuffer: capture,
        // Sin postprocesado (móvil) el tono neutro lo aplica el propio renderer.
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1.3,
      }}
      aria-hidden
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 15, 30]} />
      {/* Charco de luz en el suelo bajo el coche, como el foco cenital de un estudio */}
      <spotLight
        position={[0, 10, 0.5]}
        angle={0.5}
        penumbra={1}
        intensity={high ? 340 : 220}
        color="#f2f3f5"
      />
      <Suspense fallback={null}>
        <Car autoRotate={interactive} quality={high ? "high" : "low"} onReady={onReady} />
        <Floor quality={high ? "high" : "low"} />
        <Studio />
        {capture && <CaptureBridge />}
      </Suspense>
      <Rig interactive={interactive} />
      {high && <Effects capture={capture} />}
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL, DRACO_PATH);
