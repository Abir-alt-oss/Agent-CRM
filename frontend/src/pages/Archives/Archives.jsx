import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchArchives,
  deleteProspect,
} from "../../store/slices/prospectsSlice";
import { showToast } from "../../store/slices/uiSlice";
import ExportButtons from "../../components/common/ExportButtons";

const EXPORT_COLUMNS = [
  { header: "Prénom", value: (p) => p.prenom },
  { header: "Nom", value: (p) => p.nom },
  { header: "Téléphone", value: (p) => p.telephone },
  { header: "Adresse", value: (p) => p.adresse },
  { header: "Observation", value: (p) => p.observation },
];

function Archives() {
  const dispatch = useDispatch();
  const { archives, isLoading } = useSelector((state) => state.prospects);
  const [search, setSearch] = useState("");
  const [showDelete, setShowDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchArchives());
  }, [dispatch]);

  const filtered = archives.filter((p) =>
    `${p.nom} ${p.prenom} ${p.telephone}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    await dispatch(deleteProspect(showDelete._id));
    dispatch(
      showToast({
        message: "Prospect supprimé définitivement.",
        type: "success",
      }),
    );
    setShowDelete(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          📦 Archives{" "}
          <span style={{ color: "var(--text-muted)", fontSize: "16px" }}>
            ({filtered.length})
          </span>
        </h1>
        <ExportButtons
          data={filtered}
          columns={EXPORT_COLUMNS}
          filename="archives"
          title="Archives Prospects"
        />
      </div>

      <div className="search-bar">
        <input
          className="input"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

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
                <th>Observation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Aucun prospect archivé
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <b>
                        {p.prenom} {p.nom}
                      </b>
                    </td>
                    <td>{p.telephone}</td>
                    <td>{p.adresse || "—"}</td>
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
                        className="btn btn-danger btn-sm"
                        onClick={() => setShowDelete(p)}
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(null)}>
          <div
            className="modal"
            style={{ maxWidth: "400px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>🗑️ Supprimer définitivement</h2>
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
              définitivement ? Cette action est irréversible.
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

export default Archives;
