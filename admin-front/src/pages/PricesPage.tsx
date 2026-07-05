import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createService,
  deleteService,
  listMainServices,
  listServices,
  updateService,
} from "../api/services";
import { ServiceForm } from "../components/ServiceForm";
import type { MainService, Service, ServiceInput } from "../types/services";

export function PricesPage() {
  const [catalog, setCatalog] = useState<MainService[]>([]);
  const [mainSlug, setMainSlug] = useState("");
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMainServices();
      setCatalog(data);
      setMainSlug((prev) => prev || data[0]?.slug || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить каталог");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const selectedMain = useMemo(
    () => catalog.find((m) => m.slug === mainSlug),
    [catalog, mainSlug],
  );

  const sections = selectedMain?.services ?? [];

  useEffect(() => {
    if (sections.length === 0) {
      setSectionId(null);
      return;
    }
    if (!sectionId || !sections.some((s) => s.id === sectionId)) {
      setSectionId(sections[0].id);
    }
  }, [sections, sectionId]);

  const loadItems = useCallback(async () => {
    if (!sectionId) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItems(await listServices(sectionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить цены");
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function handleCreate(data: ServiceInput) {
    const created = await createService(data);
    setModal(null);
    setItems((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id));
  }

  async function handleUpdate(data: ServiceInput) {
    if (!editing) return;
    const updated = await updateService(editing.id, data);
    setModal(null);
    setEditing(null);
    setItems((prev) =>
      prev
        .map((row) => (row.id === updated.id ? updated : row))
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    );
  }

  async function handleDelete(row: Service) {
    if (!confirm(`Удалить услугу «${row.name}»?`)) return;
    try {
      await deleteService(row.id);
      setItems((prev) => prev.filter((item) => item.id !== row.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить");
    }
  }

  const selectedSection = sections.find((s) => s.id === sectionId);

  return (
    <>
      <header className="page-header">
        <h1>Цены</h1>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!sectionId}
          onClick={() => {
            setEditing(null);
            setModal("create");
          }}
        >
          Добавить
        </button>
      </header>

      <div className="card filters-card">
        <div className="filters-row">
          <label className="form-field">
            <span>Направление</span>
            <select
              value={mainSlug}
              onChange={(e) => {
                setMainSlug(e.target.value);
                setSectionId(null);
              }}
            >
              {catalog.map((m) => (
                <option key={m.id} value={m.slug}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Раздел</span>
            <select
              value={sectionId ?? ""}
              disabled={sections.length === 0}
              onChange={(e) => setSectionId(Number(e.target.value) || null)}
            >
              {sections.length === 0 ? (
                <option value="">Пока нет разделов</option>
              ) : (
                sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
        {selectedSection?.description ? (
          <p className="filters-hint">{selectedSection.description}</p>
        ) : null}
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="card">
        {loading ? (
          <div className="empty-state">Загрузка…</div>
        ) : !sectionId ? (
          <div className="empty-state">Выберите направление и раздел.</div>
        ) : items.length === 0 ? (
          <div className="empty-state">Услуг пока нет. Нажмите «Добавить».</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Услуга</th>
                  <th>Описание</th>
                  <th>Порядок</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.name}</strong>
                      <div className="desc-preview">id: {row.id}</div>
                    </td>
                    <td>
                      <span className="desc-preview">{row.description || "—"}</span>
                    </td>
                    <td>{row.sort_order}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditing(row);
                            setModal("edit");
                          }}
                        >
                          Изменить
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => void handleDelete(row)}
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

      {modal && sectionId ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => {
            setModal(null);
            setEditing(null);
          }}
        >
          <div
            className="modal modal-wide"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <ServiceForm
              title={modal === "create" ? "Новая услуга" : "Редактирование услуги"}
              sectionId={sectionId}
              sectionSlug={selectedSection?.slug}
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
