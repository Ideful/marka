import { useCallback, useEffect, useState, type FormEvent } from "react";
import { listSeoPages, updateSeoPage, type SeoGroup, type SeoPage } from "../api/seo";

export function SeoPage() {
  const [groups, setGroups] = useState<SeoGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<SeoPage | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSeoPages();
      setGroups(data.groups ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить SEO");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openEditor(page: SeoPage) {
    setEditing(page);
    setTitle(page.meta_title ?? "");
    setDescription(page.meta_description ?? "");
    setSaveError(null);
  }

  function closeEditor() {
    if (saving) return;
    setEditing(null);
    setSaveError(null);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateSeoPage(editing.key, {
        meta_title: title.trim(),
        meta_description: description.trim(),
      });
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          pages: group.pages.map((page) => (page.key === updated.key ? updated : page)),
        })),
      );
      setEditing(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>SEO</h1>
      </header>

      <div className="card">
        <p className="sections-editor-hint">
          Meta Title и Meta Description для страниц меню, направлений и разделов услуг. Нажмите на
          страницу, чтобы отредактировать.
        </p>
        {error ? <div className="alert alert-error">{error}</div> : null}
        {loading ? <div className="empty-state">Загрузка…</div> : null}
      </div>

      {!loading
        ? groups.map((group) => (
            <div key={group.id} className="card">
              <h2>{group.label}</h2>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Страница</th>
                      <th>Путь</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {group.pages.map((page) => (
                      <tr
                        key={page.key}
                        className="seo-row"
                        onClick={() => openEditor(page)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>
                          <strong>{page.label}</strong>
                          {page.parent_label ? (
                            <div className="desc-preview">{page.parent_label}</div>
                          ) : null}
                        </td>
                        <td>
                          <span className="desc-preview">{page.path}</span>
                        </td>
                        <td>
                          <span className="desc-preview">
                            {page.meta_title || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="desc-preview">
                            {page.meta_description || "—"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditor(page);
                            }}
                          >
                            Изменить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        : null}

      {editing ? (
        <div className="modal-backdrop" role="presentation" onClick={closeEditor}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="seo-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={(e) => void handleSave(e)} className="specialist-form">
              <h2 id="seo-edit-title">{editing.label}</h2>
              <p className="sections-editor-hint">
                {editing.parent_label ? `${editing.parent_label} · ` : ""}
                {editing.path}
              </p>
              {saveError ? <div className="alert alert-error">{saveError}</div> : null}

              <div className="form-field">
                <label htmlFor="seo-title">Meta Title</label>
                <input
                  id="seo-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={saving}
                  placeholder="Заголовок страницы в поиске"
                  autoFocus
                />
              </div>

              <div className="form-field">
                <label htmlFor="seo-description">Meta Description</label>
                <textarea
                  id="seo-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={saving}
                  placeholder="Краткое описание для поисковиков"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn" onClick={closeEditor} disabled={saving}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Сохранение…" : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
