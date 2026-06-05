import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSubService,
  deleteSubService,
  listMainServices,
  listSubServices,
  updateSubService,
} from "../api/services";
import { SubServiceForm } from "../components/SubServiceForm";
import type { MainService, SubService, SubServiceInput } from "../types/services";

export function SubServicesPage() {
  const [catalog, setCatalog] = useState<MainService[]>([]);
  const [mainSlug, setMainSlug] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState<number | null>(null);
  const [items, setItems] = useState<SubService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<SubService | null>(null);

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

  const serviceTypes = selectedMain?.services ?? [];

  useEffect(() => {
    if (serviceTypes.length === 0) {
      setServiceTypeId(null);
      return;
    }
    if (!serviceTypeId || !serviceTypes.some((s) => s.id === serviceTypeId)) {
      setServiceTypeId(serviceTypes[0].id);
    }
  }, [serviceTypes, serviceTypeId]);

  const loadItems = useCallback(async () => {
    if (!serviceTypeId) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setItems(await listSubServices(serviceTypeId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить подуслуги");
    } finally {
      setLoading(false);
    }
  }, [serviceTypeId]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function handleCreate(data: SubServiceInput) {
    const created = await createSubService(data);
    setModal(null);
    setItems((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id));
  }

  async function handleUpdate(data: SubServiceInput) {
    if (!editing) return;
    const updated = await updateSubService(editing.id, data);
    setModal(null);
    setEditing(null);
    setItems((prev) =>
      prev
        .map((row) => (row.id === updated.id ? updated : row))
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    );
  }

  async function handleDelete(row: SubService) {
    if (!confirm(`Удалить «${row.name}»?`)) return;
    try {
      await deleteSubService(row.id);
      setItems((prev) => prev.filter((item) => item.id !== row.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить");
    }
  }

  const selectedService = serviceTypes.find((s) => s.id === serviceTypeId);

  return (
    <>
      <header className="page-header">
        <h1>Подуслуги (прайс)</h1>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!serviceTypeId}
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
                setServiceTypeId(null);
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
            <span>Тип услуги</span>
            <select
              value={serviceTypeId ?? ""}
              disabled={serviceTypes.length === 0}
              onChange={(e) => setServiceTypeId(Number(e.target.value) || null)}
            >
              {serviceTypes.length === 0 ? (
                <option value="">Пока нет типов</option>
              ) : (
                serviceTypes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
        {selectedService?.description ? (
          <p className="filters-hint">{selectedService.description}</p>
        ) : null}
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="card">
        {loading ? (
          <div className="empty-state">Загрузка…</div>
        ) : !serviceTypeId ? (
          <div className="empty-state">Выберите направление и тип услуги.</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            Строк прайса пока нет. Нажмите «Добавить».
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Название</th>
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

      {modal && serviceTypeId ? (
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
            <SubServiceForm
              title={modal === "create" ? "Новая подуслуга" : "Редактирование"}
              serviceTypeId={serviceTypeId}
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
