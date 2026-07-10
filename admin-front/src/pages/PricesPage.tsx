import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createService,
  deleteService,
  getSection,
  listMainServices,
  listServices,
  updateSectionDescription,
  updateSectionPayload,
  updateSectionPortfolio,
  updateService,
} from "../api/services";
import { SectionDescriptionEditor } from "../components/SectionDescriptionEditor";
import { SectionPayloadEditor } from "../components/SectionPayloadEditor";
import { SectionPortfolioEditor } from "../components/SectionPortfolioEditor";
import { ServiceForm } from "../components/ServiceForm";
import type { MainService, Service, ServiceInput } from "../types/services";
import type { Portfolio } from "../types/specialist";
import {
  usesSectionPayload,
  usesServiceRows,
  type TableTemplate,
} from "../types/table-templates";

export function PricesPage() {
  const [catalog, setCatalog] = useState<MainService[]>([]);
  const [selectedMainSlug, setSelectedMainSlug] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [tableTemplate, setTableTemplate] = useState<TableTemplate | undefined>();
  const [sectionPayload, setSectionPayload] = useState<unknown>({});
  const [sectionDescription, setSectionDescription] = useState("");
  const [sectionPortfolio, setSectionPortfolio] = useState<Portfolio[]>([]);
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
      setSelectedMainSlug((prev) => prev || data[0]?.slug || "");
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
    () => catalog.find((main) => main.slug === selectedMainSlug),
    [catalog, selectedMainSlug],
  );

  const sectionOptions = useMemo(() => {
    if (!selectedMain) return [];
    return (selectedMain.services ?? []).map((section) => ({
      id: section.id,
      slug: section.slug,
      name: section.name,
      description: section.description,
      mainSlug: selectedMain.slug,
      mainName: selectedMain.name,
    }));
  }, [selectedMain]);

  useEffect(() => {
    if (sectionOptions.length === 0) {
      setSelectedSectionId(null);
      return;
    }
    if (!selectedSectionId || !sectionOptions.some((s) => s.id === selectedSectionId)) {
      setSelectedSectionId(sectionOptions[0].id);
    }
  }, [sectionOptions, selectedSectionId]);

  const selectedSection = useMemo(
    () => sectionOptions.find((s) => s.id === selectedSectionId),
    [sectionOptions, selectedSectionId],
  );

  const loadSectionData = useCallback(async () => {
    if (!selectedSection) {
      setItems([]);
      setSectionPayload({});
      setSectionDescription("");
      setSectionPortfolio([]);
      setTableTemplate(undefined);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const section = await getSection(selectedSection.mainSlug, selectedSection.slug);
      setTableTemplate(section.table_template);
      setSectionPayload(section.payload ?? {});
      setSectionDescription(section.description ?? "");
      setSectionPortfolio(section.portfolio ?? []);

      if (usesServiceRows(section.table_template)) {
        setItems(await listServices(section.id));
      } else {
        setItems([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить раздел");
    } finally {
      setLoading(false);
    }
  }, [selectedSection]);

  useEffect(() => {
    void loadSectionData();
  }, [loadSectionData]);

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

  async function handlePayloadSave(payload: unknown) {
    if (!selectedSection) return;
    const updated = await updateSectionPayload(
      selectedSection.mainSlug,
      selectedSection.slug,
      payload,
    );
    setSectionPayload(updated.payload ?? payload);
  }

  async function handleDescriptionSave(description: string) {
    if (!selectedSection) return;
    const updated = await updateSectionDescription(
      selectedSection.mainSlug,
      selectedSection.slug,
      description,
    );
    setSectionDescription(updated.description ?? description);
  }

  async function handlePortfolioSave(portfolio: Portfolio[]) {
    if (!selectedSection) return;
    const updated = await updateSectionPortfolio(
      selectedSection.mainSlug,
      selectedSection.slug,
      portfolio,
    );
    setSectionPortfolio(updated.portfolio ?? portfolio);
  }

  const isPayloadSection = usesSectionPayload(tableTemplate);
  const isServiceSection = usesServiceRows(tableTemplate);

  return (
    <>
      <header className="page-header">
        <h1>Услуги</h1>
        {isServiceSection ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!selectedSectionId}
            onClick={() => {
              setEditing(null);
              setModal("create");
            }}
          >
            Добавить
          </button>
        ) : null}
      </header>

      <div className="card filters-card">
        <div className="stack-gap">
          <div className="row-actions">
            {catalog.map((main) => {
              const active = main.slug === selectedMainSlug;
              return (
                <button
                  key={main.id}
                  type="button"
                  className={`btn btn-sm ${active ? "btn-primary" : ""}`}
                  onClick={() => {
                    setSelectedMainSlug(main.slug);
                    setSelectedSectionId(null);
                  }}
                >
                  {main.name}
                </button>
              );
            })}
          </div>

          <div className="stack-gap">
            <h3>{selectedMain?.name ?? "Разделы"}</h3>
            <div className="row-actions">
              {sectionOptions.map((section) => {
                const active = section.id === selectedSectionId;
                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`btn btn-sm ${active ? "btn-primary" : ""}`}
                    onClick={() => setSelectedSectionId(section.id)}
                  >
                    {section.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {loading ? (
        <div className="card">
          <div className="empty-state">Загрузка…</div>
        </div>
      ) : !selectedSection ? (
        <div className="card">
          <div className="empty-state">Выберите раздел.</div>
        </div>
      ) : (
        <>
          {isPayloadSection && tableTemplate ? (
            <div className="card">
              <SectionPayloadEditor
                mainSlug={selectedSection.mainSlug}
                sectionSlug={selectedSection.slug}
                tableTemplate={tableTemplate}
                initialPayload={sectionPayload}
                onSave={handlePayloadSave}
              />
            </div>
          ) : (
            <div className="card">
              {items.length === 0 ? (
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
          )}

          <div className="card">
            <SectionDescriptionEditor
              key={`desc-${selectedSection.mainSlug}-${selectedSection.slug}`}
              sectionName={selectedSection.name}
              initialDescription={sectionDescription}
              onSave={handleDescriptionSave}
            />
          </div>

          <div className="card">
            <SectionPortfolioEditor
              key={`${selectedSection.mainSlug}-${selectedSection.slug}`}
              initialPortfolio={sectionPortfolio}
              onSave={handlePortfolioSave}
            />
          </div>
        </>
      )}

      {modal && selectedSectionId ? (
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
              sectionId={selectedSectionId}
              tableTemplate={tableTemplate}
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
