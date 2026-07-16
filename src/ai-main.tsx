import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DiagnosisPage } from "./pages/DiagnosisPage";
import { ReturnedTimeProvider } from "./state/ReturnedTimeContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReturnedTimeProvider>
      <DiagnosisPage />
    </ReturnedTimeProvider>
  </StrictMode>,
);
