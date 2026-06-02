import { useCallback, useEffect, useState } from "react";
import {
  createSpecialist,
  deleteSpecialist,
  listSpecialists,
  updateSpecialist,
} from "../api/specialists";
import { SpecialistForm } from "../components/SpecialistForm";
import { specialistClassLabel } from "../types/specialist-class";
import type { DescriptionSection, Specialist, SpecialistInput } from "../types/specialist";

function descPreview(sections: DescriptionSection[]) {
  const first = sections.find((s) => s.title?.trim() || s.description?.trim());
  if (!first) return "—";
  if (first.title?.trim()) return first.title.trim();
  return first.description.trim().slice(0, 80) || "—";
}

export function SpecialistsPage() {
  const [items, setItems] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Specialist | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listSpecialists());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить список");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(data: SpecialistInput) {
    const created = await createSpecialist(data);
    setModal(null);
    setItems((prev) => [...prev, created].sort((a, b) => a.id - b.id));
  }

  async function handleUpdate(data: SpecialistInput) {
    if (!editing) return;
    const updated = await updateSpecialist(editing.id, data);
    setModal(null);
    setEditing(null);
    setItems((prev) => prev.map((sp) => (sp.id === updated.id ? updated : sp)));
  }

  async function handleDelete(sp: Specialist) {
    if (!confirm(`Удалить «${sp.name}»?`)) return;
    try {
      await deleteSpecialist(sp.id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить");
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Специалисты</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setModal("create");
          }}
        >
          Добавить
        </button>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="card">
        {loading ? (
          <div className="empty-state">Загрузка…</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            Специалистов пока нет. Нажмите «Добавить».
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Фото</th>
                  <th>Имя</th>
                  <th>Категория</th>
                  <th>Описание</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((sp) => (
                  <tr key={sp.id}>
                    <td>
                      {sp.photo_url ? (
                        <img
                          src={sp.photo_url}
                          alt=""
                          className="thumb"
                          loading="lazy"
                        />
                      ) : (
                        <div className="thumb-placeholder">нет</div>
                      )}
                    </td>
                    <td>
                      <strong>{sp.name}</strong>
                      <div className="desc-preview">id: {sp.id}</div>
                    </td>
                    <td>{specialistClassLabel(sp.class)}</td>
                    <td>
                      <span className="desc-preview">{descPreview(sp.description)}</span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditing(sp);
                            setModal("edit");
                          }}
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => void handleDelete(sp)}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => {
            setModal(null);
            setEditing(null);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <SpecialistForm
              title={modal === "create" ? "Новый специалист" : "Редактирование"}
              initial={editing ?? undefined}
              onSubmit={modal === "create" ? handleCreate : handleUpdate}
              onCancel={() => {
                setModal(null);
                setEditing(null);
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
