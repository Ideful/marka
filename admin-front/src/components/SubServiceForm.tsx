import { useState, type FormEvent } from "react";
import {
  SPECIALIST_TIER_KEYS,
  SPECIALIST_TIER_LABELS,
  emptyGenderedPrices,
  parsePriceInput,
  pricesHasValue,
  validateGenderedPrices,
  type GenderedPrices,
  type SpecialistTierKey,
} from "../types/price-tiers";
import type { SubService, SubServiceInput } from "../types/services";

type Props = {
  title: string;
  serviceTypeId: number;
  initial?: SubService;
  onSubmit: (data: SubServiceInput) => Promise<void>;
  onCancel: () => void;
};

function pricesFromInitial(initial?: SubService): GenderedPrices {
  if (initial?.prices) return initial.prices;
  return emptyGenderedPrices();
}

function priceInputValue(value: number): string {
  return value > 0 ? String(value) : "";
}

export function SubServiceForm({
  title,
  serviceTypeId,
  initial,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [prices, setPrices] = useState<GenderedPrices>(() => pricesFromInitial(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updatePrice(
    gender: "female" | "male",
    tier: SpecialistTierKey,
    raw: string,
  ) {
    if (raw !== "" && !/^\d*$/.test(raw)) {
      return;
    }
    setPrices((prev) => ({
      ...prev,
      [gender]: { ...prev[gender], [tier]: parsePriceInput(raw) },
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Укажите название");
      return;
    }
    const priceError = validateGenderedPrices(prices);
    if (priceError) {
      setError(priceError);
      return;
    }
    if (!pricesHasValue(prices)) {
      setError("Укажите хотя бы одну цену больше 0");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        service_type_id: serviceTypeId,
        name: name.trim(),
        description: description.trim(),
        prices,
        sort_order: sortOrder,
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
        <label htmlFor="sub-name">Название</label>
        <input
          id="sub-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          disabled={saving}
        />
      </div>

      <div className="form-field">
        <label htmlFor="sub-desc">Описание</label>
        <textarea
          id="sub-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={saving}
        />
      </div>

      <div className="form-field">
        <label htmlFor="sub-order">Порядок</label>
        <input
          id="sub-order"
          type="number"
          min={0}
          step={1}
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
          disabled={saving}
        />
      </div>

      <div className="form-field">
        <span className="form-label">Цены (руб., только цифры)</span>
        <p className="sections-editor-hint">Символ ₽ на сайте добавится автоматически.</p>
        <div className="sections-table-wrap">
          <table className="sections-table price-matrix">
            <thead>
              <tr>
                <th>Пол</th>
                {SPECIALIST_TIER_KEYS.map((key) => (
                  <th key={key}>{SPECIALIST_TIER_LABELS[key]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["female", "male"] as const).map((gender) => (
                <tr key={gender}>
                  <td>{gender === "female" ? "Женщины" : "Мужчины"}</td>
                  {SPECIALIST_TIER_KEYS.map((key) => (
                    <td key={key}>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={priceInputValue(prices[gender][key])}
                        placeholder="2000"
                        disabled={saving}
                        onChange={(e) => updatePrice(gender, key, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
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
