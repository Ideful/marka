import { useState, type FormEvent } from "react";
import {
  HAIR_LENGTH_KEYS,
  HAIR_LENGTH_LABELS,
  emptyLengthPrices,
  validateLengthPrices,
  type LengthPrices,
} from "../types/length-prices";
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
import type { Service, ServiceInput } from "../types/services";

type Props = {
  title: string;
  sectionId: number;
  sectionSlug?: string;
  initial?: Service;
  onSubmit: (data: ServiceInput) => Promise<void>;
  onCancel: () => void;
};

function pricesFromInitial(initial?: Service): GenderedPrices {
  if (initial?.prices) return initial.prices;
  return emptyGenderedPrices();
}

function lengthPricesFromInitial(initial?: Service): LengthPrices {
  if (initial?.length_prices) return initial.length_prices;
  return emptyLengthPrices();
}

function priceInputValue(value: number): string {
  return value > 0 ? String(value) : "";
}

export function ServiceForm({
  title,
  sectionId,
  sectionSlug,
  initial,
  onSubmit,
  onCancel,
}: Props) {
  const useLengthPrices = sectionSlug === "okrashivanie";
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [prices, setPrices] = useState<GenderedPrices>(() => pricesFromInitial(initial));
  const [lengthPrices, setLengthPrices] = useState<LengthPrices>(() =>
    lengthPricesFromInitial(initial),
  );
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

  function updateLengthPrice(key: keyof LengthPrices, raw: string) {
    if (raw !== "" && !/^\d*$/.test(raw)) {
      return;
    }
    setLengthPrices((prev) => ({ ...prev, [key]: parsePriceInput(raw) }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Укажите название услуги");
      return;
    }

    if (useLengthPrices) {
      const priceError = validateLengthPrices(lengthPrices);
      if (priceError) {
        setError(priceError);
        return;
      }
    } else {
      const priceError = validateGenderedPrices(prices);
      if (priceError) {
        setError(priceError);
        return;
      }
      if (!pricesHasValue(prices)) {
        setError("Укажите хотя бы одну цену больше 0");
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        section_id: sectionId,
        name: name.trim(),
        description: description.trim(),
        sort_order: sortOrder,
        ...(useLengthPrices ? { length_prices: lengthPrices } : { prices }),
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
        <span className="form-label">
          {useLengthPrices ? "Цены по длине волос (руб.)" : "Цены (руб., только цифры)"}
        </span>
        <p className="sections-editor-hint">Символ ₽ на сайте добавится автоматически.</p>
        {useLengthPrices ? (
          <div className="sections-table-wrap">
            <table className="sections-table price-matrix">
              <thead>
                <tr>
                  {HAIR_LENGTH_KEYS.map((key) => (
                    <th key={key}>{HAIR_LENGTH_LABELS[key]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {HAIR_LENGTH_KEYS.map((key) => (
                    <td key={key}>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={priceInputValue(lengthPrices[key])}
                        placeholder="6000"
                        disabled={saving}
                        onChange={(e) => updateLengthPrice(key, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
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
        )}
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
