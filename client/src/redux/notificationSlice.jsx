// redux/notifications/notificationsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  message: null,
  type: null, // "success" | "error"
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotification: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    clearNotification: (state) => {
      state.message = null;
      state.type = null;
    },
  },
});

export const { setNotification, clearNotification } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;
