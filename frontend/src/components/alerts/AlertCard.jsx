import { useAuth } from "../../hooks/useAuth";
import { isAdmin } from "../../utils/roles";
import Button from "../ui/Button";
import StatusBadge from "../ui/StatusBadge";

export default function AlertCard({ alert, equipmentName, onAcknowledge, onResolve, onOpen }) {
  const { user } = useAuth();
  const canAct = isAdmin(user);

  const isOpen = alert.status === "Open";
  const isAck = alert.status === "Acknowledged";

  const cardStyle = isOpen
    ? "bg-red-50/60 border-red-200"
    : isAck
    ? "bg-amber-50/60 border-amber-200"
    : "bg-emerald-50/60 border-emerald-200";

  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${cardStyle}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            {equipmentName && (
              <button
                type="button"
                onClick={() => onOpen?.(alert.equipmentId)}
                className="font-bold text-brand-navy hover:text-brand-green hover:underline text-base"
              >
                {equipmentName}
              </button>
            )}
            <StatusBadge status={alert.status} />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {alert.metric} {alert.kind === "Max" || alert.kind === 1 ? "exceeded" : "breached"} threshold:{" "}
            <span className="font-bold text-red-600">{alert.value}</span> (threshold:{" "}
            {alert.threshold})
          </p>
          <p className="text-xs text-slate-400">Triggered at {alert.time || alert.createdAt}</p>
        </div>

        {canAct && (
          <div className="flex items-center gap-3 shrink-0">
            {isOpen && (
              <Button
                variant="secondary"
                onClick={() => onAcknowledge?.(alert.id)}
              >
                Acknowledge
              </Button>
            )}
            {(isOpen || isAck) && (
              <Button
                variant="primary"
                onClick={() => onResolve?.(alert.id)}
              >
                Resolve
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
