import { useMemo, useState } from "react";
import { CalendarDays, Copy, RotateCcw, ShieldAlert } from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/69fd0add5545130d2d15d03c/456db1150_ChatGPTImageMay15202605_49_31PM.png";

const DEFAULT_ODS_FORM = {
  alarmTime: "14:36",
  alarmCode: "W283",
  detectionPoint: "3J1_ODS3T1",
  odsAlarm: "ODS3T2",
  mazLocations: "TC2004 and TC2003",
  tsrSpeed: "45",
  trainOneCode: "V606",
  trainOneId: "T18",
  trainOneTid: "TID206",
  trainOneLocation: "3J1 TC2004",
  trainOneAlarm: "EB application due to slide controlled EB",
  trainUnableCode: "V141",
  trainUnableRemark: "Train unable to run",
  trainTwoCode: "V692",
  trainTwoId: "T41",
  trainTwoTid: "TID209",
  trainTwoLocation: "3J1 TC2001",
  trainTwoAlarm: "FSB application",
  holdTime: "14:37",
  scadaTime: "14:37",
  taInstructionTime: "14:38",
  stationTa: "TA 3J1",
  stationTaBoardTid: "TID207",
  stationTaBoardTrain: "T31",
  stationTaBoardLocation: "3J1 PF2",
  stationTaRemark: "TA not available at the station",
  resetTime: "14:40",
  cctvResult: "No trespasser or obstruction via CCTV playback",
  resetLocation: "3J1",
  rovingInstructionTime: "14:40",
  rovingTid: "TID101",
  rovingTrain: "T43",
  rovingFrom: "3G2 PF1",
  observeSection: "3H1 to 3J1",
  rovingBoardedTime: "14:41",
  rovingReportTime: "14:47",
  rovingReportResult: "both tracks cleared, no abnormalities found",
  tsrRemovedTime: "14:48",
  srNumber: "10115146",
};

const FIELD_GROUPS = [
  {
    title: "Alarm & protection",
    fields: [
      ["alarmTime", "Alarm time"],
      ["alarmCode", "Alarm code"],
      ["detectionPoint", "Detection point"],
      ["odsAlarm", "ODS alarm"],
      ["mazLocations", "MAZ / TSR location"],
      ["tsrSpeed", "TSR speed kph"],
    ],
  },
  {
    title: "Affected trains",
    fields: [
      ["trainOneCode", "Train 1 code"],
      ["trainOneId", "Train 1 ID"],
      ["trainOneTid", "Train 1 TID"],
      ["trainOneLocation", "Train 1 location"],
      ["trainOneAlarm", "Train 1 alarm"],
      ["trainUnableCode", "Unable-to-run code"],
      ["trainUnableRemark", "Unable-to-run remark"],
      ["trainTwoCode", "Train 2 code"],
      ["trainTwoId", "Train 2 ID"],
      ["trainTwoTid", "Train 2 TID"],
      ["trainTwoLocation", "Train 2 location"],
      ["trainTwoAlarm", "Train 2 alarm"],
    ],
  },
  {
    title: "CCTV / reset / release",
    fields: [
      ["holdTime", "Train hold time"],
      ["scadaTime", "SCADA pop-up time"],
      ["taInstructionTime", "Station TA instruction time"],
      ["stationTa", "Station TA"],
      ["stationTaBoardTid", "Board TID"],
      ["stationTaBoardTrain", "Board train"],
      ["stationTaBoardLocation", "Board location"],
      ["stationTaRemark", "Station TA remark"],
      ["resetTime", "Reset / release time"],
      ["cctvResult", "CCTV result"],
      ["resetLocation", "Reset location"],
    ],
  },
  {
    title: "Roving TA / final close-out",
    fields: [
      ["rovingInstructionTime", "Roving TA instruction time"],
      ["rovingTid", "Roving TID"],
      ["rovingTrain", "Roving train"],
      ["rovingFrom", "Roving from"],
      ["observeSection", "Observe section"],
      ["rovingBoardedTime", "Boarded time"],
      ["rovingReportTime", "Report time"],
      ["rovingReportResult", "Roving report result"],
      ["tsrRemovedTime", "TSR removed time"],
      ["srNumber", "SR number"],
    ],
  },
];

function normalizeTime(value) {
  const cleaned = String(value || "").replace(/hrs?/gi, "").replace(/[^0-9:]/g, "").trim();
  if (!cleaned) return "00:00";

  if (cleaned.includes(":")) {
    const [hours = "00", minutes = "00"] = cleaned.split(":");
    return `${hours.padStart(2, "0").slice(-2)}:${minutes.padStart(2, "0").slice(0, 2)}`;
  }

  if (cleaned.length <= 2) return `${cleaned.padStart(2, "0")}:00`;

  return `${cleaned.slice(0, -2).padStart(2, "0").slice(-2)}:${cleaned.slice(-2)}`;
}

function formatHrs(value) {
  return `${normalizeTime(value)}hrs`;
}

function normalizeTrain(value) {
  const cleaned = String(value || "").trim().toUpperCase();
  if (!cleaned) return "T00";
  return cleaned.startsWith("T") ? cleaned : `T${cleaned}`;
}

function normalizeTid(value) {
  const cleaned = String(value || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!cleaned) return "TID000";
  return cleaned.startsWith("TID") ? cleaned : `TID${cleaned}`;
}

function formatSr(value) {
  const cleaned = String(value || "").replace(/^SR#?\s*/i, "").trim();
  return cleaned ? `SR ${cleaned}` : "SR";
}

function buildOdsLog(form) {
  const trainOne = normalizeTrain(form.trainOneId);
  const trainTwo = normalizeTrain(form.trainTwoId);
  const stationTaTrain = normalizeTrain(form.stationTaBoardTrain);
  const rovingTrain = normalizeTrain(form.rovingTrain);
  const releasedTrains = `${trainOne} and ${trainTwo}`;
  const tsrText = `TSR${form.tsrSpeed || "45"}kph`;

  return [
    `${formatHrs(form.alarmTime)} - Code ${form.alarmCode} ${form.detectionPoint} Obstacle Detection System ${form.odsAlarm}: Obstacle Detection System Alarm`,
    `${formatHrs(form.alarmTime)} - MAZ protection applied at ${form.mazLocations}. TC applied ${tsrText} at ${form.mazLocations}`,
    `${formatHrs(form.holdTime)} - Code ${form.trainOneCode} ${trainOne} ${normalizeTid(form.trainOneTid)} at ${form.trainOneLocation} ${form.trainOneAlarm}`,
    `${formatHrs(form.holdTime)} - Code ${form.trainUnableCode} ${trainOne} ${normalizeTid(form.trainOneTid)} at ${form.trainOneLocation} ${form.trainUnableRemark}`,
    `${formatHrs(form.holdTime)} - Code ${form.trainTwoCode} ${trainTwo} ${normalizeTid(form.trainTwoTid)} at ${form.trainTwoLocation} ${form.trainTwoAlarm}`,
    `${formatHrs(form.holdTime)} - TC stopped ${releasedTrains} while CCTV playback is ongoing`,
    `${formatHrs(form.scadaTime)} - SCADA cut off pop-up postponed by TC`,
    `${formatHrs(form.taInstructionTime)} - TC instructed ${form.stationTa} to board ${normalizeTid(form.stationTaBoardTid)} ${stationTaTrain} at ${form.stationTaBoardLocation}. ${form.stationTaRemark}`,
    `${formatHrs(form.resetTime)} - ${form.cctvResult}. TC reset ${form.odsAlarm} ${form.resetLocation} alarm. MAZ protection cleared. SCADA cut-off pop up cancelled. TC released stopped with hold ${releasedTrains}`,
    `${formatHrs(form.rovingInstructionTime)} - TC instructed roving TA to board ${normalizeTid(form.rovingTid)} ${rovingTrain} at ${form.rovingFrom} and observe both tracks from ${form.observeSection}`,
    `${formatHrs(form.rovingBoardedTime)} - Roving TA from ${form.rovingFrom} boarded ${rovingTrain}`,
    `${formatHrs(form.rovingReportTime)} - TA ${rovingTrain} reported ${form.rovingReportResult}`,
    `${formatHrs(form.tsrRemovedTime)} - ${tsrText} ${form.mazLocations} removed`,
    formatSr(form.srNumber),
  ].join("\n");
}

function FieldInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8ebfe3]">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-lg border border-[#1d4363] bg-[#061827] px-3 text-sm text-white outline-none transition placeholder:text-[#54718a] focus:border-[#64b5f6] focus:ring-2 focus:ring-[#64b5f6]/20"
      />
    </label>
  );
}

export default function Home() {
  const [odsForm, setOdsForm] = useState(DEFAULT_ODS_FORM);
  const [copied, setCopied] = useState(false);
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const outputLog = useMemo(() => buildOdsLog(odsForm), [odsForm]);

  const updateField = (key, value) => {
    setOdsForm((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(outputLog);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
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

      <main className="mx-auto min-h-[calc(100vh-56px)] w-full max-w-[1900px] px-4 py-5 lg:px-6">
        <section className="rounded-2xl border border-[#1d4363] bg-[#0a2236]/95 shadow-2xl shadow-black/20">
          <div className="border-b border-[#1d4363] bg-gradient-to-r from-[#0d3655] via-[#0a2b47] to-[#071828] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-[#3f6f8f] bg-[#0e3554] p-2.5 shadow-lg shadow-black/20">
                  <ShieldAlert className="h-5 w-5 text-[#8fd3ff]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white">
                    ODS Activation Scenario
                  </h1>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-[#a9c7dc]">
                    Fill in alarm time, MAZ / TSR location, affected trains, CCTV result, reset time,
                    roving TA check and SR number. Output follows the TC2 01/05/2026 ODS log style.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOdsForm(DEFAULT_ODS_FORM);
                    setCopied(false);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#2a536f] bg-[#071828] px-3 py-2 text-xs font-semibold text-[#cfe7f7] transition hover:border-[#6aaad3] hover:bg-[#0b2b45]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset sample
                </button>
                <button
                  type="button"
                  onClick={copyOutput}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#5a9fca] bg-[#10517a] px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#176695]"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {copied ? "Copied" : "Copy output"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="rounded-2xl border border-[#1d4363] bg-[#071828]/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7eb8e0]">
                User input checklist
              </p>
              <div className="mt-3 grid gap-2 text-sm text-[#d7ecfb] md:grid-cols-2 xl:grid-cols-3">
                <p>• ODS alarm code / point / alarm name.</p>
                <p>• MAZ and TSR location.</p>
                <p>• Affected train IDs, TIDs, location and alarm codes.</p>
                <p>• CCTV result, reset time and release action.</p>
                <p>• Station TA / roving TA observation details.</p>
                <p>• TSR removal time and SR number.</p>
              </div>
            </div>

            {FIELD_GROUPS.map((group) => (
              <div key={group.title} className="rounded-2xl border border-[#1d4363] bg-[#071828]/80 p-4">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-[#d9f1ff]">
                  {group.title}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {group.fields.map(([key, label]) => (
                    <FieldInput
                      key={key}
                      label={label}
                      value={odsForm[key]}
                      onChange={(value) => updateField(key, value)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <section className="rounded-2xl border border-[#2a536f] bg-[#061827] p-4 shadow-xl shadow-black/20">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#d9f1ff]">
                    Generated ODS Log Output
                  </h2>
                  <p className="mt-1 text-xs text-[#87aeca]">Same structure as TC2-01052026-17.</p>
                </div>
                <button
                  type="button"
                  onClick={copyOutput}
                  className="shrink-0 rounded-lg border border-[#2a536f] bg-[#0a2b45] px-3 py-1.5 text-xs font-semibold text-[#d7ecfb] transition hover:border-[#6aaad3]"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <pre className="min-h-[360px] overflow-x-auto whitespace-pre rounded-xl border border-[#163854] bg-[#020f1b] p-4 font-mono text-[12px] leading-6 text-[#e8f7ff] shadow-inner shadow-black/30">
{outputLog}
              </pre>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
