import { useCallback, useEffect, useRef, useState } from "react";
import {
  getGiftCertificateSettings,
  updateGiftCertificateSettings,
} from "../api/site-settings";
import { uploadSitePhoto } from "../api/uploads";
import type { GiftCertificateSettings } from "../types/homepage";

const emptySettings = (): GiftCertificateSettings => ({
  photo_url: "",
  teaser_text: "",
  page_text: "",
});

export function GiftCertificatePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<GiftCertificateSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGiftCertificateSettings();
      setForm({
        photo_url: data.photo_url ?? "",
        teaser_text: data.teaser_text ?? "",
        page_text: data.page_text ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить настройки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
      const { url } = await uploadSitePhoto(file);
      setForm((prev) => ({ ...prev, photo_url: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const data = await updateGiftCertificateSettings(form);
      setForm({
        photo_url: data.photo_url ?? "",
        teaser_text: data.teaser_text ?? "",
        page_text: data.page_text ?? "",
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || uploading;

  return (
    <>
      <header className="page-header">
        <h1>Подарочный сертификат</h1>
      </header>

      <div className="card">
        <p className="sections-editor-hint">
          Фото и тексты для блока на главной и для страницы «Сертификаты».
        </p>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {saved ? <div className="alert alert-info">Сохранено</div> : null}

        {loading ? (
          <div className="empty-state">Загрузка…</div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="specialist-form">
            <div className="form-field">
              <span className="form-label">Фото сертификата</span>
              <div className="photo-upload">
                {form.photo_url ? (
                  <img src={form.photo_url} alt="" className="photo-upload-preview" />
                ) : (
                  <div className="photo-upload-placeholder">Нет фото</div>
                )}
                <div className="photo-upload-actions">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    id="gc-photo-file"
                    disabled={busy}
                    onChange={(e) => void handleFileChange(e.target.files?.[0])}
                  />
                  <label htmlFor="gc-photo-file" className={`btn btn-sm ${busy ? "disabled" : ""}`}>
                    {uploading ? "Загрузка…" : "Загрузить"}
                  </label>
                  {form.photo_url ? (
                    <button
                      type="button"
                      className="btn btn-sm"
                      disabled={busy}
                      onClick={() => setForm((prev) => ({ ...prev, photo_url: "" }))}
                    >
                      Убрать
                    </button>
                  ) : null}
                </div>
              </div>
              <input
                type="text"
                value={form.photo_url}
                placeholder="Или вставьте URL (/marka/... или https://)"
                disabled={busy}
                onChange={(e) => setForm((prev) => ({ ...prev, photo_url: e.target.value }))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="gc-teaser-text">Текст на главной</label>
              <textarea
                id="gc-teaser-text"
                value={form.teaser_text}
                onChange={(e) => setForm((prev) => ({ ...prev, teaser_text: e.target.value }))}
                rows={4}
                disabled={busy}
                placeholder="Короткий текст в блоке «Подарочный сертификат» на главной"
              />
            </div>

            <div className="form-field">
              <label htmlFor="gc-page-text">Текст на странице сертификатов</label>
              <textarea
                id="gc-page-text"
                value={form.page_text}
                onChange={(e) => setForm((prev) => ({ ...prev, page_text: e.target.value }))}
                rows={8}
                disabled={busy}
                placeholder="Подробное описание: номиналы, как купить, условия использования"
              />
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
