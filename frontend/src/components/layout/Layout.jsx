import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Toast from "../common/Toast";
import { fetchRappels } from "../../store/slices/rappelsSlice";
import { toggleSidebar } from "../../store/slices/uiSlice";

function Layout() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  useEffect(() => {
    dispatch(fetchRappels());
  }, [dispatch]);

  // Fermer sidebar sur mobile au changement de page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && !sidebarOpen) {
        dispatch(toggleSidebar());
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="app-layout">
      {/* Bouton hamburger — mobile uniquement */}
      <button className="hamburger" onClick={() => dispatch(toggleSidebar())}>
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Overlay — ferme sidebar sur mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <Sidebar />

      <main className="main-content">
        <Outlet />
      </main>

      <Toast />
    </div>
  );
}

export default Layout;
