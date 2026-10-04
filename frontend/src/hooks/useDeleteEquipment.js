import { useState } from "react";
import { useDispatch } from "react-redux";
import { removeEquipment } from "../store/slices/equipmentSlice";

export function useDeleteEquipment() {
  const dispatch = useDispatch();
  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const requestDelete = (item) => {
    setTarget(item);
    setError(null);
  };

  const cancelDelete = () => {
    if (!deleting) {
      setTarget(null);
      setError(null);
    }
  };

  const confirmDelete = async () => {
    if (!target) return;
    setDeleting(true);
    try {
      await dispatch(removeEquipment(target.id)).unwrap();
      setTarget(null);
    } catch (e) {
      setError(e.message || "Could not delete the equipment. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return { target, deleting, error, requestDelete, cancelDelete, confirmDelete };
}
