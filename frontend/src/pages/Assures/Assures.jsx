import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAssures,
  createAssure,
  updateAssure,
  deleteAssure,
} from "../../store/slices/assuresSlice";
import { showToast } from "../../store/slices/uiSlice";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = {
  nom: "",
  prenom: "",
  telephone: "",
  adresse: "",
  dateNaissance: "",
  notes: "",
};

function Assures() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, isLoading } = useSelector((state) => state.assures);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editAssure, setEditAssure] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showDelete, setShowDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchAssures());
  }, [dispatch]);

  const filtered = list.filter((a) =>
    `${a.nom} ${a.prenom} ${a.telephone}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditAssure(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditAssure(a);
    setForm({
      nom: a.nom,
      prenom: a.prenom,
      telephone: a.telephone,
      adresse: a.adresse || "",
      dateNaissance: a.dateNaissance ? a.dateNaissance.slice(0, 10) : "",
      notes: a.notes || "",
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
    if (editAssure) {
      await dispatch(updateAssure({ id: editAssure._id, ...form }));
      dispatch(showToast({ message: "Assuré modifié !", type: "success" }));
    } else {
      await dispatch(createAssure(form));
      dispatch(showToast({ message: "Assuré créé !", type: "success" }));
    }
    setShowModal(false);
  };

  const handleDelete = async () => {
    await dispatch(deleteAssure(showDelete._id));
    dispatch(showToast({ message: "Assuré supprimé.", type: "success" }));
    setShowDelete(null);
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1>
          🛡️ Assurés{" "}
          <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>
            ({filtered.length})
          </span>
        </h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Nouvel assuré
        </button>
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
                <th>Adresse</th>
                <th>Date naissance</th>
                <th>Notes</th>
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
                    Aucun assuré trouvé
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <b
                        style={{ cursor: "pointer", color: "var(--blue2)" }}
                        onClick={() => navigate(`/crm/assures/${a._id}`)}
                      >
                        {a.prenom} {a.nom}
                      </b>
                    </td>
                    <td>{a.telephone}</td>
                    <td>{a.adresse || "—"}</td>
                    <td>
                      {a.dateNaissance
                        ? new Date(a.dateNaissance).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td
                      style={{
                        maxWidth: "180px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.notes || "—"}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openEdit(a)}
                        style={{ marginRight: "6px" }}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setShowDelete(a)}
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
              <h2>{editAssure ? "✏️ Modifier assuré" : "➕ Nouvel assuré"}</h2>
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
                <label>Date de naissance</label>
                <input
                  className="input"
                  type="date"
                  name="dateNaissance"
                  value={form.dateNaissance}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Adresse</label>
              <input
                className="input"
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                placeholder="Adresse complète"
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                className="input"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Notes sur le client..."
                rows={3}
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
                {editAssure ? "Modifier" : "Créer"}
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
              et tous ses contrats ?
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

export default Assures;
