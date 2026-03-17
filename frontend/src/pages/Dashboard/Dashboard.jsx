import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchProspects,
  fetchArchives,
} from "../../store/slices/prospectsSlice";
import { fetchAssures } from "../../store/slices/assuresSlice";
import { fetchRappels } from "../../store/slices/rappelsSlice";

const STATUTS = [
  { value: "nouveau", label: "Nouveau", color: "var(--blue)" },
  { value: "contacte", label: "Contacté", color: "var(--orange)" },
  { value: "rdv_planifie", label: "RDV Planifié", color: "var(--gold)" },
  { value: "rdv_reporte", label: "RDV Reporté", color: "var(--text-muted)" },
  { value: "non_interesse", label: "Non Intéressé", color: "var(--red)" },
  { value: "converti", label: "Converti", color: "var(--green)" },
];

function StatCard({ icon, label, value, color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--dark2)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        padding: "20px 24px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.borderColor = color;
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "12px",
          background: `${color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "13px",
            marginBottom: "4px",
          }}
        >
          {label}
        </p>
        <p
          style={{
            color: color,
            fontSize: "28px",
            fontWeight: "700",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { agent } = useSelector((state) => state.auth);
  const { list: prospects, archives } = useSelector((state) => state.prospects);
  const { list: assures } = useSelector((state) => state.assures);
  const { list: rappels } = useSelector((state) => state.rappels);

  useEffect(() => {
    dispatch(fetchProspects());
    dispatch(fetchArchives());
    dispatch(fetchAssures());
    dispatch(fetchRappels());
  }, [dispatch]);

  // Statistiques
  const totalProspects = prospects.length;
  const totalAssures = assures.length;
  const totalArchives = archives.length;
  const totalRappels = rappels.length;
  const prospectsRdv = prospects.filter(
    (p) => p.statut === "rdv_planifie",
  ).length;
  const prospectsConvertis = prospects.filter(
    (p) => p.statut === "converti",
  ).length;

  // Derniers ajoutés
  const derniersProspects = [...prospects]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const derniersAssures = [...assures]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const heure = new Date().getHours();
  const salutation =
    heure < 12 ? "Bonjour" : heure < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="page">
      {/* Salutation */}
      <div style={{ marginBottom: "28px" }}>
        <h1
          style={{
            fontSize: "24px",
            color: "var(--white)",
            marginBottom: "4px",
          }}
        >
          {salutation},{" "}
          <span style={{ color: "var(--orange)" }}>{agent?.prenom}</span> 👋
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Stat Cards */}
      <div
        className="dashboard-grid-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <StatCard
          icon="👥"
          label="Total Prospects"
          value={totalProspects}
          color="var(--blue)"
          onClick={() => navigate("/crm/prospects")}
        />
        <StatCard
          icon="🛡️"
          label="Total Assurés"
          value={totalAssures}
          color="var(--orange)"
          onClick={() => navigate("/crm/assures")}
        />
        <StatCard
          icon="📦"
          label="Archives"
          value={totalArchives}
          color="var(--text-muted)"
          onClick={() => navigate("/crm/archives")}
        />
        <StatCard
          icon="🔔"
          label="Rappels en attente"
          value={totalRappels}
          color="var(--gold)"
        />
      </div>

      {/* Deuxième ligne stats */}
      <div
        className="dashboard-grid-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <StatCard
          icon="📅"
          label="RDV Planifiés"
          value={prospectsRdv}
          color="var(--gold)"
          onClick={() => navigate("/crm/prospects")}
        />
        <StatCard
          icon="✅"
          label="Prospects Convertis"
          value={prospectsConvertis}
          color="var(--green)"
          onClick={() => navigate("/crm/prospects")}
        />
      </div>

      {/* Prospects par statut */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "16px",
            marginBottom: "16px",
            color: "var(--white)",
          }}
        >
          📊 Prospects par statut
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {STATUTS.map((s) => {
            const count = prospects.filter((p) => p.statut === s.value).length;
            const percent =
              totalProspects > 0
                ? Math.round((count / totalProspects) * 100)
                : 0;
            return (
              <div key={s.value}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "var(--text)" }}>
                    {s.label}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: s.color,
                      fontWeight: "600",
                    }}
                  >
                    {count} ({percent}%)
                  </span>
                </div>
                <div
                  style={{
                    background: "var(--dark3)",
                    borderRadius: "4px",
                    height: "6px",
                  }}
                >
                  <div
                    style={{
                      width: `${percent}%`,
                      height: "100%",
                      background: s.color,
                      borderRadius: "4px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Derniers ajoutés */}
      <div
        className="dashboard-grid-bottom"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* Derniers prospects */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "15px", color: "var(--white)" }}>
              👥 Derniers Prospects
            </h2>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate("/crm/prospects")}
            >
              Voir tout
            </button>
          </div>
          {derniersProspects.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Aucun prospect
            </p>
          ) : (
            derniersProspects.map((p) => (
              <div
                key={p._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "600" }}>
                    {p.prenom} {p.nom}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {p.telephone}
                  </p>
                </div>
                <span
                  className={`badge badge-${
                    p.statut === "nouveau"
                      ? "blue"
                      : p.statut === "contacte"
                        ? "orange"
                        : p.statut === "rdv_planifie"
                          ? "gold"
                          : p.statut === "converti"
                            ? "green"
                            : "muted"
                  }`}
                  style={{ fontSize: "10px" }}
                >
                  {STATUTS.find((s) => s.value === p.statut)?.label}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Derniers assurés */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "15px", color: "var(--white)" }}>
              🛡️ Derniers Assurés
            </h2>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate("/crm/assures")}
            >
              Voir tout
            </button>
          </div>
          {derniersAssures.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Aucun assuré
            </p>
          ) : (
            derniersAssures.map((a) => (
              <div
                key={a._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/crm/assures/${a._id}`)}
              >
                <div>
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--blue2)",
                    }}
                  >
                    {a.prenom} {a.nom}
                  </p>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    {a.telephone}
                  </p>
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
