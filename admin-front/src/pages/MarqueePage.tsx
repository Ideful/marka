import { useCallback, useEffect, useState } from "react";
import { getMarqueeSettings, updateMarqueeSettings } from "../api/site-settings";

export function MarqueePage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMarqueeSettings();
      setText(data.text ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить текст");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const data = await updateMarqueeSettings(text);
      setText(data.text ?? "");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Бегущая строка</h1>
      </header>

      <div className="card">
        <p className="sections-editor-hint">
          Текст показывается только на главной странице сайта. Пустое поле — полоса скрыта.
        </p>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {saved ? <div className="alert alert-info">Сохранено</div> : null}

        {loading ? (
          <div className="empty-state">Загрузка…</div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="specialist-form">
            <div className="form-field">
              <label htmlFor="marquee-text">Текст</label>
              <textarea
                id="marquee-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                disabled={saving}
                placeholder="Салон красоты Марка Арена · Балашиха"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Сохранение…" : "Сохранить"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
