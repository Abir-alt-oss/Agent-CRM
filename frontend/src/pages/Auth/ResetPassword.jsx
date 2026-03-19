import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirm) {
      setError("Tous les champs sont requis.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Minimum 6 caractères.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Token invalide ou expiré.");
    }
    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span>🔒</span>
          <h1>Nouveau mot de passe</h1>
          <p>Choisissez un nouveau mot de passe</p>
        </div>

        {success ? (
          <div
            style={{
              background: "var(--green)20",
              border: "1px solid var(--green)",
              borderRadius: "8px",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--green)", fontWeight: "600" }}>
              ✅ Mot de passe réinitialisé !
            </p>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "13px",
                marginTop: "8px",
              }}
            >
              Redirection vers la connexion dans 3 secondes...
            </p>
          </div>
        ) : (
          <>
            {error && <div className="login-error">{error}</div>}
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: "8px",
              }}
            >
              {isLoading ? "Réinitialisation..." : "Confirmer"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
