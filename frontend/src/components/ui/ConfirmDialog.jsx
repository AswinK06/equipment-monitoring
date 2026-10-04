import Modal from "./Modal";
import Button from "./Button";
import ErrorMessage from "./ErrorMessage";

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}) {
  const handleClose = loading ? () => {} : onCancel;

  return (
    <Modal title={title} onClose={handleClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        {error && <ErrorMessage message={error} />}
      </div>
      <div className="mt-8 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Deleting…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
