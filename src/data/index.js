import logistics from "./personas/logistics.js";
import manufacturing from "./personas/manufacturing.js";
import care from "./personas/care.js";
import construction from "./personas/construction.js";
import retail from "./personas/retail.js";
import { enrichPersona } from "./enrich.js";

export const PERSONA_ORDER = [
  "logistics",
  "manufacturing",
  "care",
  "construction",
  "retail",
];

const RAW_PERSONAS = {
  logistics,
  manufacturing,
  care,
  construction,
  retail,
};

const PERSONAS = Object.fromEntries(
  Object.entries(RAW_PERSONAS).map(([key, p]) => [key, enrichPersona(p)])
);

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
    if (p.flags.length !== 8) {
      console.warn(`[persona] ${key}: expected 8 flags, got ${p.flags.length}`);
    }
    if (!p.pmi || !p.valueup || !p.exit) {
      console.warn(`[persona] ${key}: missing workflow data (pmi/valueup/exit)`);
    }
    const quant = p.flags.filter((f) => f.cat === "定量");
    if (quant.length < 3) {
      console.warn(`[persona] ${key}: expected at least 3 quantitative flags, got ${quant.length}`);
    }
  }
}
