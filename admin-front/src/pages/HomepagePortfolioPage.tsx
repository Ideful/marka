import { useCallback, useEffect, useState } from "react";
import {
  getHomepagePortfolioSettings,
  updateHomepagePortfolioSettings,
} from "../api/site-settings";
import { uploadSitePhoto } from "../api/uploads";
import {
  emptyPortfolioItem,
  normalizePortfolio,
  type PortfolioItem,
} from "../types/homepage";

export function HomepagePortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([emptyPortfolioItem()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHomepagePortfolioSettings();
      const list = data.items ?? [];
      setItems(list.length > 0 ? list : [emptyPortfolioItem()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить портфолио");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function updateItem(index: number, patch: Partial<PortfolioItem>) {
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyPortfolioItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => {
      if (prev.length <= 1) return [emptyPortfolioItem()];
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleFileChange(index: number, file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Выберите файл изображения");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError("Файл больше 6 МБ");
      return;
    }
    setUploadingIndex(index);
    setError(null);
    try {
      const { url } = await uploadSitePhoto(file);
      updateItem(index, { photo_url: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setUploadingIndex(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const data = await updateHomepagePortfolioSettings(normalizePortfolio(items));
      const list = data.items ?? [];
      setItems(list.length > 0 ? list : [emptyPortfolioItem()]);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || uploadingIndex !== null;

  return (
    <>
      <header className="page-header">
        <h1>Портфолио на главной</h1>
      </header>

      <div className="card">
        <p className="sections-editor-hint">
          Фотографии работ в блоке «Портфолио» на главной странице. Подпись необязательна.
        </p>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {saved ? <div className="alert alert-info">Сохранено</div> : null}

        {loading ? (
          <div className="empty-state">Загрузка…</div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="specialist-form">
            <div className="form-field">
              <div className="sections-editor-head">
                <span className="form-label">Фотографии</span>
                <button type="button" className="btn btn-sm" disabled={busy} onClick={addItem}>
                  + Добавить фото
                </button>
              </div>
              <div className="sections-table-wrap">
                <table className="sections-table">
                  <thead>
                    <tr>
                      <th>Фото</th>
                      <th>Подпись</th>
                      <th aria-label="Действия" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="portfolio-cell">
                            {item.photo_url ? (
                              <img src={item.photo_url} alt="" className="photo-upload-preview" />
                            ) : (
                              <div className="photo-upload-placeholder">Нет фото</div>
                            )}
                            <div className="photo-upload-actions">
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="sr-only"
                                id={`hp-portfolio-file-${index}`}
                                disabled={busy}
                                onChange={(e) =>
                                  void handleFileChange(index, e.target.files?.[0])
                                }
                              />
                              <label
                                htmlFor={`hp-portfolio-file-${index}`}
                                className={`btn btn-sm ${busy ? "disabled" : ""}`}
                              >
                                {uploadingIndex === index ? "Загрузка…" : "Загрузить"}
                              </label>
                            </div>
                            <input
                              type="text"
                              value={item.photo_url}
                              placeholder="Или вставьте URL (/marka/... или https://)"
                              disabled={busy}
                              onChange={(e) => updateItem(index, { photo_url: e.target.value })}
                            />
                          </div>
                        </td>
                        <td>
                          <textarea
                            value={item.description}
                            placeholder="Подпись (необязательно)"
                            rows={3}
                            disabled={busy}
                            onChange={(e) => updateItem(index, { description: e.target.value })}
                          />
                        </td>
                        <td className="sections-table-actions">
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            disabled={busy}
                            onClick={() => removeItem(index)}
                            aria-label="Удалить фото"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={busy}>
                {saving ? "Сохранение…" : "Сохранить"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
