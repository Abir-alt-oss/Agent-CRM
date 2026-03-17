import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProspects,
  createProspect,
  updateProspect,
  deleteProspect,
} from "../../store/slices/prospectsSlice";
import { showToast } from "../../store/slices/uiSlice";
// Ajoute l'import en haut du fichier
import ExportButtons from "../../components/common/ExportButtons";

// Colonnes pour l'export
const EXPORT_COLUMNS = [
  { header: "Prénom", value: (p) => p.prenom },
  { header: "Nom", value: (p) => p.nom },
  { header: "Téléphone", value: (p) => p.telephone },
  { header: "Adresse", value: (p) => p.adresse },
  { header: "Statut", value: (p) => p.statut },
  {
    header: "Date RDV",
    value: (p) =>
      p.dateRdv ? new Date(p.dateRdv).toLocaleDateString("fr-FR") : "",
  },
  { header: "Observation", value: (p) => p.observation },
];
const STATUTS = [
  { value: "nouveau", label: "Nouveau", class: "badge-blue" },
  { value: "contacte", label: "Contacté", class: "badge-orange" },
  { value: "rdv_planifie", label: "RDV Planifié", class: "badge-gold" },
  { value: "rdv_reporte", label: "RDV Reporté", class: "badge-muted" },
  { value: "non_interesse", label: "Non Intéressé", class: "badge-red" },
  { value: "converti", label: "Converti", class: "badge-green" },
];

const EMPTY_FORM = {
  nom: "",
  prenom: "",
  telephone: "",
  adresse: "",
  statut: "nouveau",
  dateRdv: "",
  informations: "",
  observation: "",
};

function Prospects() {
  const dispatch = useDispatch();
  const { list, isLoading } = useSelector((state) => state.prospects);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProspect, setEditProspect] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showDelete, setShowDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchProspects());
  }, [dispatch]);

  const filtered = list.filter((p) =>
    `${p.nom} ${p.prenom} ${p.telephone}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditProspect(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProspect(p);
    setForm({
      nom: p.nom,
      prenom: p.prenom,
      telephone: p.telephone,
      adresse: p.adresse || "",
      statut: p.statut,
      dateRdv: p.dateRdv ? p.dateRdv.slice(0, 10) : "",
      informations: p.informations || "",
      observation: p.observation || "",
    });
    setShowModal(true);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.nom || !form.prenom || !form.telephone) {
      dispatch(
        showToast({
          message: "Nom, prénom et téléphone sont requis.",
          type: "error",
        }),
      );
      return;
    }
    if (editProspect) {
      await dispatch(updateProspect({ id: editProspect._id, ...form }));
      dispatch(showToast({ message: "Prospect modifié !", type: "success" }));
    } else {
      await dispatch(createProspect(form));
      dispatch(showToast({ message: "Prospect créé !", type: "success" }));
    }
    setShowModal(false);
  };

  const handleDelete = async () => {
    await dispatch(deleteProspect(showDelete._id));
    dispatch(showToast({ message: "Prospect supprimé.", type: "success" }));
    setShowDelete(null);
  };

  const getStatut = (value) =>
    STATUTS.find((s) => s.value === value) || STATUTS[0];

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1>
          👥 Prospects{" "}
          <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>
            ({filtered.length})
          </span>
        </h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <ExportButtons
            data={filtered}
            columns={EXPORT_COLUMNS}
            filename="prospects"
            title="Liste des Prospects"
          />
          <button className="btn btn-primary" onClick={openCreate}>
            + Nouveau prospect
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          className="input"
          placeholder="Rechercher par nom, prénom, téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="spinner" />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Date RDV</th>
                <th>Observation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Aucun prospect trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <b>
                        {p.prenom} {p.nom}
                      </b>
                      <br />
                      <span
                        style={{ fontSize: "12px", color: "var(--text-muted)" }}
                      >
                        {p.adresse}
                      </span>
                    </td>
                    <td>{p.telephone}</td>
                    <td>
                      <span className={`badge ${getStatut(p.statut).class}`}>
                        {getStatut(p.statut).label}
                      </span>
                    </td>
                    <td>
                      {p.dateRdv
                        ? new Date(p.dateRdv).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td
                      style={{
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.observation || "—"}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEdit(p)}
                        style={{ marginRight: "6px" }}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setShowDelete(p)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Créer/Modifier */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editProspect ? "✏️ Modifier prospect" : "➕ Nouveau prospect"}
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
                <label>Prénom *</label>
                <input
                  className="input"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  placeholder="Prénom"
                />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  className="input"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  placeholder="Nom"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  className="input"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  placeholder="+216 XX XXX XXX"
                />
              </div>
              <div className="form-group">
                <label>Adresse</label>
                <input
                  className="input"
                  name="adresse"
                  value={form.adresse}
                  onChange={handleChange}
                  placeholder="Adresse"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Statut</label>
                <select
                  className="input"
                  name="statut"
                  value={form.statut}
                  onChange={handleChange}
                >
                  {STATUTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date RDV</label>
                <input
                  className="input"
                  type="date"
                  name="dateRdv"
                  value={form.dateRdv}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Informations</label>
              <textarea
                className="input"
                name="informations"
                value={form.informations}
                onChange={handleChange}
                placeholder="Informations générales..."
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Observation</label>
              <textarea
                className="input"
                name="observation"
                value={form.observation}
                onChange={handleChange}
                placeholder="Notes et observations..."
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
                {editProspect ? "Modifier" : "Créer"}
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
              <h2>🗑️ Supprimer</h2>
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

export default Prospects;
