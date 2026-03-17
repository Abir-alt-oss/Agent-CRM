import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarOpen: true,
    toast: null,
  },
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    showToast(state, action) {
      state.toast = action.payload;
      // { message: '...', type: 'success' | 'error' | 'warning' }
    },
    hideToast(state) {
      state.toast = null;
    },
  },
});

export const { toggleSidebar, showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
