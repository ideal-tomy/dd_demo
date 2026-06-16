import { renderPmi } from "./render.pmi.js";
import { renderValueup } from "./render.valueup.js";
import { renderExit } from "./render.exit.js";

export function renderPhaseContent(persona) {
  renderPmi(persona);
  renderValueup(persona);
  renderExit(persona);
}
