import {
  PRIMARY_ACCESS_MODES,
  type DdAccessMode,
} from "../../access/access-mode";
import {
  getApiKey,
  getDdProvider,
  getTrialCode,
  setDdAccessMode,
} from "../../access/dd-settings";

const TAB_SHORT: Record<(typeof PRIMARY_ACCESS_MODES)[number], string> = {
  sample: "サンプルで試す",
  "byok-direct": "APIキーで試す",
  "managed-trial": "体験コードで試す",
};

type Props = {
  mode: DdAccessMode;
  onModeChange: (mode: DdAccessMode) => void;
  onNeedSetup: (mode: DdAccessMode) => void;
  trialPortalUrl?: string;
};

function needsSetup(mode: DdAccessMode): boolean {
  if (mode === "byok-direct") return !getApiKey(getDdProvider()).trim();
  if (mode === "managed-trial") return !getTrialCode().trim();
  return false;
}

export function ExperienceModeBar({
  mode,
  onModeChange,
  onNeedSetup,
  trialPortalUrl,
}: Props) {
  return (
    <div className="dd-mode-bar">
      <div className="dd-mode-bar__head">
        <div>
          <p className="dd-eyebrow">体験の始め方</p>
          <p className="dd-muted">モードを選んでから診断を実行してください</p>
        </div>
        {trialPortalUrl ? (
          <a
            className="dd-link"
            href={trialPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            体験コードを取得 →
          </a>
        ) : null}
      </div>
      <div className="dd-mode-tabs" role="tablist" aria-label="体験モード">
        {PRIMARY_ACCESS_MODES.map((m) => {
          const selected = mode === m;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={selected}
              className={selected ? "dd-tab dd-tab--on" : "dd-tab"}
              onClick={() => {
                setDdAccessMode(m);
                onModeChange(m);
                if (needsSetup(m)) onNeedSetup(m);
              }}
            >
              {TAB_SHORT[m]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
