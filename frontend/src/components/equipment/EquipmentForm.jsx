import { useState } from "react";
import Modal from "../ui/Modal";
import FormField from "../ui/FormField";
import Button from "../ui/Button";
import { STATUSES } from "../../constants/statuses";

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

  const inputClass =
    "w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-green focus:outline-none";

  return (
    <Modal title={item ? `Edit ${item.name}` : "Register New Equipment"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <FormField label="Equipment Name">
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
            placeholder="e.g. Generator A"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Equipment Type">
            <input
              type="text"
              required
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className={inputClass}
              placeholder="e.g. Pump"
            />
          </FormField>

          <FormField label="Status">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputClass}
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
            className={inputClass}
            placeholder="e.g. Plant 1 · Bay 2"
          />
        </FormField>

        <FormField label="Installation Date">
          <input
            type="date"
            required
            value={form.installedDate}
            onChange={(e) => setForm({ ...form, installedDate: e.target.value })}
            className={inputClass}
          />
        </FormField>

        <div className="mt-8 flex justify-end gap-3">
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
