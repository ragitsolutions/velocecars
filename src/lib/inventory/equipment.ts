/**
 * Agrupa el equipamiento (texto libre de DealCar) en categorías para la ficha.
 * Reglas por palabras clave, en orden: la primera que coincide gana; el resto va a «Otros».
 */
const CATEGORIES: { name: string; match: RegExp }[] = [
  {
    name: "Seguridad y asistencia",
    match:
      /c[aá]mara|sensor|aparcamiento|crucero|asistente|airbag|isofix|carril|ángulo muerto|angulo muerto|frenada|visi[oó]n nocturna|head.?up|park/i,
  },
  {
    name: "Multimedia y conectividad",
    match:
      /carplay|android|bluetooth|navegador|gps|altavoces|sonido|burmester|bang|olufsen|harman|bose|meridian|dynaudio|naim|pantalla|conectividad|cargador|reloj digital|cuadro digital/i,
  },
  {
    name: "Confort",
    match:
      /asiento|climatiz|calefact|ventilad|masaje|memoria|volante|sin llave|keyless|arranque|techo|cortina|portón|porton|suspensi[oó]n neum|cierre|ambiental|iluminaci[oó]n ambiental|luz ambiental/i,
  },
  {
    name: "Prestaciones y chasis",
    match:
      /freno|carbocer[aá]mic|escape|suspensi[oó]n|direcci[oó]n|modos? de conducci[oó]n|sport|launch|diferencial|tracci[oó]n|lift|eje|chrono|cambio|levas|spoiler|alerón|aler[oó]n/i,
  },
  {
    name: "Exterior",
    match:
      /llanta|faro|led|matrix|l[aá]ser|pintura|retrovisor|parrilla|carbono exterior|techo solar|luz|óptica|optica|exclusive/i,
  },
  {
    name: "Interior",
    match:
      /cuero|piel|alc[aá]ntara|carbono|interior|tapicer|moqueta|reposacabezas|escudo|reloj|madera|costura/i,
  },
];

export function groupEquipment(items: string[]) {
  const groups = new Map<string, string[]>();
  for (const item of items) {
    const name = CATEGORIES.find((c) => c.match.test(item))?.name ?? "Otros";
    groups.set(name, [...(groups.get(name) ?? []), item]);
  }
  const order = [...CATEGORIES.map((c) => c.name), "Otros"];
  return order
    .filter((name) => groups.has(name))
    .map((name) => ({ name, items: groups.get(name)! }));
}
