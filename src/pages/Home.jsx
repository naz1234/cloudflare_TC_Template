import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clipboard,
  ClipboardCheck,
  FileText,
  RefreshCcw,
  ShieldAlert,
} from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/69fd0add5545130d2d15d03c/456db1150_ChatGPTImageMay15202605_49_31PM.png";

const initialForm = {
  activationTime: "",
  alarmCode: "",
  odsAlarm: "",
  location: "",
  mazTime: "",
  affectedTcs: "",
  stopTime: "",
  stoppedTrains: "",
  relatedAlarmLogs: "",
  scadaTime: "",
  scName: "SC",
  cctvInstructionTime: "",
  clearanceTime: "",
  resetTime: "",
  resetAlarm: "",
  releaseTime: "",
  taInstructionTime: "",
  rovingTaTrain: "",
  taBoardLocation: "",
  observeFrom: "",
  observeTo: "",
  taBoardedTime: "",
  taReportTime: "",
  taReportTrain: "",
  tsrRemovedTime: "",
  srNumber: "",
};

const sampleForm = {
  activationTime: "14:36",
  alarmCode: "Code W283",
  odsAlarm: "3J1_ODS3T1 / ODS3T2",
  location: "3J1",
  mazTime: "14:36",
  affectedTcs: "TC2004 and TC2003",
  stopTime: "14:37",
  stoppedTrains: "T18 and T41",
  relatedAlarmLogs:
    "14:37 hrs – Code V606 T18 TID206 at 3J1 TC2004 EB application due to slide-controlled EB.\n14:37 hrs – Code V141 T18 TID206 at 3J1 TC2004 train unable to run.\n14:37 hrs – Code V692 T41 TID209 at 3J1 TC2001 FSB application.",
  scadaTime: "14:37",
  scName: "SC",
  cctvInstructionTime: "14:38",
  clearanceTime: "14:40",
  resetTime: "14:40",
  resetAlarm: "ODS3T2 3J1",
  releaseTime: "14:40",
  taInstructionTime: "14:40",
  rovingTaTrain: "TID101 T43",
  taBoardLocation: "3G2 PF1",
  observeFrom: "3H1",
  observeTo: "3J1",
  taBoardedTime: "14:41",
  taReportTime: "14:47",
  taReportTrain: "T43",
  tsrRemovedTime: "14:48",
  srNumber: "10115146",
};

function valueOrBlank(value, fallback = "_____") {
  const text = String(value || "").trim();
  return text || fallback;
}

function timePrefix(time) {
  const text = String(time || "").trim();
  return text ? `${text} hrs` : "____ hrs";
}

function logLine(time, text) {
  return `${timePrefix(time)} – ${text}`;
}

function formatPastedLog(raw) {
  const text = String(raw || "").trim();
  if (!text) return "";

  return text
    .replace(/^\s*(\d{1,2}:\d{2})\s*hrs\s*[-–]\s*/i, "$1 hrs – ")
    .replace(/^\s*(\d{1,2}:\d{2})\s*[-–]\s*/i, "$1 hrs – ");
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#87afd0]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-[#1c4563] bg-[#071828]/80 px-3 text-sm text-white outline-none transition placeholder:text-[#5d7f9a] focus:border-[#4f9ee8] focus:ring-2 focus:ring-[#4f9ee8]/20"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <label className="block space-y-1.5 md:col-span-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#87afd0]">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-[#1c4563] bg-[#071828]/80 px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-[#5d7f9a] focus:border-[#4f9ee8] focus:ring-2 focus:ring-[#4f9ee8]/20"
      />
    </label>
  );
}

function SectionCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-[#173a56] bg-[#082037]/70 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-white">
        <span className="h-2 w-2 rounded-full bg-[#5fb0f2] shadow-[0_0_18px_rgba(95,176,242,0.75)]" />
        {title}
      </h3>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

export default function Home() {
  const [form, setForm] = useState(initialForm);
  const [copyStatus, setCopyStatus] = useState("Copy Log");

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const generatedLog = useMemo(() => {
    const affectedTcs = valueOrBlank(form.affectedTcs, "affected track circuits");
    const stoppedTrains = valueOrBlank(form.stoppedTrains, "affected trains");
    const location = valueOrBlank(form.location, "affected location");
    const scName = valueOrBlank(form.scName, "SC");
    const resetAlarm = valueOrBlank(form.resetAlarm || form.odsAlarm, "ODS alarm");
    const rovingTaTrain = valueOrBlank(form.rovingTaTrain, "assigned train");
    const taBoardLocation = valueOrBlank(form.taBoardLocation, "assigned platform");
    const observeFrom = valueOrBlank(form.observeFrom, "start section");
    const observeTo = valueOrBlank(form.observeTo, "end section");
    const taReportTrain = valueOrBlank(form.taReportTrain || form.rovingTaTrain, "assigned train");
    const relatedAlarmLogs = form.relatedAlarmLogs
      .split("\n")
      .map(formatPastedLog)
      .filter(Boolean);

    const lines = [
      "ODS Activated – No Visible Obstacle Observed from Live CCTV and Playback",
      "",
      logLine(
        form.activationTime,
        `${valueOrBlank(form.alarmCode, "Code _____")} ${valueOrBlank(
          form.odsAlarm,
          "ODS alarm"
        )} Obstacle Detection System alarm received.`
      ),
      "",
      "",
      "All Approaching Trains Held / Stopped and TSR 45 kph Applied",
      "",
      logLine(
        form.mazTime,
        `MAZ protection applied at ${affectedTcs}. TSR 45 kph applied at ${affectedTcs}.`
      ),
    ];

    if (relatedAlarmLogs.length) {
      lines.push("", ...relatedAlarmLogs);
    }

    lines.push(
      "",
      logLine(form.stopTime, `TC stopped ${stoppedTrains} while CCTV playback was ongoing.`),
      "",
      "",
      "SCADA Pop-Up Postponed Pending Track Clearance Confirmation",
      "",
      logLine(
        form.scadaTime,
        "SCADA cut-off pop-up postponed by TC pending track clearance confirmation via Live CCTV and CCTV playback."
      ),
      "",
      "",
      "CCTV Playback Reviewed and Track Clearance Confirmed",
      "",
      logLine(
        form.cctvInstructionTime,
        `TC informed ${scName} to check the CCTV trigger on ODP and review CCTV playback 3 minutes prior to the ODS activation.`
      ),
      "",
      logLine(
        form.clearanceTime,
        `No trespasser or obstruction observed via Live CCTV and CCTV playback. Track clearance confirmed at ${location}.`
      ),
      "",
      "",
      "ODS Reset and MAZ Protection Cleared",
      "",
      logLine(
        form.resetTime,
        `TC reset ${resetAlarm} alarm via ATS. MAZ protection cleared and SCADA cut-off pop-up cancelled.`
      ),
      "",
      "",
      "Normalisation / Train Movement Resumed",
      "",
      logLine(form.releaseTime, `TC released stopped trains ${stoppedTrains} under TSR 45 kph.`),
      "",
      logLine(
        form.taInstructionTime,
        `TC instructed roving TA to board ${rovingTaTrain} at ${taBoardLocation} and observe both tracks from ${observeFrom} to ${observeTo}.`
      ),
      "",
      logLine(form.taBoardedTime, `Roving TA boarded ${rovingTaTrain} at ${taBoardLocation}.`),
      "",
      logLine(
        form.taReportTime,
        `TA onboard ${taReportTrain} reported both tracks clear with no abnormalities found.`
      ),
      "",
      logLine(form.tsrRemovedTime, `TSR 45 kph at ${affectedTcs} removed.`),
      "",
      `SR ${valueOrBlank(form.srNumber, "_____")}`
    );

    return lines.join("\n");
  }, [form]);

  const copyLog = async () => {
    try {
      await navigator.clipboard.writeText(generatedLog);
      setCopyStatus("Copied");
      window.setTimeout(() => setCopyStatus("Copy Log"), 1500);
    } catch (error) {
      setCopyStatus("Copy Failed");
      window.setTimeout(() => setCopyStatus("Copy Log"), 1500);
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

      <main className="min-h-[calc(100vh-56px)] px-4 py-6 lg:px-6">
        <div className="mx-auto max-w-[1500px] space-y-5">
          <section className="overflow-hidden rounded-3xl border border-[#173a56] bg-gradient-to-br from-[#0c2a45] via-[#081e34] to-[#061524] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="border-b border-[#173a56] px-5 py-4 lg:px-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#27628e] bg-[#0c3354] shadow-[0_0_24px_rgba(74,156,230,0.25)]">
                    <ShieldAlert className="h-5 w-5 text-[#86c7ff]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7eb8e0]">
                      Main Page Generator
                    </p>
                    <h1 className="mt-1 text-xl font-black tracking-tight text-white lg:text-2xl">
                      ODS Activation Log Generator
                    </h1>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-[#9fbed8]">
                      Fill in the blanks only. The TC log output will update automatically with the approved section titles.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setForm(sampleForm)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#2a5d82] bg-[#0b2a45] px-4 text-sm font-semibold text-[#c7e8ff] transition hover:bg-[#103a5d]"
                  >
                    <FileText className="h-4 w-4" />
                    Load Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(initialForm)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#2a5d82] bg-[#071828] px-4 text-sm font-semibold text-[#c7e8ff] transition hover:bg-[#103a5d]"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(480px,0.9fr)] lg:p-6">
              <div className="space-y-4">
                <SectionCard title="ODS / MAZ Details">
                  <Field
                    label="Activation Time"
                    value={form.activationTime}
                    onChange={(value) => updateField("activationTime", value)}
                    placeholder="14:36"
                  />
                  <Field
                    label="Alarm Code"
                    value={form.alarmCode}
                    onChange={(value) => updateField("alarmCode", value)}
                    placeholder="Code W283"
                  />
                  <Field
                    label="ODS Alarm"
                    value={form.odsAlarm}
                    onChange={(value) => updateField("odsAlarm", value)}
                    placeholder="3J1_ODS3T1 / ODS3T2"
                  />
                  <Field
                    label="Location"
                    value={form.location}
                    onChange={(value) => updateField("location", value)}
                    placeholder="3J1"
                  />
                  <Field
                    label="MAZ / TSR Applied Time"
                    value={form.mazTime}
                    onChange={(value) => updateField("mazTime", value)}
                    placeholder="14:36"
                  />
                  <Field
                    label="Affected Track Circuits"
                    value={form.affectedTcs}
                    onChange={(value) => updateField("affectedTcs", value)}
                    placeholder="TC2004 and TC2003"
                  />
                </SectionCard>

                <SectionCard title="Train Hold / Related Alarms">
                  <Field
                    label="Stopped / Held Time"
                    value={form.stopTime}
                    onChange={(value) => updateField("stopTime", value)}
                    placeholder="14:37"
                  />
                  <Field
                    label="Stopped / Held Trains"
                    value={form.stoppedTrains}
                    onChange={(value) => updateField("stoppedTrains", value)}
                    placeholder="T18 and T41"
                  />
                  <TextAreaField
                    label="Related ATS / Train Alarm Logs"
                    value={form.relatedAlarmLogs}
                    onChange={(value) => updateField("relatedAlarmLogs", value)}
                    placeholder="14:37 hrs – Code V606 T18 TID206 at 3J1 TC2004 EB application due to slide-controlled EB."
                    rows={5}
                  />
                </SectionCard>

                <SectionCard title="SCADA / CCTV / Reset">
                  <Field
                    label="SCADA Pop-Up Postponed Time"
                    value={form.scadaTime}
                    onChange={(value) => updateField("scadaTime", value)}
                    placeholder="14:37"
                  />
                  <Field
                    label="SC Name / Role"
                    value={form.scName}
                    onChange={(value) => updateField("scName", value)}
                    placeholder="SC"
                  />
                  <Field
                    label="CCTV Instruction Time"
                    value={form.cctvInstructionTime}
                    onChange={(value) => updateField("cctvInstructionTime", value)}
                    placeholder="14:38"
                  />
                  <Field
                    label="Track Clearance Confirmed Time"
                    value={form.clearanceTime}
                    onChange={(value) => updateField("clearanceTime", value)}
                    placeholder="14:40"
                  />
                  <Field
                    label="ODS Reset Time"
                    value={form.resetTime}
                    onChange={(value) => updateField("resetTime", value)}
                    placeholder="14:40"
                  />
                  <Field
                    label="ODS Alarm Reset"
                    value={form.resetAlarm}
                    onChange={(value) => updateField("resetAlarm", value)}
                    placeholder="ODS3T2 3J1"
                  />
                </SectionCard>

                <SectionCard title="Normalisation / TA Observation">
                  <Field
                    label="Train Release Time"
                    value={form.releaseTime}
                    onChange={(value) => updateField("releaseTime", value)}
                    placeholder="14:40"
                  />
                  <Field
                    label="TA Instruction Time"
                    value={form.taInstructionTime}
                    onChange={(value) => updateField("taInstructionTime", value)}
                    placeholder="14:40"
                  />
                  <Field
                    label="Roving TA Board Train"
                    value={form.rovingTaTrain}
                    onChange={(value) => updateField("rovingTaTrain", value)}
                    placeholder="TID101 T43"
                  />
                  <Field
                    label="TA Board Location"
                    value={form.taBoardLocation}
                    onChange={(value) => updateField("taBoardLocation", value)}
                    placeholder="3G2 PF1"
                  />
                  <Field
                    label="Observe From"
                    value={form.observeFrom}
                    onChange={(value) => updateField("observeFrom", value)}
                    placeholder="3H1"
                  />
                  <Field
                    label="Observe To"
                    value={form.observeTo}
                    onChange={(value) => updateField("observeTo", value)}
                    placeholder="3J1"
                  />
                  <Field
                    label="TA Boarded Time"
                    value={form.taBoardedTime}
                    onChange={(value) => updateField("taBoardedTime", value)}
                    placeholder="14:41"
                  />
                  <Field
                    label="TA Report Time"
                    value={form.taReportTime}
                    onChange={(value) => updateField("taReportTime", value)}
                    placeholder="14:47"
                  />
                  <Field
                    label="TA Report Train"
                    value={form.taReportTrain}
                    onChange={(value) => updateField("taReportTrain", value)}
                    placeholder="T43"
                  />
                  <Field
                    label="TSR Removed Time"
                    value={form.tsrRemovedTime}
                    onChange={(value) => updateField("tsrRemovedTime", value)}
                    placeholder="14:48"
                  />
                  <Field
                    label="SR Number"
                    value={form.srNumber}
                    onChange={(value) => updateField("srNumber", value)}
                    placeholder="10115146"
                  />
                </SectionCard>
              </div>

              <aside className="lg:sticky lg:top-[76px] lg:h-[calc(100vh-92px)]">
                <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#173a56] bg-[#04111f] shadow-[0_18px_55px_rgba(0,0,0,0.38)]">
                  <div className="flex items-center justify-between border-b border-[#173a56] bg-[#092138] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clipboard className="h-4 w-4 text-[#86c7ff]" />
                      <h2 className="text-sm font-black uppercase tracking-[0.12em] text-white">
                        Generated Log Output
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={copyLog}
                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#2a5d82] bg-[#0c3354] px-3 text-xs font-bold text-[#dff3ff] transition hover:bg-[#12466d]"
                    >
                      <ClipboardCheck className="h-3.5 w-3.5" />
                      {copyStatus}
                    </button>
                  </div>

                  <pre className="min-h-[520px] flex-1 overflow-auto whitespace-pre-wrap p-4 font-mono text-[13px] leading-6 text-[#d8ebfb]">
                    {generatedLog}
                  </pre>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
