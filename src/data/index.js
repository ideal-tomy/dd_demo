import logistics from "./personas/logistics.js";
import manufacturing from "./personas/manufacturing.js";
import care from "./personas/care.js";
import construction from "./personas/construction.js";
import retail from "./personas/retail.js";

export const PERSONA_ORDER = [
  "logistics",
  "manufacturing",
  "care",
  "construction",
  "retail",
];

const PERSONAS = {
  logistics,
  manufacturing,
  care,
  construction,
  retail,
};

export function getPersona(key) {
  return PERSONAS[key];
}

export function getAllPersonas() {
  return PERSONA_ORDER.map((key) => PERSONAS[key]);
}

export function assertPersonaData() {
  for (const key of PERSONA_ORDER) {
    const p = PERSONAS[key];
    if (p.sources.length !== 11) {
      console.warn(`[persona] ${key}: expected 11 sources, got ${p.sources.length}`);
    }
    if (p.flags.length !== 7) {
      console.warn(`[persona] ${key}: expected 7 flags, got ${p.flags.length}`);
    }
  }
}
