import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  Clock3,
  Copy,
  FileText,
  RotateCcw,
  ShieldCheck,
  Train,
  Trash2,
} from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/69fd0add5545130d2d15d03c/456db1150_ChatGPTImageMay15202605_49_31PM.png";
const STORAGE_KEY = "l3-tc-template-ods-activation-v1";

const DEFAULT_FIELDS = {
  failureTitle: "ODS Activation",
  location: "",
  stationSection: "",
  affectedTrains: "",
  cctvPoint: "",
  stationController: "",
  nspDispatchTime: "",
  efcName: "",
  atcTeam: "ATC Team",
  clearanceBy: "",
  tsrLocation: "",
  inspectionStaff: "",
  inspectionMode: "onboard and roving",
  inspectionSection: "",
  inspectionLoops: "",
  remarks: "",
};

const EMPTY_LOG_HINT = "No ODS logs generated yet. Select a time, fill up the required input, then click the action buttons.";

const formatNow = () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const clean = (value) => String(value || "").trim();

const withFallback = (value, fallback) => clean(value) || fallback;

const sentence = (value, fallback) => withFallback(value, fallback);

const buildPlace = (fields) => {
  const location = clean(fields.location);
  const stationSection = clean(fields.stationSection);

  if (location && stationSection) return `${location} (${stationSection})`;
  if (location) return location;
  if (stationSection) return stationSection;
  return "[affected area]";
};

const ensureTA = (value) => {
  const name = clean(value);
  if (!name) return "[SATR/TA name]";
  if (/^(SATR|TA)\b/i.test(name)) return name;
  return `TA ${name}`;
};

const buildActionLine = (actionId, fields, selectedTime) => {
  const time = selectedTime || "00:00";
  const place = buildPlace(fields);
  const cctvPoint = sentence(fields.cctvPoint, "ODP / CCTV PTZ");
  const stationController = sentence(fields.stationController, "[Station Controller]");
  const nspTime = clean(fields.nspDispatchTime) ? ` at ${fields.nspDispatchTime} hrs` : "";
  const efcName = sentence(fields.efcName, "[EFC]");
  const atcTeam = sentence(fields.atcTeam, "ATC Team");
  const clearanceBy = sentence(fields.clearanceBy, "[Name/Position]");
  const tsrLocation = sentence(fields.tsrLocation, place);
  const inspectionStaff = ensureTA(fields.inspectionStaff);
  const inspectionMode = sentence(fields.inspectionMode, "onboard and roving");
  const inspectionSection = sentence(fields.inspectionSection, place);
  const loops = clean(fields.inspectionLoops) ? ` for ${fields.inspectionLoops} loop(s)` : "";
  const trains = clean(fields.affectedTrains) ? ` Affected trains: ${fields.affectedTrains}.` : "";
  const remarks = clean(fields.remarks) ? ` Remark: ${fields.remarks}.` : "";

  const prefix = `${time} hrs – `;

  switch (actionId) {
    case "activation":
      return `${prefix}${fields.failureTitle || "ODS Activation"} at ${place}. No visible obstacle observed from Live CCTV and Playback.${trains}${remarks}`;
    case "hold":
      return `${prefix}All trains approaching ${place} were held/stopped pending track clearance confirmation.${trains}`;
    case "scada":
      return `${prefix}Timeout-based SCADA pop-up alarm postponed pending track clearance confirmation via Live CCTV and Playback.`;
    case "sc":
      return `${prefix}SC ${stationController} requested to enlarge CCTV trigger on ${cctvPoint} and review CCTV playback 3 minutes prior to the ODS activation. Network Security Patrol dispatched to roadside${nspTime}.`;
    case "efc":
      return `${prefix}${efcName} requested to dispatch ${atcTeam} from WD ATC Room to identify the reason for ODS activation.`;
    case "clearance":
      return `${prefix}Track clearance at ${place} confirmed via Live CCTV and Playback by ${clearanceBy}.`;
    case "reset":
      return `${prefix}ODS alarm at ${place} reset via ATS.`;
    case "tsr":
      return `${prefix}TSR 45 KPH applied at ${tsrLocation}. Train movement resumed under CCTV observation.`;
    case "inspection":
      return `${prefix}${inspectionStaff} assigned for initial visual inspection via ${inspectionMode} at ${inspectionSection}${loops}.`;
    default:
      return `${prefix}${remarks || "ODS activation update recorded."}`;
  }
};

const actionButtons = [
  { id: "activation", label: "ODS Activated", icon: AlertTriangle },
  { id: "hold", label: "Hold / Stop Trains", icon: Train },
  { id: "scada", label: "SCADA Pop-up Postponed", icon: Clock3 },
  { id: "sc", label: "SC / NSP Coordination", icon: ShieldCheck },
  { id: "efc", label: "EFC / ATC Coordination", icon: Clipboard },
  { id: "clearance", label: "Track Clearance Confirmed", icon: CheckCircle2 },
  { id: "reset", label: "Reset ODS via ATS", icon: RotateCcw },
  { id: "tsr", label: "Apply TSR 45 KPH / Resume", icon: Train },
  { id: "inspection", label: "Assign SATR / TA Inspection", icon: FileText },
];

function Field({ label, value, onChange, placeholder, className = "", type = "text" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7eb8e0]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-[#21445f] bg-[#061827] px-3 text-sm text-white shadow-inner outline-none transition placeholder:text-[#5e7d92] focus:border-[#51a8df] focus:ring-2 focus:ring-[#51a8df]/20"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7eb8e0]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-[#21445f] bg-[#061827] px-3 text-sm text-white shadow-inner outline-none transition focus:border-[#51a8df] focus:ring-2 focus:ring-[#51a8df]/20"
      >
        {children}
      </select>
    </label>
  );
}

function TextareaField({ label, value, onChange, placeholder, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#7eb8e0]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-[#21445f] bg-[#061827] px-3 py-2 text-sm text-white shadow-inner outline-none transition placeholder:text-[#5e7d92] focus:border-[#51a8df] focus:ring-2 focus:ring-[#51a8df]/20"
      />
    </label>
  );
}

export default function Home() {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [timeMode, setTimeMode] = useState("now");
  const [customTime, setCustomTime] = useState(formatNow());
  const [logs, setLogs] = useState([]);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) {
        setFields({ ...DEFAULT_FIELDS, ...(saved.fields || {}) });
        setTimeMode(saved.timeMode || "now");
        setCustomTime(saved.customTime || formatNow());
        setLogs(Array.isArray(saved.logs) ? saved.logs : []);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const payload = { fields, timeMode, customTime, logs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [fields, timeMode, customTime, logs]);

  const selectedTime = useMemo(() => (timeMode === "now" ? formatNow() : customTime || "00:00"), [timeMode, customTime]);

  const outputText = logs.length ? logs.join("\n") : EMPTY_LOG_HINT;

  const updateField = (key, value) => {
    setFields((previous) => ({ ...previous, [key]: value }));
  };

  const addLog = (actionId) => {
    const line = buildActionLine(actionId, fields, selectedTime);
    setLogs((previous) => [...previous, line]);
    setCopyStatus("");
  };

  const addFullTemplate = () => {
    const defaultOrder = ["activation", "hold", "scada", "sc", "efc", "clearance", "reset", "tsr", "inspection"];
    setLogs((previous) => [
      ...previous,
      ...defaultOrder.map((actionId) => buildActionLine(actionId, fields, selectedTime)),
    ]);
    setCopyStatus("");
  };

  const copyLogs = async () => {
    if (!logs.length) return;
    await navigator.clipboard.writeText(logs.join("\n"));
    setCopyStatus("Copied");
    window.setTimeout(() => setCopyStatus(""), 1400);
  };

  const clearInputs = () => {
    setFields(DEFAULT_FIELDS);
    setCustomTime(formatNow());
  };

  return (
    <div className="min-h-screen bg-[#071828] font-inter text-white">
      <header
        className="sticky top-0 z-20 h-[56px]"
        style={{
          background: "linear-gradient(180deg,#0c2e4a 0%,#071e33 100%)",
          borderBottom: "1px solid #1a3a56",
        }}
      >
        <div className="flex h-full w-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Riyadh Metro"
              className="h-10 w-auto object-contain"
            />
            <div className="h-6 w-px bg-[#1a3a56]" />
            <span className="text-sm font-bold tracking-tight text-white">
              L3 TC Template
            </span>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-[#1a3a56] bg-[#071828] px-3 py-1.5 sm:flex">
            <CalendarDays className="h-3.5 w-3.5 text-[#7eb8e0]" />
            <span className="text-[10px] text-[#7eb8e0]">{today}</span>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-56px)] bg-[radial-gradient(circle_at_top_left,#0e3552_0%,#071828_45%,#04111d_100%)] p-4 md:p-6">
        <section className="mx-auto max-w-7xl">
          <div className="mb-5 rounded-2xl border border-[#1c3d58] bg-[#071b2c]/90 p-4 shadow-2xl shadow-black/25 backdrop-blur">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-[#315d7d] bg-[#0b2740] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ed0ff]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Failure Log Window
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                  Handling of ODS Activation
                </h1>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-[#9db8ca] md:text-sm">
                  Generate TC logs for ODS activation when no visible obstacle is found from Live CCTV and Playback.
                </p>
              </div>
              <div className="rounded-xl border border-[#21445f] bg-[#061827] px-4 py-3 text-xs text-[#9db8ca]">
                <div className="font-semibold text-[#8ed0ff]">Required control flow</div>
                Hold / Stop trains → SCADA postponed → SC / NSP → EFC / ATC → Clearance → Reset → TSR 45 KPH → SATR / TA inspection
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-[#1c3d58] bg-[#071b2c]/95 shadow-2xl shadow-black/25">
              <div className="border-b border-[#1c3d58] px-4 py-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                      ODS Activation Input
                    </h2>
                    <p className="text-xs text-[#7f9bad]">
                      Fill up only the details available. Empty fields will use safe placeholders.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-[#21445f] bg-[#061827] p-1">
                    <button
                      type="button"
                      onClick={() => setTimeMode("now")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        timeMode === "now"
                          ? "bg-[#1f79b7] text-white shadow-lg shadow-[#1f79b7]/20"
                          : "text-[#8aa8bb] hover:bg-[#0d2a43] hover:text-white"
                      }`}
                    >
                      Now
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeMode("custom")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        timeMode === "custom"
                          ? "bg-[#1f79b7] text-white shadow-lg shadow-[#1f79b7]/20"
                          : "text-[#8aa8bb] hover:bg-[#0d2a43] hover:text-white"
                      }`}
                    >
                      Custom
                    </button>
                    <input
                      type="time"
                      value={customTime}
                      onChange={(event) => {
                        setCustomTime(event.target.value);
                        setTimeMode("custom");
                      }}
                      className="h-8 rounded-lg border border-[#21445f] bg-[#071828] px-2 text-xs text-white outline-none focus:border-[#51a8df]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field
                    label="Failure Title"
                    value={fields.failureTitle}
                    onChange={(value) => updateField("failureTitle", value)}
                    placeholder="ODS Activation"
                  />
                  <Field
                    label="ODS Location / Affected Area"
                    value={fields.location}
                    onChange={(value) => updateField("location", value)}
                    placeholder="Example: ODS B-1E / Between STN A and STN B"
                  />
                  <Field
                    label="Station / Section"
                    value={fields.stationSection}
                    onChange={(value) => updateField("stationSection", value)}
                    placeholder="Example: Mainline / Roadside / Platform area"
                  />
                  <Field
                    label="Affected / Approaching Trains"
                    value={fields.affectedTrains}
                    onChange={(value) => updateField("affectedTrains", value)}
                    placeholder="Example: T12, T18, T24"
                  />
                  <Field
                    label="CCTV / ODP / PTZ"
                    value={fields.cctvPoint}
                    onChange={(value) => updateField("cctvPoint", value)}
                    placeholder="Example: ODP 03 / PTZ Cam 12"
                  />
                  <Field
                    label="Station Controller"
                    value={fields.stationController}
                    onChange={(value) => updateField("stationController", value)}
                    placeholder="Example: SC Faisal"
                  />
                  <Field
                    label="NSP Dispatch Time"
                    value={fields.nspDispatchTime}
                    onChange={(value) => updateField("nspDispatchTime", value)}
                    type="time"
                  />
                  <Field
                    label="EFC Name"
                    value={fields.efcName}
                    onChange={(value) => updateField("efcName", value)}
                    placeholder="Example: EFC Omar"
                  />
                  <Field
                    label="ATC Team / Location"
                    value={fields.atcTeam}
                    onChange={(value) => updateField("atcTeam", value)}
                    placeholder="Example: ATC Team from WD ATC Room"
                  />
                  <Field
                    label="Track Clearance Confirmed By"
                    value={fields.clearanceBy}
                    onChange={(value) => updateField("clearanceBy", value)}
                    placeholder="Example: TC / DM / SC Name"
                  />
                  <Field
                    label="TSR 45 KPH Location"
                    value={fields.tsrLocation}
                    onChange={(value) => updateField("tsrLocation", value)}
                    placeholder="Same as affected area if blank"
                  />
                  <Field
                    label="SATR / TA Name"
                    value={fields.inspectionStaff}
                    onChange={(value) => updateField("inspectionStaff", value)}
                    placeholder="Example: Faisal or TA Faisal"
                  />
                  <SelectField
                    label="Inspection Mode"
                    value={fields.inspectionMode}
                    onChange={(value) => updateField("inspectionMode", value)}
                  >
                    <option value="onboard and roving">Onboard and roving</option>
                    <option value="onboard">Onboard</option>
                    <option value="roving">Roving</option>
                  </SelectField>
                  <Field
                    label="Inspection Section"
                    value={fields.inspectionSection}
                    onChange={(value) => updateField("inspectionSection", value)}
                    placeholder="Same as affected area if blank"
                  />
                  <Field
                    label="Required Loop(s)"
                    value={fields.inspectionLoops}
                    onChange={(value) => updateField("inspectionLoops", value)}
                    placeholder="Example: 2"
                  />
                  <TextareaField
                    label="Additional Remark"
                    value={fields.remarks}
                    onChange={(value) => updateField("remarks", value)}
                    placeholder="Any extra update / reason / finding"
                    className="md:col-span-2"
                  />
                </div>

                <div className="rounded-2xl border border-[#21445f] bg-[#061827]/80 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#8ed0ff]">
                        Generate Action Logs
                      </h3>
                      <p className="text-[11px] text-[#7f9bad]">
                        Selected time: <span className="font-semibold text-white">{selectedTime} hrs</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addFullTemplate}
                      className="rounded-xl border border-[#2b6388] bg-[#0c3554] px-3 py-2 text-xs font-semibold text-[#d9f2ff] transition hover:bg-[#12486f]"
                    >
                      Add Full Template
                    </button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {actionButtons.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => addLog(id)}
                        className="group flex items-center gap-2 rounded-xl border border-[#21445f] bg-[#092238] px-3 py-2 text-left text-xs font-semibold text-[#d7ebf7] transition hover:border-[#51a8df] hover:bg-[#103653]"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#123a5b] text-[#8ed0ff] transition group-hover:bg-[#1f79b7] group-hover:text-white">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={clearInputs}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#21445f] bg-[#061827] px-3 py-2 text-xs font-semibold text-[#b8d5e7] transition hover:bg-[#0d2a43]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Clear Input
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogs([])}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#55313a] bg-[#2a1018] px-3 py-2 text-xs font-semibold text-[#ffb8c0] transition hover:bg-[#3a1620]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear Output
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1c3d58] bg-[#071b2c]/95 shadow-2xl shadow-black/25">
              <div className="flex items-center justify-between gap-3 border-b border-[#1c3d58] px-4 py-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                    ODS Activation Log Output
                  </h2>
                  <p className="text-xs text-[#7f9bad]">
                    Copy and paste into the operational log.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyLogs}
                  disabled={!logs.length}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#2b6388] bg-[#0c3554] px-3 py-2 text-xs font-semibold text-[#d9f2ff] transition hover:bg-[#12486f] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copyStatus || "Copy"}
                </button>
              </div>

              <div className="p-4">
                <pre className="min-h-[520px] whitespace-pre-wrap rounded-2xl border border-[#21445f] bg-[#020b12] p-4 font-mono text-[12px] leading-6 text-[#e7f6ff] shadow-inner">
{outputText}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
