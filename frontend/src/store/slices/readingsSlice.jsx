import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getReadings } from "../../api/equipmentApi";
import { removeEquipment } from "./equipmentSlice";
import { rowsFromHistory, addSample } from "../../utils/readings";

export const fetchReadings = createAsyncThunk(
  "readings/fetchReadings",
  async (equipmentId, { rejectWithValue }) => {
    try {
      const data = await getReadings(equipmentId, 200);
      return {
        equipmentId,
        readings: rowsFromHistory(data),
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  byEquipmentId: {},
  error: null,
};

const readingsSlice = createSlice({
  name: "readings",
  initialState,
  reducers: {
    readingsReceived: (state, action) => {
      const { equipmentId, timestamp, readings, metrics } = action.payload;
      const current = state.byEquipmentId[equipmentId] || [];
      let sampleMetrics = metrics;
      if (!sampleMetrics) {
        if (Array.isArray(readings)) {
          sampleMetrics = Object.fromEntries(readings.map((r) => [r.metric, r.value]));
        } else {
          sampleMetrics = readings || {};
        }
      }
      state.byEquipmentId[equipmentId] = addSample(current, timestamp, sampleMetrics);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReadings.fulfilled, (state, action) => {
        state.byEquipmentId[action.payload.equipmentId] = action.payload.readings;
      })
      .addCase(fetchReadings.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      })
      .addCase(removeEquipment.fulfilled, (state, action) => {
        delete state.byEquipmentId[action.payload];
      });
  },
});

export const { readingsReceived } = readingsSlice.actions;

export const selectReadingsByEquipment = (idOrState, maybeId) => {
  if (maybeId !== undefined) {
    return idOrState.readings.byEquipmentId[maybeId] || [];
  }
  return (state) => state.readings.byEquipmentId[idOrState] || [];
};

export const selectLatestReading = (idOrState, maybeId) => {
  if (maybeId !== undefined) {
    const history = idOrState.readings.byEquipmentId[maybeId] || [];
    return history.at(-1) || {};
  }
  return (state) => {
    const history = state.readings.byEquipmentId[idOrState] || [];
    return history.at(-1) || {};
  };
};

export default readingsSlice.reducer;
