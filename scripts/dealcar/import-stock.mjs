#!/usr/bin/env node
/**
 * Importa el stock de DealCar y genera:
 *   - data/vehicles.json          → inventario normalizado (tipo `Vehicle`)
 *   - data/legacy-redirects.json  → mapa /buy/{uuid} → nueva URL (redirecciones 301)
 *
 * Uso:
 *   node scripts/dealcar/import-stock.mjs                 # usa el volcado más reciente de docs/anexos
 *   node scripts/dealcar/import-stock.mjs --file x.json   # usa un volcado concreto
 *   node scripts/dealcar/import-stock.mjs --live          # descarga el stock de velocecars.es
 *
 * --live replica la llamada que hace la web de DealCar al hacer scroll en /buy (server action
 * de Next.js). El identificador de la acción cambia si DealCar redespliega: si falla, obtén el
 * nuevo valor de `Next-Action` en las DevTools y pásalo en DEALCAR_ACTION_ID. Es una solución
 * puente hasta disponer de API o feed oficial de DealCar (ver docs/pendientes-cliente.md, A3).
 *
 * Conserva las dimensiones de imagen ya calculadas por download-images.mjs.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("../../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ANEXOS = join(ROOT, "docs/anexos");
const OUT = join(ROOT, "data/vehicles.json");
const OUT_REDIRECTS = join(ROOT, "data/legacy-redirects.json");
const LEGACY_ORIGIN = "https://www.velocecars.es";
const NEW_ARRIVAL_DAYS = 30;
const FEATURED_COUNT = 9;

const DEALCAR = {
  dealerId: process.env.DEALCAR_DEALER_ID ?? "1546932f-9962-4e19-954a-a5676adf72bd",
  userId: process.env.DEALCAR_USER_ID ?? "4QGLxyf60sfupuYGyjUSwyzVdAJ2",
  actionId: process.env.DEALCAR_ACTION_ID ?? "87468640f0ed177c07c3b27dcbcdb3bb9dce84ad",
  subdomain: "www.velocecars.es",
};

// ---------------------------------------------------------------------------
// Diccionarios de normalización
// ---------------------------------------------------------------------------

const BRANDS = {
  ASTON_MARTIN: "Aston Martin",
  ALFA_ROMEO: "Alfa Romeo",
  LAND_ROVER: "Land Rover",
  MERCEDES_BENZ: "Mercedes-Benz",
  BMW: "BMW",
};

const FUELS = {
  GASOLINE: "Gasolina",
  DIESEL: "Diésel",
  HYBRID: "Híbrido",
  PLUG_IN_HYBRID: "Híbrido enchufable",
  ELECTRIC: "Eléctrico",
};

const COLORS = {
  GRAY: "Gris",
  BLACK: "Negro",
  BLUE: "Azul",
  WHITE: "Blanco",
  RED: "Rojo",
  GREEN: "Verde",
  YELLOW: "Amarillo",
  PINK: "Rosa",
  ORANGE: "Naranja",
  SILVER: "Plata",
  BROWN: "Marrón",
  BEIGE: "Beige",
  GOLD: "Dorado",
  PURPLE: "Morado",
};

const OFF_ROAD_MODELS = /^(wrangler|clase g|defender)$/i;

const BODY = {
  CUATRO_POR_CUATRO_SUV: "SUV",
  "4X4": "SUV",
  SUV: "SUV",
  COUPE: "Coupé",
  COUPÉ: "Coupé",
  CABRIO: "Cabrio",
  CONVERTIBLE: "Cabrio",
  TARGA_TOP: "Cabrio",
  COMPACTO: "Compacto",
  HATCHBACK: "Compacto",
  BERLINA: "Berlina",
  SEDAN: "Berlina",
  FAMILIAR: "Familiar",
  STATION_WAGON: "Familiar",
  MONOVOLUMEN: "Monovolumen",
  MINIVAN: "Monovolumen",
  SPORT: "Deportivo",
};

/** Correcciones de modelo/versión mal cargados en origen. */
const MODEL_FIXES = {
  "F8 SPIDER TRIBUTO": { model: "F8 Tributo", version: "Spider" },
};

/** Abreviaturas y truncados de DealCar (límite de caracteres en la versión). */
const VERSION_FIXES = [
  [/\bMercedesAMG\b/g, "Mercedes-AMG"],
  [/\bS tr(?:o|on|oni)?\.?$/i, "S tronic"],
  [/\bS tr\.\s/gi, "S tronic "],
  [/\btiptron$/i, "tiptronic"],
  [/\bperform\.\s/gi, "performance "],
  [/\s*\((?:Fastb|Fastsb)\.\)/gi, " Fastback"],
  [/\bBullit\b/g, "Bullitt"],
  [/\bLP 7504\b/g, "LP 750-4"],
  [/\bComp\.\s/g, "Competition "],
  [/\bPlatinum Edit\b/g, "Platinum Edition"],
  [/\bEHybrid\b/g, "E-Hybrid"],
  [/\bCoupe\b/g, "Coupé"],
  [/\s+/g, " "],
];

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toInt = (v) => {
  const n = Number.parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? Math.round(n) : undefined;
};
const toNum = (v) => {
  const n = Number.parseFloat(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const titleCase = (s) =>
  s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtDecimal = (n) => String(n).replace(".", ",");
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

function brandName(code) {
  return BRANDS[code] ?? titleCase(code.replace(/_/g, " "));
}

function cleanVersion(version, brand, model) {
  let v = (version ?? "").replace(/­/g, "").trim();
  const strip = (prefix) => {
    const re = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+`, "i");
    v = v.replace(re, "");
  };
  // DealCar suele anteponer «Marca Modelo» a la versión, a veces dos veces.
  for (let i = 0; i < 2; i++) {
    strip(brand);
    strip(brand.replace("-", " "));
    strip(model);
  }
  for (const [re, rep] of VERSION_FIXES) v = v.replace(re, rep);
  return v.trim();
}

function bodyType(code, text, model) {
  const raw = String(code ?? text ?? "").toUpperCase();
  const mapped = BODY[raw] ?? BODY[String(text ?? "").toUpperCase()] ?? "Coupé";
  return mapped === "SUV" && OFF_ROAD_MODELS.test(model) ? "Todoterreno" : mapped;
}

function drivetrain(traction) {
  const t = String(traction ?? "").toLowerCase();
  if (!t) return undefined;
  if (/4x4|awd|4wd|total|integral/.test(t)) return "Tracción total";
  if (/tras|rwd|rear/.test(t)) return "Propulsión trasera";
  if (/del|fwd|front/.test(t)) return "Tracción delantera";
  return capitalize(t);
}

/**
 * Separa la descripción libre de DealCar en argumentos («*Nacional»), equipamiento
 * («-Techo panorámico») y texto. Descarta la ubicación y la coletilla final, que la
 * nueva web ya muestra de forma estructurada.
 */
function parseComment(comment, brand, model) {
  const highlights = [];
  const equipment = [];
  const paragraphs = [];
  const lines = String(comment ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim());
  const skip = [
    /^ubicaci[oó]n\s*:/i,
    /^si (le|te) interesa/i,
    /^y muchos m[aá]s/i,
    /^(\.{3}|…)$/,
    /^caracter[ií]sticas( a destacar)?\s*:?$/i,
    /^equipamiento( a destacar)?\s*:?$/i,
  ];
  const head = `${brand} ${model}`.toLowerCase().replace(/-/g, " ");
  lines.forEach((line, i) => {
    if (!line || skip.some((re) => re.test(line))) return;
    const isShouting = line === line.toUpperCase() && /[A-Z]{3}/.test(line);
    if (isShouting && i < 4 && line.toLowerCase().replace(/-/g, " ").includes(head.split(" ")[0])) {
      return; // título repetido («FERRARI 458 ITALIA»)
    }
    if (/^\*\*/.test(line)) {
      paragraphs.push(capitalize(line.replace(/^\*+|\*+$/g, "").trim()));
    } else if (/^\*/.test(line)) {
      highlights.push(capitalize(line.replace(/^\*+/, "").trim()));
    } else if (/^[-•·]/.test(line)) {
      equipment.push(capitalize(line.replace(/^[-•·]+/, "").trim()));
    } else {
      paragraphs.push(line);
    }
  });
  return { highlights, equipment, description: paragraphs.join("\n\n") };
}

function isoDate(yyyymmdd) {
  const m = String(yyyymmdd ?? "").match(/^(\d{4})(\d{2})(\d{2})$/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : undefined;
}

// ---------------------------------------------------------------------------
// Mapeo DealCar → Vehicle
// ---------------------------------------------------------------------------

function mapVehicle(d, index, now, previous) {
  const fix = MODEL_FIXES[d.model] ?? {};
  const brand = brandName(d.brand);
  const model = fix.model ?? d.model;
  const version = fix.version ?? cleanVersion(d.version, brand, model);
  const det = d.vehicleDetails ?? {};
  const opt = d.optionalFields ?? {};
  const pricing = d.pricing ?? {};
  const fuel = FUELS[d.engineType] ?? "Gasolina";
  const registrationDate = isoDate(opt.registrationDate);
  // La web de DealCar muestra el año de matriculación; `d.year` es el año de catálogo de la
  // versión y no siempre coincide (p. ej. Mercedes 190 SL de 1964 figura como 1995).
  const year = registrationDate
    ? Number(registrationDate.slice(0, 4))
    : (toInt(d.year) ?? new Date(now).getFullYear());
  // DealCar guarda el día 1 de enero cuando solo se conoce el año: no se publica un mes falso.
  const regMonth =
    registrationDate && !registrationDate.endsWith("-01-01")
      ? Number(registrationDate.slice(5, 7))
      : undefined;
  const brandSlug = slugify(brand);
  const slug = slugify(`${model} ${version} ${year} ${d.vehicleId.slice(0, 6)}`);
  const parsed = parseComment(opt.comment, brand, model);
  const arrival = opt.vehicleDates?.arrivalDate
    ? new Date(opt.vehicleDates.arrivalDate.replace(" ", "T") + "Z").toISOString()
    : undefined;
  const label = ["0", "ECO", "C", "B"].includes(opt.ecologicalLabel ?? det.ecologicalLabel)
    ? (opt.ecologicalLabel ?? det.ecologicalLabel)
    : undefined;
  const colorBase = COLORS[opt.color] ?? (opt.color ? titleCase(opt.color) : "");
  const color = [colorBase, opt.metallic ? "metalizado" : "", opt.matte ? "mate" : ""]
    .filter(Boolean)
    .join(" ");
  const cc = toInt(det.cylinderCapacity);
  const cyl = toInt(det.cylinders);
  const co2 = toInt(det.co2);
  const consumption = toNum(det.consumption);
  const prevImages = new Map((previous?.images ?? []).map((img) => [img.src, img]));
  const fullName = `${brand} ${model} ${version}`.trim();
  const images = (d.mediaUrls ?? [])
    .filter((m) => !m.type || m.type.startsWith("image/"))
    .map((m, i, all) => {
      const prev = prevImages.get(m.url);
      return {
        src: m.url,
        alt: `${fullName} — fotografía ${i + 1} de ${all.length}`,
        w: prev?.w ?? 1600,
        h: prev?.h ?? 1200,
      };
    });
  if (!images.length && d.imageUrl)
    images.push({ src: d.imageUrl, alt: fullName, w: 1600, h: 1200 });

  const length = toInt(det.length);
  const width = toInt(det.width);
  const height = toInt(det.height);

  return clean({
    id: d.vehicleId,
    slug,
    brand,
    brandSlug,
    model,
    version,
    price: toInt(pricing.price ?? d.price) ?? 0,
    priceNote: pricing.taxIncluded ? "IVA incluido" : undefined,
    year,
    month: regMonth,
    registrationDate,
    mileageKm: toInt(d.kilometers) ?? 0,
    powerCv: toInt(det.powerHsPs) ?? 0,
    powerKw: toInt(det.powerKw),
    fuel,
    transmission: det.transmission === "M" ? "Manual" : "Automático",
    bodyType: bodyType(det.bodyCode, det.bodyTypeText, model),
    condition: year < 1990 ? "Clásico" : "Ocasión",
    color,
    doors: toInt(det.doors ?? det.numberOfDoors) || undefined,
    seats: toInt(det.seats ?? det.numberSeats) || undefined,
    drivetrain: drivetrain(det.traction ?? det.drivenWheels),
    engine:
      fuel === "Eléctrico" || !cc
        ? undefined
        : `${fmtDecimal((cc / 1000).toFixed(1))} L${cyl ? ` · ${cyl} cilindros` : ""}`,
    consumption:
      consumption && fuel !== "Eléctrico" ? `${fmtDecimal(consumption)} l/100 km` : undefined,
    emissions: co2 ? `${co2} g/km CO₂` : undefined,
    emissionLabel: label,
    warrantyMonths: toInt(String(opt.guarantee ?? "").match(/\d+/)?.[0]),
    warrantyOfficial: opt.officialGuarantee === true ? true : undefined,
    owners: /[uú]nico propietario/i.test(opt.comment ?? "") ? 1 : undefined,
    plate: opt.licensePlate || undefined,
    topSpeedKmh: toNum(det.maxSpeed),
    acceleration0100: toNum(det.acceleration),
    weightKg: toNum(det.kg),
    dimensionsMm: length && width && height ? { length, width, height } : undefined,
    highlights: parsed.highlights,
    equipment: parsed.equipment,
    description: parsed.description,
    images,
    video: d.youtubeUrl || d.videoUrl || undefined,
    status: { BOOKED: "reservado", SOLD: "vendido" }[d.status] ?? "disponible",
    // El orden «Por defecto» de DealCar lo gestiona el cliente: sus primeros coches son los destacados.
    featured: index < FEATURED_COUNT,
    isNew: arrival ? Date.parse(now) - Date.parse(arrival) < NEW_ARRIVAL_DAYS * 864e5 : false,
    source: {
      provider: "dealcar",
      externalId: d.vehicleId,
      legacyUrl: `${LEGACY_ORIGIN}/buy/${d.vehicleId}`,
    },
    createdAt: arrival ?? previous?.createdAt ?? now,
    updatedAt: now,
  });
}

// ---------------------------------------------------------------------------
// Entrada
// ---------------------------------------------------------------------------

async function fetchLive() {
  const tree = encodeURIComponent(
    JSON.stringify([
      "",
      {
        children: [
          "sites",
          {
            children: [
              ["subdomain", DEALCAR.subdomain, "d"],
              { children: ["buy", { children: ["__PAGE__", {}, "/buy", "refresh"] }] },
            ],
          },
        ],
      },
      null,
      null,
      true,
    ]),
  );
  const all = [];
  for (let page = 1; page <= 50; page++) {
    const body = JSON.stringify([
      DEALCAR.dealerId,
      DEALCAR.userId,
      page,
      "",
      9,
      [],
      [],
      [],
      [],
      [],
      null,
      null,
      null,
      null,
      null,
      null,
      DEALCAR.subdomain,
      ["AVAILABLE", "BOOKED", "IN_PREPARATION", "SOLD"],
      null,
      null,
    ]);
    const res = await fetch(`${LEGACY_ORIGIN}/buy`, {
      method: "POST",
      headers: {
        Accept: "text/x-component",
        "Content-Type": "text/plain;charset=UTF-8",
        "Next-Action": DEALCAR.actionId,
        "Next-Router-State-Tree": tree,
        Origin: LEGACY_ORIGIN,
      },
      body,
    });
    const text = await res.text();
    const line = text.split("\n").find((l) => l.startsWith("1:"));
    if (!res.ok || !line) {
      throw new Error(
        `DealCar respondió ${res.status} en la página ${page}. ¿Ha cambiado DEALCAR_ACTION_ID?`,
      );
    }
    const content = JSON.parse(line.slice(2)).content ?? [];
    if (!content.length) break;
    all.push(...content);
    await new Promise((r) => setTimeout(r, 300));
  }
  const stamp = new Date().toISOString().slice(0, 10);
  writeFileSync(join(ANEXOS, `dealcar-listing-${stamp}.json`), JSON.stringify(all));
  return all;
}

function latestDump(prefix) {
  const files = readdirSync(ANEXOS)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
    .sort();
  return files.length ? join(ANEXOS, files.at(-1)) : undefined;
}

async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.includes("--file") ? args[args.indexOf("--file") + 1] : undefined;
  let raw;
  if (args.includes("--live")) {
    raw = await fetchLive();
    console.log(`Descargados ${raw.length} vehículos de DealCar.`);
  } else {
    const file = fileArg ?? latestDump("dealcar-listing-");
    if (!file) throw new Error("No hay volcado de DealCar en docs/anexos. Usa --live o --file.");
    raw = JSON.parse(readFileSync(file, "utf8"));
    console.log(`Leyendo ${raw.length} vehículos de ${file}`);
  }

  const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
  const prevById = new Map(previous.map((v) => [v.id, v]));
  const now = new Date().toISOString();
  const vehicles = raw.map((d, i) => mapVehicle(d, i, now, prevById.get(d.vehicleId)));
  writeFileSync(OUT, JSON.stringify(vehicles, null, 2) + "\n");

  // Redirecciones: todos los UUID conocidos (stock actual + fichas antiguas del sitemap).
  const redirects = Object.fromEntries(
    vehicles.map((v) => [`/buy/${v.id}`, `/vehiculos/${v.brandSlug}/${v.slug}`]),
  );
  const fichas = latestDump("dealcar-fichas-");
  if (fichas) {
    for (const [id, d] of Object.entries(JSON.parse(readFileSync(fichas, "utf8")))) {
      if (!redirects[`/buy/${id}`] && d?.brand) {
        redirects[`/buy/${id}`] = `/vehiculos/${slugify(brandName(d.brand))}`;
      }
    }
  }
  writeFileSync(OUT_REDIRECTS, JSON.stringify(redirects, null, 2) + "\n");

  const brands = [...new Set(vehicles.map((v) => v.brand))];
  console.log(
    `✓ ${vehicles.length} vehículos · ${brands.length} marcas · ${vehicles.reduce((n, v) => n + v.images.length, 0)} fotos`,
  );
  console.log(
    `✓ ${Object.keys(redirects).length} redirecciones heredadas → data/legacy-redirects.json`,
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
