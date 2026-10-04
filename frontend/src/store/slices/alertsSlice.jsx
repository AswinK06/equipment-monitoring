import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAlerts, acknowledgeAlert as apiAcknowledgeAlert, resolveAlert as apiResolveAlert } from "../../api/alertsApi";
import { removeEquipment } from "./equipmentSlice";
import { formatTime } from "../../utils/format";

export const toAlert = (a) => ({
  ...a,
  time: a.createdAt ? formatTime(a.createdAt) : a.time,
});

export const fetchAlerts = createAsyncThunk(
  "alerts/fetchAlerts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAlerts();
      return data.map(toAlert);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const acknowledgeAlert = createAsyncThunk(
  "alerts/acknowledgeAlert",
  async (id, { rejectWithValue }) => {
    try {
      const data = await apiAcknowledgeAlert(id);
      return toAlert(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const resolveAlert = createAsyncThunk(
  "alerts/resolveAlert",
  async (id, { rejectWithValue }) => {
    try {
      const data = await apiResolveAlert(id);
      return toAlert(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    alertReceived: (state, action) => {
      const alert = action.payload;
      if (!state.items.some((item) => item.id === alert.id)) {
        state.items.unshift(alert);
      }
    },
    alertUpdated: (state, action) => {
      const alert = action.payload;
      const index = state.items.findIndex((item) => item.id === alert.id);
      if (index >= 0) {
        state.items[index] = alert;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(acknowledgeAlert.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(resolveAlert.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      .addCase(resolveAlert.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(removeEquipment.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.equipmentId !== action.payload);
      });
  },
});

export const { alertReceived, alertUpdated } = alertsSlice.actions;

export const selectAllAlerts = (state) => state.alerts.items;

export const selectActiveAlerts = (state) =>
  state.alerts.items.filter((item) => item.status !== "Resolved");

export const selectAlertsByEquipment = (idOrState, maybeId) => {
  if (maybeId !== undefined) {
    return idOrState.alerts.items.filter((item) => String(item.equipmentId) === String(maybeId));
  }
  return (state) =>
    state.alerts.items.filter((item) => String(item.equipmentId) === String(idOrState));
};

export default alertsSlice.reducer;
