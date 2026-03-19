import { useState } from "react";
import api from "../../api/axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setError("Email requis.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur serveur.");
    }
    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span>🔑</span>
          <h1>Mot de passe oublié</h1>
          <p>Entrez votre email pour réinitialiser</p>
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
              ✅ Email envoyé !
            </p>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "13px",
                marginTop: "8px",
              }}
            >
              Vérifiez votre boîte mail et suivez le lien pour réinitialiser
              votre mot de passe.
            </p>
          </div>
        ) : (
          <>
            {error && <div className="login-error">{error}</div>}
            <div className="form-group">
              <label>Email</label>
              <input
                className="input"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
              {isLoading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </>
        )}

        <p
          style={{
            textAlign: "center",
            marginTop: "16px",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          <a href="/login" style={{ color: "var(--orange)" }}>
            ← Retour à la connexion
          </a>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
