import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  RETURNED_TIME_BASIS,
  RETURNED_TIME_EVENTS,
  type ReturnedTimeEventId,
} from "../config/returned-time";

export type ReturnedTimeLine = {
  id: ReturnedTimeEventId;
  label: string;
  hours: number;
};

type ReturnedTimeContextValue = {
  totalHours: number;
  lines: ReturnedTimeLine[];
  basis: string;
  /** 完了時のみ呼ぶ。同一イベントは二重加算しない */
  addOnComplete: (eventId: ReturnedTimeEventId) => boolean;
};

const ReturnedTimeContext = createContext<ReturnedTimeContextValue | null>(
  null,
);

export function ReturnedTimeProvider({ children }: { children: ReactNode }) {
  const firedRef = useRef<Set<ReturnedTimeEventId>>(new Set());
  const [lines, setLines] = useState<ReturnedTimeLine[]>([]);

  const addOnComplete = useCallback((eventId: ReturnedTimeEventId) => {
    const def = RETURNED_TIME_EVENTS[eventId];
    if (!def) return false;
    if (firedRef.current.has(eventId)) return false;
    firedRef.current.add(eventId);
    setLines((prev) => [
      ...prev,
      { id: def.id, label: def.label, hours: def.hours },
    ]);
    return true;
  }, []);

  const totalHours = useMemo(
    () => lines.reduce((sum, l) => sum + l.hours, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      totalHours,
      lines,
      basis: RETURNED_TIME_BASIS,
      addOnComplete,
    }),
    [totalHours, lines, addOnComplete],
  );

  return (
    <ReturnedTimeContext.Provider value={value}>
      {children}
    </ReturnedTimeContext.Provider>
  );
}

export function useReturnedTime(): ReturnedTimeContextValue {
  const ctx = useContext(ReturnedTimeContext);
  if (!ctx) {
    throw new Error("useReturnedTime must be used within ReturnedTimeProvider");
  }
  return ctx;
}
