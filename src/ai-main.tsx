import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DemoIntro } from "./components/demo-intro/DemoIntro";
import { DiagnosisPage } from "./pages/DiagnosisPage";
import { ReturnedTimeProvider } from "./state/ReturnedTimeContext";

function isEmbedIntro() {
  return new URLSearchParams(window.location.search).get("embed") === "intro";
}

function isStageView() {
  return new URLSearchParams(window.location.search).get("view") === "stage";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isEmbedIntro() ? (
      <main className={`ki-embed-intro${isStageView() ? " ki-embed-stage" : ""}`}>
        <DemoIntro />
      </main>
    ) : (
      <ReturnedTimeProvider>
        <DiagnosisPage />
      </ReturnedTimeProvider>
    )}
  </StrictMode>,
);
