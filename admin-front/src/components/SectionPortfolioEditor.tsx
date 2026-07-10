import { useState, type FormEvent } from "react";
import { uploadSitePhoto } from "../api/uploads";
import {
  emptyPortfolioItem,
  normalizePortfolio,
  type Portfolio,
} from "../types/specialist";

type Props = {
  initialPortfolio: Portfolio[];
  onSave: (portfolio: Portfolio[]) => Promise<void>;
};

export function SectionPortfolioEditor({ initialPortfolio, onSave }: Props) {
  const [portfolio, setPortfolio] = useState<Portfolio[]>(() =>
    initialPortfolio.length > 0 ? initialPortfolio : [emptyPortfolioItem()],
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updatePortfolio(index: number, patch: Partial<Portfolio>) {
    setPortfolio((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function addPortfolio() {
    setPortfolio((prev) => [...prev, emptyPortfolioItem()]);
  }

  function removePortfolio(index: number) {
    setPortfolio((prev) => {
      if (prev.length <= 1) return [emptyPortfolioItem()];
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handlePortfolioFileChange(index: number, file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Выберите файл изображения");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError("Файл больше 6 МБ");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadSitePhoto(file);
      updatePortfolio(index, { photo_url: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(normalizePortfolio(portfolio));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || uploading;

  return (
    <form onSubmit={handleSubmit} className="specialist-form">
      <div className="sections-editor-head">
        <h2>Примеры работ</h2>
        <button type="button" className="btn btn-sm" disabled={busy} onClick={addPortfolio}>
          + Добавить фото
        </button>
      </div>
      <p className="sections-editor-hint">
        Фото работ для этого раздела. Показываются на странице услуги после описания.
      </p>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div className="sections-table-wrap">
        <table className="sections-table">
          <thead>
            <tr>
              <th>Фото</th>
              <th>Описание</th>
              <th aria-label="Действия" />
            </tr>
          </thead>
          <tbody>
            {portfolio.map((item, index) => (
              <tr key={index}>
                <td>
                  <div className="portfolio-cell">
                    {item.photo_url ? (
                      <img src={item.photo_url} alt="" className="thumb" loading="lazy" />
                    ) : (
                      <div className="thumb-placeholder">нет</div>
                    )}
                    <div className="photo-upload-actions">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        id={`section-portfolio-file-${index}`}
                        disabled={busy}
                        onChange={(e) => void handlePortfolioFileChange(index, e.target.files?.[0])}
                      />
                      <label
                        htmlFor={`section-portfolio-file-${index}`}
                        className={`btn btn-sm ${busy ? "disabled" : ""}`}
                      >
                        {uploading ? "Загрузка…" : "Загрузить"}
                      </label>
                    </div>
                    <input
                      type="text"
                      value={item.photo_url}
                      placeholder="Или вставьте URL (/marka/... или https://)"
                      disabled={busy}
                      onChange={(e) => updatePortfolio(index, { photo_url: e.target.value })}
                    />
                  </div>
                </td>
                <td>
                  <textarea
                    value={item.description}
                    placeholder="Подпись к фото"
                    rows={3}
                    disabled={busy}
                    onChange={(e) => updatePortfolio(index, { description: e.target.value })}
                  />
                </td>
                <td className="sections-table-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    disabled={busy}
                    onClick={() => removePortfolio(index)}
                    aria-label="Удалить фото портфолио"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {saving ? "Сохранение…" : "Сохранить портфолио"}
        </button>
      </div>
    </form>
  );
}
