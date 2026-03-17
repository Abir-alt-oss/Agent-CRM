import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../store/slices/authSlice";
import { toggleSidebar } from "../../store/slices/uiSlice";

function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { agent } = useSelector((state) => state.auth);
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const rappels = useSelector((state) => state.rappels.list);

  const links = [
    { to: "/crm/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/crm/prospects", label: "Prospects", icon: "👥" },
    { to: "/crm/assures", label: "Assurés", icon: "🛡️" },
    { to: "/crm/archives", label: "Archives", icon: "📦" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="logo-icon">🛡️</span>
        {sidebarOpen && <span className="logo-text">Agent CRM</span>}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="link-icon">{link.icon}</span>
            {sidebarOpen && <span className="link-label">{link.label}</span>}
          </NavLink>
        ))}

        {/* Lien Admin — visible uniquement pour l'admin */}
        {agent?.role === "admin" && (
          <NavLink
            to="/crm/admin"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="link-icon">⚙️</span>
            {sidebarOpen && <span className="link-label">Administration</span>}
          </NavLink>
        )}
      </nav>

      {/* Rappels badge */}
      {rappels.length > 0 && (
        <div className="sidebar-rappels">
          <span className="rappels-badge">{rappels.length}</span>
          {sidebarOpen && <span>Rappels en attente</span>}
        </div>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        {sidebarOpen && (
          <div
            className="agent-info"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/crm/profil")}
          >
            <p className="agent-name">
              {agent?.prenom} {agent?.nom}
            </p>
            <p className="agent-role">{agent?.role}</p>
          </div>
        )}
        <button
          className="btn-logout"
          onClick={handleLogout}
          title="Déconnexion"
        >
          🚪
        </button>
      </div>

      {/* Toggle */}
      <button
        className="sidebar-toggle"
        onClick={() => dispatch(toggleSidebar())}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>
    </aside>
  );
}

export default Sidebar;
