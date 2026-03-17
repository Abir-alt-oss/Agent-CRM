import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchAssureById,
  createContrat,
  updateContrat,
  deleteContrat,
} from "../../store/slices/assuresSlice";
import { showToast } from "../../store/slices/uiSlice";
import api from "../../api/axios";

const STATUTS_CONTRAT = [
  { value: "actif", label: "Actif", class: "badge-green" },
  { value: "suspendu", label: "Suspendu", class: "badge-orange" },
  { value: "resilie", label: "Résilié", class: "badge-red" },
];

const STATUTS_PAIEMENT = [
  { value: "paye", label: "Payé", class: "badge-green" },
  { value: "impaye", label: "Impayé", class: "badge-red" },
  { value: "en_attente", label: "En attente", class: "badge-gold" },
];

const MODALITES = ["mensuelle", "trimestrielle", "semestrielle", "annuelle"];

const EMPTY_CONTRAT = {
  numContrat: "",
  typeContrat: "",
  dateDebut: "",
  dateEcheance: "",
  montantPrime: "",
  modalitePaiement: "mensuelle",
  statutContrat: "actif",
  statutPaiement: "en_attente",
  informations: "",
};

function AssureDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, isLoading } = useSelector((state) => state.assures);

  const [showModal, setShowModal] = useState(false);
  const [editContrat, setEditContrat] = useState(null);
  const [form, setForm] = useState(EMPTY_CONTRAT);
  const [showDelete, setShowDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedContrat, setSelectedContrat] = useState(null);

  useEffect(() => {
    dispatch(fetchAssureById(id));
  }, [dispatch, id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setEditContrat(null);
    setForm(EMPTY_CONTRAT);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditContrat(c);
    setForm({
      numContrat: c.numContrat,
      typeContrat: c.typeContrat,
      dateDebut: c.dateDebut ? c.dateDebut.slice(0, 10) : "",
      dateEcheance: c.dateEcheance ? c.dateEcheance.slice(0, 10) : "",
      montantPrime: c.montantPrime,
      modalitePaiement: c.modalitePaiement,
      statutContrat: c.statutContrat,
      statutPaiement: c.statutPaiement,
      informations: c.informations || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.numContrat || !form.typeContrat) {
      dispatch(
        showToast({
          message: "Numéro et type de contrat sont requis.",
          type: "error",
        }),
      );
      return;
    }
    if (editContrat) {
      await dispatch(updateContrat({ id: editContrat._id, ...form }));
      dispatch(showToast({ message: "Contrat modifié !", type: "success" }));
    } else {
      await dispatch(createContrat({ ...form, assureId: id }));
      dispatch(showToast({ message: "Contrat créé !", type: "success" }));
    }
    setShowModal(false);
    dispatch(fetchAssureById(id));
  };

  const handleDelete = async () => {
    await dispatch(deleteContrat(showDelete._id));
    dispatch(showToast({ message: "Contrat supprimé.", type: "success" }));
    setShowDelete(null);
  };

  const handleUpload = async (e, contratId) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("document", file);
    try {
      await api.post(`/contrats/${contratId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(showToast({ message: "Document uploadé !", type: "success" }));
      dispatch(fetchAssureById(id));
    } catch {
      dispatch(showToast({ message: "Erreur upload.", type: "error" }));
    }
    setUploading(false);
  };

  const handleDeleteDoc = async (contratId, docId) => {
    try {
      await api.delete(`/contrats/${contratId}/documents/${docId}`);
      dispatch(showToast({ message: "Document supprimé.", type: "success" }));
      dispatch(fetchAssureById(id));
    } catch {
      dispatch(showToast({ message: "Erreur suppression.", type: "error" }));
    }
  };

  const getStatutContrat = (v) =>
    STATUTS_CONTRAT.find((s) => s.value === v) || STATUTS_CONTRAT[0];
  const getStatutPaiement = (v) =>
    STATUTS_PAIEMENT.find((s) => s.value === v) || STATUTS_PAIEMENT[2];

  if (isLoading || !current) return <div className="spinner" />;

  const { assure, contrats } = current;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate("/crm/assures")}
          >
            ← Retour
          </button>
          <h1>
            🛡️ {assure.prenom} {assure.nom}
          </h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nouveau contrat
        </button>
      </div>

      {/* Infos assuré */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              TÉLÉPHONE
            </p>
            <p style={{ fontWeight: "600" }}>{assure.telephone}</p>
          </div>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              ADRESSE
            </p>
            <p style={{ fontWeight: "600" }}>{assure.adresse || "—"}</p>
          </div>
          <div>
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              DATE NAISSANCE
            </p>
            <p style={{ fontWeight: "600" }}>
              {assure.dateNaissance
                ? new Date(assure.dateNaissance).toLocaleDateString("fr-FR")
                : "—"}
            </p>
          </div>
        </div>
        {assure.notes && (
          <div
            style={{
              marginTop: "12px",
              paddingTop: "12px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              NOTES
            </p>
            <p>{assure.notes}</p>
          </div>
        )}
      </div>

      {/* Contrats */}
      <h2 style={{ marginBottom: "16px", fontSize: "16px" }}>
        📋 Contrats ({contrats?.length || 0})
      </h2>

      {contrats?.length === 0 ? (
        <div className="empty-state">
          <p>Aucun contrat — cliquez sur "+ Nouveau contrat"</p>
        </div>
      ) : (
        contrats?.map((c) => (
          <div key={c._id} className="card" style={{ marginBottom: "16px" }}>
            {/* Contrat header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <span
                  style={{
                    color: "var(--orange)",
                    fontWeight: "700",
                    fontSize: "16px",
                  }}
                >
                  #{c.numContrat}
                </span>
                <span
                  style={{ marginLeft: "12px", color: "var(--text-muted)" }}
                >
                  {c.typeContrat}
                </span>
              </div>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <span
                  className={`badge ${getStatutContrat(c.statutContrat).class}`}
                >
                  {getStatutContrat(c.statutContrat).label}
                </span>
                <span
                  className={`badge ${getStatutPaiement(c.statutPaiement).class}`}
                >
                  {getStatutPaiement(c.statutPaiement).label}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEdit(c)}
                >
                  ✏️
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setShowDelete(c)}
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* Contrat details */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                  PRIME
                </p>
                <p style={{ fontWeight: "600", color: "var(--green)" }}>
                  {c.montantPrime} DT
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                  MODALITÉ
                </p>
                <p style={{ fontWeight: "600" }}>{c.modalitePaiement}</p>
              </div>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                  DÉBUT
                </p>
                <p style={{ fontWeight: "600" }}>
                  {c.dateDebut
                    ? new Date(c.dateDebut).toLocaleDateString("fr-FR")
                    : "—"}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                  ÉCHÉANCE
                </p>
                <p style={{ fontWeight: "600" }}>
                  {c.dateEcheance
                    ? new Date(c.dateEcheance).toLocaleDateString("fr-FR")
                    : "—"}
                </p>
              </div>
            </div>

            {/* Documents */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  📎 Documents ({c.documents?.length || 0})
                </p>
                <label
                  className="btn btn-secondary btn-sm"
                  style={{ cursor: "pointer" }}
                >
                  {uploading ? "Upload..." : "+ Ajouter"}
                  <input
                    type="file"
                    style={{ display: "none" }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleUpload(e, c._id)}
                  />
                </label>
              </div>
              {c.documents?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {c.documents.map((doc) => (
                    <div
                      key={doc._id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "var(--dark3)",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "var(--blue2)",
                          textDecoration: "none",
                        }}
                      >
                        📄 {doc.nom}
                      </a>
                      <button
                        onClick={() => handleDeleteDoc(c._id, doc._id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--red)",
                          cursor: "pointer",
                          fontSize: "14px",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Modal Contrat */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editContrat ? "✏️ Modifier contrat" : "➕ Nouveau contrat"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>N° Contrat *</label>
                <input
                  className="input"
                  name="numContrat"
                  value={form.numContrat}
                  onChange={handleChange}
                  placeholder="EX-2024-001"
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <input
                  className="input"
                  name="typeContrat"
                  value={form.typeContrat}
                  onChange={handleChange}
                  placeholder="RC Auto, Habitation..."
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date début</label>
                <input
                  className="input"
                  type="date"
                  name="dateDebut"
                  value={form.dateDebut}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Date échéance</label>
                <input
                  className="input"
                  type="date"
                  name="dateEcheance"
                  value={form.dateEcheance}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Montant prime (DT)</label>
                <input
                  className="input"
                  type="number"
                  name="montantPrime"
                  value={form.montantPrime}
                  onChange={handleChange}
                  placeholder="0.000"
                />
              </div>
              <div className="form-group">
                <label>Modalité paiement</label>
                <select
                  className="input"
                  name="modalitePaiement"
                  value={form.modalitePaiement}
                  onChange={handleChange}
                >
                  {MODALITES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Statut contrat</label>
                <select
                  className="input"
                  name="statutContrat"
                  value={form.statutContrat}
                  onChange={handleChange}
                >
                  {STATUTS_CONTRAT.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Statut paiement</label>
                <select
                  className="input"
                  name="statutPaiement"
                  value={form.statutPaiement}
                  onChange={handleChange}
                >
                  {STATUTS_PAIEMENT.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Informations</label>
              <textarea
                className="input"
                name="informations"
                value={form.informations}
                onChange={handleChange}
                placeholder="Notes sur le contrat..."
                rows={2}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
                marginTop: "8px",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editContrat ? "Modifier" : "Créer"}
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
              <h2>🗑️ Supprimer contrat</h2>
              <button
                className="modal-close"
                onClick={() => setShowDelete(null)}
              >
                ×
              </button>
            </div>
            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
              Supprimer le contrat{" "}
              <b style={{ color: "var(--white)" }}>#{showDelete.numContrat}</b>{" "}
              et tous ses documents ?
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

export default AssureDetail;
