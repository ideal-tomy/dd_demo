import { useEffect, useState } from "react";
import { selectionReturnUrl, syncSelectionEntry } from "../lib/selectionReturn";

export function useSelectionReturn() {
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    syncSelectionEntry();
    setReturnUrl(selectionReturnUrl());
  }, []);

  return { returnUrl };
}
