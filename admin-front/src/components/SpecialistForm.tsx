import { useRef, useState, type FormEvent } from "react";
import { uploadSpecialistPhoto } from "../api/uploads";
import {
  DEFAULT_SPECIALIST_CLASS,
  SPECIALIST_CLASS_KEYS,
  SPECIALIST_CLASS_LABELS,
  isSpecialistClass,
  type SpecialistClass,
} from "../types/specialist-class";
import {
  emptySection,
  emptyPortfolioItem,
  normalizePortfolio,
  normalizeSections,
  type DescriptionSection,
  type Portfolio,
  type Specialist,
  type SpecialistInput,
} from "../types/specialist";

type Props = {
  title: string;
  initial?: Specialist;
  onSubmit: (data: SpecialistInput) => Promise<void>;
  onCancel: () => void;
};

function sectionsFromInitial(initial?: Specialist): DescriptionSection[] {
  const list = initial?.description ?? [];
  if (list.length > 0) {
    return list.map((s) => ({
      title: s.title ?? "",
      description: s.description ?? "",
    }));
  }
  return [emptySection()];
}

function portfolioFromInitial(initial?: Specialist): Portfolio[] {
  const list = initial?.portfolio ?? [];
  if (list.length > 0) {
    return list.map((item) => ({
      photo_url: item.photo_url ?? "",
      description: item.description ?? "",
    }));
  }
  return [emptyPortfolioItem()];
}

export function SpecialistForm({ title, initial, onSubmit, onCancel }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [classKey, setClassKey] = useState<SpecialistClass>(
    initial?.class && isSpecialistClass(initial.class)
      ? initial.class
      : DEFAULT_SPECIALIST_CLASS,
  );
  const [photoUrl, setPhotoUrl] = useState(initial?.photo_url ?? "");
  const [sections, setSections] = useState<DescriptionSection[]>(() =>
    sectionsFromInitial(initial),
  );
  const [portfolio, setPortfolio] = useState<Portfolio[]>(() => portfolioFromInitial(initial));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateSection(index: number, patch: Partial<DescriptionSection>) {
    setSections((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  }

  function addSection() {
    setSections((prev) => [...prev, emptySection()]);
  }

  function removeSection(index: number) {
    setSections((prev) => {
      if (prev.length <= 1) return [emptySection()];
      return prev.filter((_, i) => i !== index);
    });
  }

  function updatePortfolio(index: number, patch: Partial<Portfolio>) {
    setPortfolio((prev) =>
      prev.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
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
      const { url } = await uploadSpecialistPhoto(file);
      updatePortfolio(index, { photo_url: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
    }
  }

  async function handleFileChange(file: File | undefined) {
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
      const { url } = await uploadSpecialistPhoto(file);
      setPhotoUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Укажите имя");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        class: classKey,
        photo_url: photoUrl.trim(),
        description: normalizeSections(sections),
        portfolio: normalizePortfolio(portfolio),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || uploading;

  return (
    <form onSubmit={handleSubmit} className="specialist-form">
      <h2>{title}</h2>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div className="form-field">
        <label htmlFor="sp-name">Имя</label>
        <input
          id="sp-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          disabled={busy}
        />
      </div>
      <div className="form-field">
        <label htmlFor="sp-class">Категория</label>
        <select
          id="sp-class"
          value={classKey}
          disabled={busy}
          onChange={(e) => {
            const v = e.target.value;
            if (isSpecialistClass(v)) setClassKey(v);
          }}
        >
          {SPECIALIST_CLASS_KEYS.map((key) => (
            <option key={key} value={key}>
              {SPECIALIST_CLASS_LABELS[key]}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <span className="form-label">Фото</span>
        <div className="photo-upload">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="photo-upload-preview" />
          ) : (
            <div className="photo-upload-placeholder">Нет фото</div>
          )}
          <div className="photo-upload-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              id="sp-photo-file"
              disabled={busy}
              onChange={(e) => void handleFileChange(e.target.files?.[0])}
            />
            <label htmlFor="sp-photo-file" className={`btn btn-sm ${busy ? "disabled" : ""}`}>
              {uploading ? "Загрузка…" : "Загрузить"}
            </label>
            {photoUrl ? (
              <button
                type="button"
                className="btn btn-sm"
                disabled={busy}
                onClick={() => setPhotoUrl("")}
              >
                Убрать
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="form-field">
        <div className="sections-editor-head">
          <span className="form-label">Портфолио</span>
          <button type="button" className="btn btn-sm" disabled={busy} onClick={addPortfolio}>
            + Добавить фото
          </button>
        </div>
        <p className="sections-editor-hint">
          Добавьте фото работы и краткое описание результата. Порядок сохраняется.
        </p>
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
                          id={`sp-portfolio-file-${index}`}
                          disabled={busy}
                          onChange={(e) =>
                            void handlePortfolioFileChange(index, e.target.files?.[0])
                          }
                        />
                        <label
                          htmlFor={`sp-portfolio-file-${index}`}
                          className={`btn btn-sm ${busy ? "disabled" : ""}`}
                        >
                          {uploading ? "Загрузка…" : "Загрузить"}
                        </label>
                      </div>
                      <input
                        type="url"
                        value={item.photo_url}
                        placeholder="Или вставьте URL"
                        disabled={busy}
                        onChange={(e) =>
                          updatePortfolio(index, { photo_url: e.target.value })
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <textarea
                      value={item.description}
                      placeholder="Что выполнено на фото"
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
      </div>

      <div className="form-field">
        <div className="sections-editor-head">
          <span className="form-label">Блоки описания</span>
          <button type="button" className="btn btn-sm" disabled={busy} onClick={addSection}>
            + Добавить строку
          </button>
        </div>
        <p className="sections-editor-hint">
          «Название» — жирный заголовок на сайте, «Описание» — текст под ним. Порядок строк
          сохраняется.
        </p>
        <div className="sections-table-wrap">
          <table className="sections-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Описание</th>
                <th aria-label="Действия" />
              </tr>
            </thead>
            <tbody>
              {sections.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={row.title}
                      placeholder="Например: Образование"
                      disabled={busy}
                      onChange={(e) => updateSection(index, { title: e.target.value })}
                    />
                  </td>
                  <td>
                    <textarea
                      value={row.description}
                      placeholder="Текст блока"
                      rows={3}
                      disabled={busy}
                      onChange={(e) =>
                        updateSection(index, { description: e.target.value })
                      }
                    />
                  </td>
                  <td className="sections-table-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      disabled={busy}
                      onClick={() => removeSection(index)}
                      aria-label="Удалить строку"
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
        <button type="button" className="btn" onClick={onCancel} disabled={busy}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
