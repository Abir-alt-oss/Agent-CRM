import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { showToast } from "../../store/slices/uiSlice";
import api from "../../api/axios";

function Profil() {
  const dispatch = useDispatch();
  const { agent } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    ancienPassword: "",
    nouveauPassword: "",
    confirmerPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (
      !form.ancienPassword ||
      !form.nouveauPassword ||
      !form.confirmerPassword
    ) {
      dispatch(
        showToast({ message: "Tous les champs sont requis.", type: "error" }),
      );
      return;
    }
    if (form.nouveauPassword !== form.confirmerPassword) {
      dispatch(
        showToast({
          message: "Les mots de passe ne correspondent pas.",
          type: "error",
        }),
      );
      return;
    }
    if (form.nouveauPassword.length < 6) {
      dispatch(
        showToast({
          message: "Le mot de passe doit contenir au moins 6 caractères.",
          type: "error",
        }),
      );
      return;
    }

    setIsLoading(true);
    try {
      await api.put("/auth/change-password", {
        ancienPassword: form.ancienPassword,
        nouveauPassword: form.nouveauPassword,
      });
      dispatch(
        showToast({
          message: "Mot de passe modifié avec succès !",
          type: "success",
        }),
      );
      setForm({
        ancienPassword: "",
        nouveauPassword: "",
        confirmerPassword: "",
      });
      setShowPassword(false);
    } catch (err) {
      dispatch(
        showToast({
          message: err.response?.data?.message || "Erreur serveur.",
          type: "error",
        }),
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>👤 Mon Profil</h1>
      </div>

      {/* Infos agent */}
      <div className="card" style={{ maxWidth: "600px", marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--orange), var(--blue))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: "700",
              color: "white",
              flexShrink: 0,
            }}
          >
            {agent?.prenom?.[0]}
            {agent?.nom?.[0]}
          </div>
          <div>
            <h2 style={{ fontSize: "20px", color: "var(--white)" }}>
              {agent?.prenom} {agent?.nom}
            </h2>
            <span
              className={`badge ${agent?.role === "admin" ? "badge-orange" : "badge-blue"}`}
            >
              {agent?.role}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          <div
            style={{
              padding: "14px",
              background: "var(--dark3)",
              borderRadius: "8px",
            }}
          >
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              EMAIL
            </p>
            <p style={{ fontWeight: "600" }}>{agent?.email}</p>
          </div>
          <div
            style={{
              padding: "14px",
              background: "var(--dark3)",
              borderRadius: "8px",
            }}
          >
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "12px",
                marginBottom: "4px",
              }}
            >
              MEMBRE DEPUIS
            </p>
            <p style={{ fontWeight: "600" }}>
              {agent?.createdAt
                ? new Date(agent.createdAt).toLocaleDateString("fr-FR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Changer mot de passe */}
      <div className="card" style={{ maxWidth: "600px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "16px", color: "var(--white)" }}>
            🔑 Changer le mot de passe
          </h2>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Annuler" : "Modifier"}
          </button>
        </div>

        {showPassword && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="form-group">
              <label>Ancien mot de passe</label>
              <input
                className="input"
                type="password"
                name="ancienPassword"
                value={form.ancienPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                className="input"
                type="password"
                name="nouveauPassword"
                value={form.nouveauPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                className="input"
                type="password"
                name="confirmerPassword"
                value={form.confirmerPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={isLoading}
              style={{ marginTop: "8px" }}
            >
              {isLoading ? "Modification..." : "Confirmer"}
            </button>
          </form>
        )}
        {!showPassword && (
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Cliquez sur "Modifier" pour changer votre mot de passe.
          </p>
        )}
      </div>
    </div>
  );
}

export default Profil;
