import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/common/PrivateRoute";
import Layout from "./components/layout/Layout";
import Login from "./pages/Auth/Login";
import Prospects from "./pages/Prospects/Prospects";
import Archives from "./pages/Archives/Archives";
import Assures from "./pages/Assures/Assures";
import AssureDetail from "./pages/Assures/AssureDetail";
import Dashboard from "./pages/Dashboard/Dashboard";
import Profil from "./pages/Profil/Profil";
import Admin from "./pages/Admin/Admin";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Privé — avec Sidebar */}
        <Route
          path="/crm"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="prospects" element={<Prospects />} />
          <Route path="assures" element={<Assures />} />
          <Route path="assures/:id" element={<AssureDetail />} />
          <Route path="archives" element={<Archives />} />
          <Route path="profil" element={<Profil />} />
          <Route path="admin" element={<Admin />} />
        </Route>

        {/* Redirect par défaut */}
        <Route path="*" element={<Navigate to="/crm/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
