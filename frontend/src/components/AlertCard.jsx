import Button from "./Button";
import StatusBadge from "./StatusBadge";

export default function AlertCard({ alert, equipmentName, onAcknowledge, onResolve, onOpen }) {
  const isOpen = alert.status === "Open";
  const isAck = alert.status === "Acknowledged";

  const cardStyle = isOpen
    ? "bg-red-50/70 border-red-200"
    : isAck
    ? "bg-amber-50/70 border-amber-200"
    : "bg-emerald-50/70 border-emerald-200";

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${cardStyle}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {equipmentName && (
              <button
                type="button"
                onClick={() => onOpen?.(alert.equipmentId)}
                className="font-bold text-brand-navy hover:text-brand-green hover:underline text-sm"
              >
                {equipmentName}
              </button>
            )}
            <StatusBadge status={alert.status} />
          </div>
          <p className="text-xs font-semibold text-slate-700">
            {alert.metric} {alert.kind === "Max" || alert.kind === 1 ? "exceeded" : "breached"} threshold:{" "}
            <span className="font-bold text-red-600">{alert.value}</span> (threshold:{" "}
            {alert.threshold})
          </p>
          <p className="text-[11px] text-slate-400">Triggered at {alert.time || alert.createdAt}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isOpen && (
            <Button
              variant="secondary"
              onClick={() => onAcknowledge?.(alert.id)}
              className="text-xs py-1.5 px-3"
            >
              Acknowledge
            </Button>
          )}
          {(isOpen || isAck) && (
            <Button
              variant="primary"
              onClick={() => onResolve?.(alert.id)}
              className="text-xs py-1.5 px-3"
            >
              Resolve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
