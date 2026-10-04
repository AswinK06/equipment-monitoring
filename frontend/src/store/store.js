import { configureStore } from "@reduxjs/toolkit";
import equipmentReducer from "./slices/equipmentSlice";
import alertsReducer from "./slices/alertsSlice";
import readingsReducer from "./slices/readingsSlice";

export const store = configureStore({
  reducer: {
    equipment: equipmentReducer,
    alerts: alertsReducer,
    readings: readingsReducer,
  },
});

export default store;
