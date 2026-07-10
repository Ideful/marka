import { useState, type FormEvent } from "react";

type Props = {
  sectionName: string;
  initialDescription: string;
  onSave: (description: string) => Promise<void>;
};

export function SectionDescriptionEditor({ sectionName, initialDescription, onSave }: Props) {
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(description.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="specialist-form">
      <h2>Описание раздела «{sectionName}»</h2>
      <p className="sections-editor-hint">
        Текст под прайсом на странице раздела. Поддерживаются переносы строк.
      </p>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <textarea
        value={description}
        placeholder="Расскажите об услуге, особенностях, рекомендациях…"
        rows={6}
        disabled={saving}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Сохранение…" : "Сохранить описание"}
        </button>
      </div>
    </form>
  );
}
