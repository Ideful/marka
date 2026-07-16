import { useState, type FormEvent } from "react";
import {
  emptySpecialistPrices,
  normalizeSpecialistPrices,
  specialistPricesHasValue,
  specialistToggleKeysForMain,
  SPECIALIST_TOGGLE_LABELS,
  validateSpecialistPrices,
  type SpecialistPrices,
  type SpecialistToggleKey,
} from "../types/specialist-prices";
import { usesServiceRows } from "../types/table-templates";
import type { Service, ServiceInput } from "../types/services";
import { parsePriceInput } from "../types/price-tiers";

type Props = {
  title: string;
  sectionId: number;
  mainSlug?: string;
  tableTemplate?: string;
  initial?: Service;
  onSubmit: (data: ServiceInput) => Promise<void>;
  onCancel: () => void;
};

function specialistPricesFromInitial(initial: Service | undefined, mainSlug?: string): SpecialistPrices {
  return normalizeSpecialistPrices(initial?.specialist_prices, mainSlug);
}

function priceInputValue(value: number | undefined): string {
  return value && value > 0 ? String(value) : "";
}

export function ServiceForm({
  title,
  sectionId,
  mainSlug,
  tableTemplate,
  initial,
  onSubmit,
  onCancel,
}: Props) {
  const useSpecialistPrices = usesServiceRows(tableTemplate as never);
  const toggleKeys = specialistToggleKeysForMain(mainSlug);
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [specialistPrices, setSpecialistPrices] = useState<SpecialistPrices>(() =>
    specialistPricesFromInitial(initial, mainSlug),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateSpecialistPrice(key: SpecialistToggleKey, raw: string) {
    if (raw !== "" && !/^\d*$/.test(raw)) return;
    setSpecialistPrices((prev) => ({ ...prev, [key]: parsePriceInput(raw) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Укажите название услуги");
      return;
    }

    if (!useSpecialistPrices) {
      setError("Этот раздел редактируется через матрицу прайса");
      return;
    }

    const normalized = normalizeSpecialistPrices(specialistPrices, mainSlug);
    const priceError = validateSpecialistPrices(normalized, mainSlug);
    if (priceError) {
      setError(priceError);
      return;
    }
    if (!specialistPricesHasValue(normalized, mainSlug)) {
      setError("Укажите хотя бы одну цену больше 0");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        section_id: sectionId,
        name: name.trim(),
        description: description.trim(),
        sort_order: sortOrder,
        specialist_prices: {
          ...emptySpecialistPrices(),
          ...normalized,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="specialist-form">
      <h2>{title}</h2>
      {error ? <div className="alert alert-error">{error}</div> : null}

      <div className="form-field">
        <label htmlFor="service-name">Услуга</label>
        <input
          id="service-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          disabled={saving}
        />
      </div>

      <div className="form-field">
        <label htmlFor="service-desc">Описание</label>
        <textarea
          id="service-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          disabled={saving}
        />
      </div>

      <div className="form-field">
        <label htmlFor="service-order">Порядок</label>
        <input
          id="service-order"
          type="number"
          min={0}
          step={1}
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
          disabled={saving}
        />
      </div>

      <div className="form-field">
        <span className="form-label">Цены по типу специалиста (руб.)</span>
        <p className="sections-editor-hint">Символ ₽ на сайте добавится автоматически.</p>
        <div className="sections-table-wrap">
          <table className="sections-table price-matrix">
            <thead>
              <tr>
                {toggleKeys.map((key) => (
                  <th key={key}>{SPECIALIST_TOGGLE_LABELS[key]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {toggleKeys.map((key) => (
                  <td key={key}>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={priceInputValue(specialistPrices[key])}
                      placeholder="2000"
                      disabled={saving}
                      onChange={(e) => updateSpecialistPrice(key, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn" onClick={onCancel} disabled={saving}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
      </div>
    </form>
  );
}
