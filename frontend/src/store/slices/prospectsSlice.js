import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Récupérer les prospects actifs
export const fetchProspects = createAsyncThunk(
  "prospects/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/prospects", { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Récupérer les archives
export const fetchArchives = createAsyncThunk(
  "prospects/fetchArchives",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/prospects/archives", { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Créer un prospect
export const createProspect = createAsyncThunk(
  "prospects/create",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/prospects", body);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Modifier un prospect
export const updateProspect = createAsyncThunk(
  "prospects/update",
  async ({ id, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/prospects/${id}`, body);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Supprimer un prospect
export const deleteProspect = createAsyncThunk(
  "prospects/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/prospects/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const prospectsSlice = createSlice({
  name: "prospects",
  initialState: {
    list: [],
    archives: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch prospects
      .addCase(fetchProspects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProspects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchProspects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch archives
      .addCase(fetchArchives.fulfilled, (state, action) => {
        state.archives = action.payload;
      })
      // Create
      .addCase(createProspect.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      // Update
      .addCase(updateProspect.fulfilled, (state, action) => {
        const idx = state.list.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) {
          // Si archivé → retirer de la liste active
          if (action.payload.archive) {
            state.list.splice(idx, 1);
          } else {
            state.list[idx] = action.payload;
          }
        }
      })
      // Delete
      .addCase(deleteProspect.fulfilled, (state, action) => {
        state.list = state.list.filter((p) => p._id !== action.payload);
        state.archives = state.archives.filter((p) => p._id !== action.payload);
      });
  },
});

export default prospectsSlice.reducer;
