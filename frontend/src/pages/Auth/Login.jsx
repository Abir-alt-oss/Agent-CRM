import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, clearError } from "../../store/slices/authSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, token } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token) navigate("/crm/dashboard");
  }, [token, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = () => {
    dispatch(login({ email, password }));
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span>🛡️</span>
          <h1>Agent CRM</h1>
          <p>Connectez-vous à votre espace</p>
        </div>

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

        <div className="form-group">
          <label>Mot de passe</label>
          <input
            className="input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isLoading}
          style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
        >
          {isLoading ? "Connexion..." : "Se connecter"}
        </button>
      </div>
    </div>
  );
}

export default Login;
