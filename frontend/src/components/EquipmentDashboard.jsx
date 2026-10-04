import { useState } from "react";
import { useEquipmentData } from "../hooks/useEquipmentData";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { Activity, Bell, Plus, Pencil, X, ArrowLeft, Check, Radio, LayoutGrid } from "lucide-react";
import { LIMITS, UNITS, METRIC_NAMES as METRICS } from "../constants/metrics";
import { STATUSES, STATUS_COLORS as ST_COLORS } from "../constants/statuses";
import { formatNumber as fmt } from "../utils/format";

const ST = {
  Active: [ST_COLORS.Active.dot, ST_COLORS.Active.badge],
  Idle: [ST_COLORS.Idle.dot, ST_COLORS.Idle.badge],
  Faulty: [ST_COLORS.Faulty.dot, ST_COLORS.Faulty.badge],
  "Under Maintenance": [ST_COLORS["Under Maintenance"].dot, ST_COLORS["Under Maintenance"].badge],
};

/* ---------- small pieces ---------- */
const Chip = ({ s }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${ST[s][1]}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${ST[s][0]}`} />
    {s}
  </span>
);
const AlertBadge = ({ n }) =>
  n > 0 ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
      <Bell size={12} /> {n} Active {n === 1 ? "Alert" : "Alerts"}
    </span>
  ) : (
    <span className="text-xs text-slate-400">No alerts</span>
  );
const over = (m, v) => LIMITS[m] && v > LIMITS[m];
const Val = ({ m, v }) => (
  <span className={`tabular-nums ${over(m, v) ? "font-semibold text-red-600" : "text-slate-800"}`}>
    {fmt(v)} <span className="text-xs font-normal text-slate-400">{UNITS[m]}</span>
  </span>
);
const AlertText = ({ a, name }) => (
  <>
    {name && <b>{name}: </b>}
    {a.metric[0].toUpperCase() + a.metric.slice(1)} {a.kind === "Min" ? "fell below" : "exceeded"} {a.threshold}
    {UNITS[a.metric]} <span className="text-slate-500">(reached {fmt(a.value)})</span>
  </>
);
const Btn = ({ kind = "ghost", ...p }) => (
  <button
    {...p}
    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${kind === "primary" ? "bg-brand-mint text-brand-navy hover:bg-brand-green" : "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50"
      }`}
  />
);

/* ---------- views ---------- */
function Dashboard({ db, open, counts, onSelect, onEdit, onAdd }) {
  const [filter, setFilter] = useState(null);
  const rows = db.equipment.filter((e) => !filter || e.status === filter);
  return (
    <div>
      <div className="mb-5 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-brand-mint">LIVE FLEET STATUS</p><h1 className="text-3xl font-bold text-white">Equipment <span className="text-brand-mint">Intelligence</span></h1>
          <p className="text-sm text-slate-400">{db.equipment.length} machines across all plants. Values update live.</p>
        </div>
        <Btn kind="primary" onClick={onAdd}><Plus size={16} /> Add equipment</Btn>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(filter === s ? null : s)}
            className={`rounded-2xl bg-white p-4 text-left ring-1 transition ${filter === s ? "ring-2 ring-brand-mint" : "ring-slate-200 hover:ring-slate-400"}`}>
            <div className="flex items-center gap-2 text-sm text-slate-500"><span className={`h-2 w-2 rounded-full ${ST[s][0]}`} />{s}</div>
            <div className="mt-1 text-3xl font-semibold tabular-nums">{counts[s]}</div>
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-slate-200">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-slate-200 text-left text-slate-500">
            <tr>{["Machine", "Status", "Temperature", "Vibration", "Pressure", "Alerts", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((e) => {
              const r = db.readings[e.id]?.at(-1);
              const n = open.filter((a) => a.equipmentId === e.id).length;
              return (
                <tr key={e.id} onClick={() => onSelect(e.id)} className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3"><div className="font-medium">{e.name}</div><div className="text-xs text-slate-500">{e.type} · {e.location}</div></td>
                  <td className="px-4 py-3"><Chip s={e.status} /></td>
                  {["temperature", "vibration", "pressure"].map((m) => <td key={m} className="px-4 py-3">{r ? <Val m={m} v={r[m]} /> : "—"}</td>)}
                  <td className="px-4 py-3"><AlertBadge n={n} /></td>
                  <td className="px-4 py-3 text-right">
                    <button aria-label={`Edit ${e.name}`} onClick={(ev) => { ev.stopPropagation(); onEdit(e); }} className="rounded p-1.5 text-slate-500 hover:bg-slate-200"><Pencil size={15} /></button>
                  </td>
                </tr>
              );
            })}
            {!rows.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">{filter ? "No machines with this status. Clear the filter to see all equipment." : "No equipment yet. Add your first machine to start monitoring."}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Detail({ db, id, onBack, onEdit }) {
  const [metric, setMetric] = useState("temperature");
  const e = db.equipment.find((x) => x.id === id);
  if (!e) return null;
  const data = (db.readings[id] || []).slice(-30);
  const last = data.at(-1);
  const history = db.alerts.filter((a) => a.equipmentId === id);
  return (
    <div>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"><ArrowLeft size={15} /> All equipment</button>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">{e.name}</h1>
          <p className="text-sm text-slate-400">{e.type} · {e.location} · Installed {e.installedDate}</p>
        </div>
        <div className="flex items-center gap-3"><Chip s={e.status} /><Btn onClick={() => onEdit(e)}><Pencil size={14} /> Edit</Btn></div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {METRICS.map((m) => (
          <button key={m} onClick={() => setMetric(m)} className={`rounded-2xl bg-white p-4 text-left ring-1 ${metric === m ? "ring-2 ring-brand-mint" : "ring-slate-200 hover:ring-slate-400"}`}>
            <div className="text-sm capitalize text-slate-500">{m === "runtime" ? "Runtime hours" : m}</div>
            <div className="mt-1 text-2xl">{last ? <Val m={m} v={last[m]} /> : "—"}</div>
          </button>
        ))}
      </div>
      <div className="mb-5 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
        <div className="mb-2 text-sm font-medium capitalize">{metric} over the last {data.length} readings</div>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#64748b" }} minTickGap={40} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={["auto", "auto"]} width={40} tickFormatter={(v) => Math.round(v)} />
              <Tooltip formatter={(v) => [`${fmt(v)} ${UNITS[metric]}`, metric]} />
              {LIMITS[metric] && <ReferenceLine y={LIMITS[metric]} stroke="#dc2626" strokeDasharray="5 4" label={{ value: `Limit ${LIMITS[metric]}`, fill: "#dc2626", fontSize: 11, position: "insideTopRight" }} />}
              <Line type="monotone" dataKey={metric} stroke="#1FAE6B" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium">Recent readings</div>
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500"><tr><th className="px-4 py-2 font-medium">Time</th><th className="px-2 py-2 font-medium">Temp</th><th className="px-2 py-2 font-medium">Vib</th><th className="px-2 py-2 font-medium">Press</th></tr></thead>
            <tbody>
              {data.slice(-8).reverse().map((r, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-4 py-2 tabular-nums text-slate-500">{r.t}</td>
                  {["temperature", "vibration", "pressure"].map((m) => <td key={m} className="px-2 py-2"><Val m={m} v={r[m]} /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-4 py-3 text-sm font-medium">Alert history</div>
          <ul className="max-h-72 divide-y divide-slate-100 overflow-auto">
            {history.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                <div><AlertText a={a} /><div className="text-xs text-slate-400">{a.time}</div></div>
                <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${a.status === "Open" ? "bg-red-100 text-red-700" : a.status === "Acknowledged" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}`}>{a.status}</span>
              </li>
            ))}
            {!history.length && <li className="px-4 py-8 text-center text-sm text-slate-500">No alerts yet for this machine.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Alerts({ db, open, setAlert, onSelect }) {
  const name = (id) => db.equipment.find((e) => e.id === id)?.name;
  const resolved = db.alerts.filter((a) => a.status === "Resolved").slice(0, 5);
  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Active <span className="text-brand-mint">alerts</span></h1>
      <p className="mb-5 text-sm text-slate-400">{open.length} need attention. New alerts appear here as they trigger.</p>
      <ul className="space-y-3">
        {open.map((a) => (
          <li key={a.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 border-l-4 ${a.status === "Open" ? "border-l-red-600" : "border-l-amber-500"}`}>
            <button onClick={() => onSelect(a.equipmentId)} className="text-left text-sm hover:underline"><AlertText a={a} name={name(a.equipmentId)} /><div className="text-xs text-slate-400">{a.time} · {a.status}</div></button>
            <div className="flex gap-2">
              {a.status === "Open" && <Btn onClick={() => setAlert(a.id, "Acknowledged")}>Acknowledge</Btn>}
              <Btn kind="primary" onClick={() => setAlert(a.id, "Resolved")}><Check size={14} /> Resolve</Btn>
            </div>
          </li>
        ))}
        {!open.length && <li className="rounded-2xl bg-white p-10 text-center text-slate-500 ring-1 ring-slate-200">All clear. No alerts need attention right now.</li>}
      </ul>
      {resolved.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-slate-400">Recently resolved</h2>
          <ul className="space-y-1 text-sm text-slate-400">{resolved.map((a) => <li key={a.id}><AlertText a={a} name={name(a.equipmentId)} /></li>)}</ul>
        </div>
      )}
    </div>
  );
}

function FormModal({ item, onClose, onSave }) {
  const [f, setF] = useState(item || { name: "", type: "", location: "", status: "Active", installedDate: "" });
  const [err, setErr] = useState(false);
  const set = (k) => (ev) => setF({ ...f, [k]: ev.target.value });
  const input = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500";
  const submit = () => {
    if (!f.name.trim() || !f.type.trim() || !f.location.trim() || !f.installedDate) return setErr(true);
    onSave(f);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{item ? "Edit equipment" : "Add equipment"}</h2>
          <button aria-label="Close" onClick={onClose} className="rounded p-1 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="space-y-3 text-sm">
          <label className="block">Name<input className={input} value={f.name} onChange={set("name")} placeholder="Generator B" /></label>
          <label className="block">Type<input className={input} value={f.type} onChange={set("type")} placeholder="Generator" /></label>
          <label className="block">Location<input className={input} value={f.location} onChange={set("location")} placeholder="Plant 1 · Bay 3" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">Status<select className={input} value={f.status} onChange={set("status")}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
            <label className="block">Installed on<input type="date" className={input} value={f.installedDate} onChange={set("installedDate")} /></label>
          </div>
          {err && <p className="text-red-600">Enter a name, type, location and installed date to save this machine.</p>}
        </div>
        <div className="mt-5 flex justify-end gap-2"><Btn onClick={onClose}>Cancel</Btn><Btn kind="primary" onClick={submit}>{item ? "Save changes" : "Add equipment"}</Btn></div>
      </div>
    </div>
  );
}

/* ---------- app shell ---------- */
export default function EquipmentDashboard() {
  const { db, live, loading, error, setAlert, save } = useEquipmentData();
  const [view, setView] = useState({ name: "dash" });
  const [modal, setModal] = useState(null); // null | {item}
  const open = db.alerts.filter((a) => a.status !== "Resolved");
  const counts = Object.fromEntries(STATUSES.map((s) => [s, db.equipment.filter((e) => e.status === s).length]));
  const go = (name, id) => setView({ name, id });
  const nav = (name, label, Icon, badge) => (
    <button onClick={() => go(name)} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm ${view.name === name || (name === "dash" && view.name === "detail") ? "bg-white/10 text-brand-mint" : "text-slate-300 hover:bg-white/5"}`}>
      <span className="flex items-center gap-2"><Icon size={16} />{label}</span>
      {badge > 0 && <span className="rounded-full bg-red-600 px-2 text-xs font-semibold text-white tabular-nums">{badge}</span>}
    </button>
  );
  return (
    <div className="flex min-h-screen bg-brand-navy text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div className="fixed inset-x-0 top-0 z-40 h-0.5 bg-gradient-to-r from-brand-mint via-brand-green to-transparent" />
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 bg-brand-navy2 p-4 md:flex">
        <div className="mb-6 flex items-center gap-2"><Activity size={22} className="text-brand-mint" /><div><div className="text-sm font-bold tracking-widest text-white">SUSTAINABYTE</div><div className="text-[10px] font-semibold tracking-widest text-brand-mint">EQUIPMENT MONITOR</div></div></div>
        <nav className="space-y-1">{nav("dash", "Equipment", LayoutGrid, 0)}{nav("alerts", "Active alerts", Bell, open.length)}</nav>
        <div className="mt-auto flex items-center gap-2 rounded-md bg-white/5 px-3 py-2 text-xs text-slate-300">
          <Radio size={14} className={live ? "text-emerald-400" : "text-red-400"} />{live ? "Live · SignalR connected" : "Reconnecting…"}
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mb-4 flex gap-2 md:hidden">
          <Btn onClick={() => go("dash")}>Equipment</Btn><Btn onClick={() => go("alerts")}>Alerts ({open.length})</Btn>
        </div>
        {error && <div role="alert" className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>}
        {loading ? <p className="text-slate-300">Loading equipment…</p> : (<>
          {view.name === "dash" && <Dashboard db={db} open={open} counts={counts} onSelect={(id) => go("detail", id)} onEdit={(item) => setModal({ item })} onAdd={() => setModal({ item: null })} />}
          {view.name === "detail" && <Detail db={db} id={view.id} onBack={() => go("dash")} onEdit={(item) => setModal({ item })} />}
          {view.name === "alerts" && <Alerts db={db} open={open} setAlert={setAlert} onSelect={(id) => go("detail", id)} />}
        </>)}
      </main>
      {modal && <FormModal item={modal.item} onClose={() => setModal(null)} onSave={save} />}
    </div>
  );
}