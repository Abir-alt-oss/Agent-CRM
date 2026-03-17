import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Récupérer les rappels non lus
export const fetchRappels = createAsyncThunk(
  "rappels/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/rappels");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Marquer un rappel comme lu
export const marquerLu = createAsyncThunk(
  "rappels/marquerLu",
  async (id, { rejectWithValue }) => {
    try {
      await api.put(`/rappels/${id}/lu`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Marquer tous les rappels comme lus
export const marquerTousLus = createAsyncThunk(
  "rappels/marquerTousLus",
  async (_, { rejectWithValue }) => {
    try {
      await api.put("/rappels/lu-tout");
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const rappelsSlice = createSlice({
  name: "rappels",
  initialState: {
    list: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRappels.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRappels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchRappels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(marquerLu.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r._id !== action.payload);
      })
      .addCase(marquerTousLus.fulfilled, (state) => {
        state.list = [];
      });
  },
});

export default rappelsSlice.reducer;
