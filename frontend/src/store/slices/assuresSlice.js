import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Récupérer les assurés
export const fetchAssures = createAsyncThunk(
  "assures/fetchAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/assures", { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Récupérer un assuré + ses contrats
export const fetchAssureById = createAsyncThunk(
  "assures/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/assures/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Créer un assuré
export const createAssure = createAsyncThunk(
  "assures/create",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/assures", body);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Modifier un assuré
export const updateAssure = createAsyncThunk(
  "assures/update",
  async ({ id, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/assures/${id}`, body);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Supprimer un assuré
export const deleteAssure = createAsyncThunk(
  "assures/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/assures/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Créer un contrat
export const createContrat = createAsyncThunk(
  "assures/createContrat",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/contrats", body);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Modifier un contrat
export const updateContrat = createAsyncThunk(
  "assures/updateContrat",
  async ({ id, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/contrats/${id}`, body);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

// Supprimer un contrat
export const deleteContrat = createAsyncThunk(
  "assures/deleteContrat",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/contrats/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const assuresSlice = createSlice({
  name: "assures",
  initialState: {
    list: [],
    current: null, // assuré sélectionné + ses contrats
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrent(state) {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assurés
      .addCase(fetchAssures.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAssures.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchAssures.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch by ID
      .addCase(fetchAssureById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      // Create assuré
      .addCase(createAssure.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      // Update assuré
      .addCase(updateAssure.fulfilled, (state, action) => {
        const idx = state.list.findIndex((a) => a._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      // Delete assuré
      .addCase(deleteAssure.fulfilled, (state, action) => {
        state.list = state.list.filter((a) => a._id !== action.payload);
      })
      // Create contrat
      .addCase(createContrat.fulfilled, (state, action) => {
        if (state.current) state.current.contrats.unshift(action.payload);
      })
      // Update contrat
      .addCase(updateContrat.fulfilled, (state, action) => {
        if (state.current) {
          const idx = state.current.contrats.findIndex(
            (c) => c._id === action.payload._id,
          );
          if (idx !== -1) state.current.contrats[idx] = action.payload;
        }
      })
      // Delete contrat
      .addCase(deleteContrat.fulfilled, (state, action) => {
        if (state.current) {
          state.current.contrats = state.current.contrats.filter(
            (c) => c._id !== action.payload,
          );
        }
      });
  },
});

export const { clearCurrent } = assuresSlice.actions;
export default assuresSlice.reducer;
