import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../store/slices/uiSlice";
import api from "../../api/axios";

function Admin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { agent } = useSelector((state) => state.auth);

  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (agent?.role !== "admin") navigate("/crm/dashboard");
  }, [agent, navigate]);

  const loadAgents = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/auth/agents");
      setAgents(data);
    } catch {
      dispatch(
        showToast({ message: "Erreur chargement agents.", type: "error" }),
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Créer agent
  const handleCreate = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.password) {
      dispatch(
        showToast({ message: "Tous les champs sont requis.", type: "error" }),
      );
      return;
    }
    if (form.password.length < 6) {
      dispatch(
        showToast({
          message: "Mot de passe minimum 6 caractères.",
          type: "error",
        }),
      );
      return;
    }
    try {
      await api.post("/auth/create-agent", form);
      dispatch(
        showToast({ message: "Agent créé avec succès !", type: "success" }),
      );
      setShowCreate(false);
      setForm({ nom: "", prenom: "", email: "", password: "" });
      loadAgents();
    } catch (err) {
      dispatch(
        showToast({
          message: err.response?.data?.message || "Erreur.",
          type: "error",
        }),
      );
    }
  };

  // Modifier agent
  const handleUpdate = async () => {
    if (!form.nom || !form.prenom || !form.email) {
      dispatch(
        showToast({ message: "Tous les champs sont requis.", type: "error" }),
      );
      return;
    }
    try {
      await api.put(`/auth/agents/${showEdit._id}`, {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
      });
      dispatch(
        showToast({ message: "Agent modifié avec succès.", type: "success" }),
      );
      setShowEdit(null);
      loadAgents();
    } catch (err) {
      dispatch(
        showToast({
          message: err.response?.data?.message || "Erreur.",
          type: "error",
        }),
      );
    }
  };

  // Activer / Désactiver
  const handleToggle = async (a) => {
    try {
      await api.put(`/auth/agents/${a._id}/toggle`);
      dispatch(
        showToast({
          message: `Agent ${a.actif ? "désactivé" : "activé"}.`,
          type: a.actif ? "warning" : "success",
        }),
      );
      loadAgents();
    } catch {
      dispatch(showToast({ message: "Erreur.", type: "error" }));
    }
  };

  // Supprimer agent
  const handleDelete = async () => {
    try {
      await api.delete(`/auth/agents/${showDelete._id}`);
      dispatch(showToast({ message: "Agent supprimé.", type: "success" }));
      setShowDelete(null);
      loadAgents();
    } catch {
      dispatch(showToast({ message: "Erreur.", type: "error" }));
    }
  };

  const openEdit = (a) => {
    setForm({ nom: a.nom, prenom: a.prenom, email: a.email, password: "" });
    setShowEdit(a);
  };

  const openCreate = () => {
    setForm({ nom: "", prenom: "", email: "", password: "" });
    setShowCreate(true);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          ⚙️ Administration{" "}
          <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>
            ({agents.length} agents)
          </span>
        </h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nouvel agent
        </button>
      </div>

      {/* Explication */}
      <div
        style={{
          background: "var(--dark2)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          padding: "16px 20px",
          marginBottom: "24px",
          borderLeft: "4px solid var(--orange)",
        }}
      >
        <p
          style={{ color: "var(--text)", fontSize: "13px", lineHeight: "1.6" }}
        >
          <b style={{ color: "var(--orange)" }}>Comment ajouter un agent ?</b>
          <br />
          Clique sur <b>+ Nouvel agent</b> → remplis ses informations → il
          reçoit automatiquement un email avec ses identifiants.
          <br />
          <b style={{ color: "var(--gold)" }}>
            ⚠️ Mot de passe minimum 6 caractères.
          </b>
        </p>
      </div>

      {/* Tableau */}
      {isLoading ? (
        <div className="spinner" />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Agent</th>
                <th>Email</th>
                <th>Créé le</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Aucun agent — cliquez sur "+ Nouvel agent" pour commencer
                  </td>
                </tr>
              ) : (
                agents.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, var(--orange), var(--blue))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: "700",
                            color: "white",
                            flexShrink: 0,
                          }}
                        >
                          {a.prenom?.[0]}
                          {a.nom?.[0]}
                        </div>
                        <div>
                          <p style={{ fontWeight: "600" }}>
                            {a.prenom} {a.nom}
                          </p>
                          <p
                            style={{
                              fontSize: "11px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {a.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>{a.email}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td>
                      <span
                        className={`badge ${a.actif ? "badge-green" : "badge-red"}`}
                      >
                        {a.actif ? "✅ Actif" : "🚫 Désactivé"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => openEdit(a)}
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm"
                          onClick={() => handleToggle(a)}
                          title={a.actif ? "Désactiver" : "Activer"}
                          style={{
                            background: a.actif
                              ? "var(--gold)"
                              : "var(--green)",
                            color: "var(--dark)",
                            border: "none",
                          }}
                        >
                          {a.actif ? "🔒" : "🔓"}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setShowDelete(a)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Créer */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div
            className="modal"
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>➕ Nouvel agent</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreate(false)}
              >
                ×
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input
                  className="input"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  placeholder="Prénom"
                />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input
                  className="input"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  placeholder="Nom"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="agent@email.com"
              />
            </div>
            <div className="form-group">
              <label>
                Mot de passe temporaire{" "}
                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                  (min. 6 caractères)
                </span>
              </label>
              <input
                className="input"
                type="text"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="ex: Agent2024!"
              />
            </div>
            <div
              style={{
                background: "var(--dark3)",
                borderRadius: "8px",
                padding: "12px",
                marginBottom: "16px",
              }}
            >
              <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                📧 L'agent recevra un email avec ses identifiants
                automatiquement.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreate(false)}
              >
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleCreate}>
                Créer l'agent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier */}
      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(null)}>
          <div
            className="modal"
            style={{ maxWidth: "480px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>✏️ Modifier l'agent</h2>
              <button className="modal-close" onClick={() => setShowEdit(null)}>
                ×
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Prénom</label>
                <input
                  className="input"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input
                  className="input"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                className="input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowEdit(null)}
              >
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleUpdate}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer */}
      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(null)}>
          <div
            className="modal"
            style={{ maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>🗑️ Supprimer l'agent</h2>
              <button
                className="modal-close"
                onClick={() => setShowDelete(null)}
              >
                ×
              </button>
            </div>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Supprimer{" "}
              <b style={{ color: "var(--white)" }}>
                {showDelete.prenom} {showDelete.nom}
              </b>{" "}
              définitivement ?
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowDelete(null)}
              >
                Annuler
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
