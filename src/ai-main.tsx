import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DiagnosisPage } from "./pages/DiagnosisPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DiagnosisPage />
  </StrictMode>,
);
