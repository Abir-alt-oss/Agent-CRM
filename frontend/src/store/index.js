import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import prospectsReducer from "./slices/prospectsSlice";
import assuresReducer from "./slices/assuresSlice";
import rappelsReducer from "./slices/rappelsSlice";
import uiReducer from "./slices/uiSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  prospects: prospectsReducer,
  assures: assuresReducer,
  rappels: rappelsReducer,
  ui: uiReducer,
});

const persistConfig = {
  key: "agent-crm",
  storage,
  whitelist: ["auth"], // Seulement auth est persisté
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
