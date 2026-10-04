import { useState } from "react";
import Modal from "./Modal";
import FormField from "./FormField";
import Button from "./Button";
import { STATUSES } from "../constants/statuses";

export default function EquipmentForm({ item, onSave, onClose }) {
  const [form, setForm] = useState({
    name: item?.name || "",
    type: item?.type || "",
    location: item?.location || "",
    status: item?.status || "Active",
    installedDate: item?.installedDate || new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.type.trim() || !form.location.trim()) {
      setError("Name, Type, and Location are required.");
      return;
    }
    setError("");
    onSave({ ...form, id: item?.id });
    onClose();
  };

  return (
    <Modal title={item ? `Edit ${item.name}` : "Register New Equipment"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <FormField label="Equipment Name">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            placeholder="e.g. Generator A"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Equipment Type">
            <input
              type="text"
              required
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              placeholder="e.g. Pump"
            />
          </FormField>

          <FormField label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Physical Location">
          <input
            type="text"
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            placeholder="e.g. Plant 1 · Bay 2"
          />
        </FormField>

        <FormField label="Installation Date">
          <input
            type="date"
            required
            value={form.installedDate}
            onChange={(e) => setForm({ ...form, installedDate: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
        </FormField>

        <div className="mt-6 flex justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {item ? "Save Changes" : "Register Equipment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
