import { createSlice, createAsyncThunk, createSelector } from "@reduxjs/toolkit";
import {
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} from "../../api/equipmentApi";
import { STATUSES } from "../../constants/statuses";

export const toEquipment = (e) => ({
  ...e,
  status: e.status === "UnderMaintenance" ? "Under Maintenance" : e.status,
  updatedAt: e.updatedAt,
});

export const toApiStatus = (s) => (s ? s.replace(" ", "") : s);

export const fetchEquipment = createAsyncThunk(
  "equipment/fetchEquipment",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getEquipment();
      return data.map(toEquipment);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveEquipment = createAsyncThunk(
  "equipment/saveEquipment",
  async (eq, { rejectWithValue }) => {
    try {
      const payload = {
        name: eq.name,
        type: eq.type,
        location: eq.location,
        status: toApiStatus(eq.status),
        installedDate: eq.installedDate,
      };
      const result = eq.id ? await updateEquipment(eq.id, payload) : await createEquipment(payload);
      return toEquipment(result);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeEquipment = createAsyncThunk("equipment/remove", async (id) => {
  await deleteEquipment(id);
  return id;
});

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const equipmentSlice = createSlice({
  name: "equipment",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(saveEquipment.pending, (state) => {
        state.error = null;
      })
      .addCase(saveEquipment.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(saveEquipment.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(removeEquipment.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const selectAllEquipment = createSelector([(state) => state.equipment.items], (items) => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.updatedAt || 0).getTime();
    const dateB = new Date(b.updatedAt || 0).getTime();
    if (dateB !== dateA) {
      return dateB - dateA;
    }
    return (a.id ?? 0) - (b.id ?? 0);
  });
});

export const selectEquipmentById = (idOrState, maybeId) => {
  if (maybeId !== undefined) {
    return idOrState.equipment.items.find((item) => String(item.id) === String(maybeId));
  }
  return (state) => state.equipment.items.find((item) => String(item.id) === String(idOrState));
};

export const selectStatusCounts = (state) => {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const item of state.equipment.items) {
    if (counts[item.status] !== undefined) {
      counts[item.status]++;
    }
  }
  return counts;
};

export default equipmentSlice.reducer;
