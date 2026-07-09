import { useMemo, useState, type FormEvent } from "react";
import { parsePriceInput } from "../types/price-tiers";
import {
  LENGTH_LABELS,
  VARIANT_LABELS,
  rankLabel,
  type TableTemplate,
} from "../types/table-templates";

type Props = {
  mainSlug: string;
  sectionSlug: string;
  tableTemplate: TableTemplate;
  initialPayload: unknown;
  onSave: (payload: unknown) => Promise<void>;
};

function priceInputValue(value: number | null | undefined): string {
  if (value == null || value <= 0) return "";
  return String(value);
}

function parseNullablePrice(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const value = parsePriceInput(raw);
  return value > 0 ? value : 0;
}

function PriceCell({
  value,
  disabled,
  onChange,
}: {
  value: number | null | undefined;
  disabled?: boolean;
  onChange: (value: number | null) => void;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={priceInputValue(value)}
      placeholder="0"
      disabled={disabled}
      onChange={(e) => {
        if (e.target.value !== "" && !/^\d*$/.test(e.target.value)) return;
        onChange(parseNullablePrice(e.target.value));
      }}
    />
  );
}

export function SectionPayloadEditor({
  tableTemplate,
  initialPayload,
  onSave,
}: Props) {
  const [payload, setPayload] = useState<unknown>(initialPayload ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editor = useMemo(() => {
    switch (tableTemplate) {
      case "rank_gender_matrix":
        return renderRankGenderMatrix(payload, setPayload);
      case "rank_variant_matrix":
        return renderRankVariantMatrix(payload, setPayload);
      case "service_length_matrix":
        return renderServiceLengthMatrix(payload, setPayload);
      case "service_rank_matrix_grouped":
        return renderGroupedMatrix(payload, setPayload);
      case "service_single_rank_matrix":
        return renderSingleRankMatrix(payload, setPayload);
      default:
        return <p className="filters-hint">Редактор для этого шаблона пока не настроен.</p>;
    }
  }, [payload, tableTemplate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="specialist-form">
      <h2>Редактирование прайса</h2>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div className="sections-table-wrap">{editor}</div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Сохранение…" : "Сохранить прайс"}
        </button>
      </div>
    </form>
  );
}

type RankGenderPayload = {
  rows: Array<{
    rank: string;
    prices: { female: number | null; male: number | null };
  }>;
};

function renderRankGenderMatrix(payload: unknown, setPayload: (value: unknown) => void) {
  const data = (payload ?? { rows: [] }) as RankGenderPayload;
  const rows = data.rows ?? [];

  return (
    <table className="sections-table price-matrix">
      <thead>
        <tr>
          <th>Должность</th>
          <th>Женская</th>
          <th>Мужская</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={row.rank}>
            <td>{rankLabel(row.rank)}</td>
            <td>
              <PriceCell
                value={row.prices.female}
                disabled={row.rank === "barber"}
                onChange={(female) => {
                  const next = structuredClone(data);
                  next.rows[rowIndex].prices.female = female;
                  setPayload(next);
                }}
              />
            </td>
            <td>
              <PriceCell
                value={row.prices.male}
                onChange={(male) => {
                  const next = structuredClone(data);
                  next.rows[rowIndex].prices.male = male;
                  setPayload(next);
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type RankVariantPayload = {
  variants: string[];
  rows: Array<{ rank: string; prices: Record<string, number | null> }>;
};

function renderRankVariantMatrix(payload: unknown, setPayload: (value: unknown) => void) {
  const data = (payload ?? { variants: [], rows: [] }) as RankVariantPayload;
  const variants = data.variants?.length ? data.variants : ["day", "evening"];
  const rows = data.rows ?? [];

  return (
    <table className="sections-table price-matrix">
      <thead>
        <tr>
          <th>Должность</th>
          {variants.map((variant) => (
            <th key={variant}>{VARIANT_LABELS[variant] ?? variant}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={row.rank}>
            <td>{rankLabel(row.rank)}</td>
            {variants.map((variant) => (
              <td key={variant}>
                <PriceCell
                  value={row.prices?.[variant]}
                  onChange={(price) => {
                    const next = structuredClone(data);
                    next.rows[rowIndex].prices[variant] = price;
                    setPayload(next);
                  }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type ServiceLengthPayload = {
  rows: Array<{
    service_slug: string;
    service_name: string;
    prices: Record<string, number | null>;
  }>;
};

function renderServiceLengthMatrix(payload: unknown, setPayload: (value: unknown) => void) {
  const data = (payload ?? { rows: [] }) as ServiceLengthPayload;
  const rows = data.rows ?? [];
  const lengthKeys = ["short", "medium", "long"];

  return (
    <table className="sections-table price-matrix">
      <thead>
        <tr>
          <th>Услуга</th>
          {lengthKeys.map((key) => (
            <th key={key}>{LENGTH_LABELS[key]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={row.service_slug}>
            <td>{row.service_name}</td>
            {lengthKeys.map((key) => (
              <td key={key}>
                <PriceCell
                  value={row.prices?.[key]}
                  onChange={(price) => {
                    const next = structuredClone(data);
                    next.rows[rowIndex].prices[key] = price;
                    setPayload(next);
                  }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type GroupedPayload = {
  groups: Array<{
    group_slug: string;
    group_title: string;
    columns: string[];
    rows: Array<{
      service_slug: string;
      service_name: string;
      prices: Record<string, number | null>;
    }>;
  }>;
};

function renderGroupedMatrix(payload: unknown, setPayload: (value: unknown) => void) {
  const data = (payload ?? { groups: [] }) as GroupedPayload;
  const groups = data.groups ?? [];

  return (
    <div className="stack-gap">
      {groups.map((group, groupIndex) => (
        <div key={group.group_slug}>
          <h3>{group.group_title}</h3>
          <table className="sections-table price-matrix">
            <thead>
              <tr>
                <th>Услуга</th>
                {group.columns.map((column) => (
                  <th key={column}>{rankLabel(column)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row, rowIndex) => (
                <tr key={row.service_slug}>
                  <td>{row.service_name}</td>
                  {group.columns.map((column) => (
                    <td key={column}>
                      <PriceCell
                        value={row.prices?.[column]}
                        onChange={(price) => {
                          const next = structuredClone(data);
                          next.groups[groupIndex].rows[rowIndex].prices[column] = price;
                          setPayload(next);
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

type SingleRankPayload = {
  columns: Array<{ key: string; label: string }>;
  rows: Array<{
    service_slug: string;
    service_name: string;
    prices: Record<string, number | null>;
  }>;
};

function renderSingleRankMatrix(payload: unknown, setPayload: (value: unknown) => void) {
  const data = (payload ?? { columns: [], rows: [] }) as SingleRankPayload;
  const columns = data.columns ?? [];
  const rows = data.rows ?? [];

  return (
    <table className="sections-table price-matrix">
      <thead>
        <tr>
          <th>Услуга</th>
          {columns.map((column) => (
            <th key={column.key}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={row.service_slug}>
            <td>{row.service_name}</td>
            {columns.map((column) => (
              <td key={column.key}>
                <PriceCell
                  value={row.prices?.[column.key]}
                  onChange={(price) => {
                    const next = structuredClone(data);
                    next.rows[rowIndex].prices[column.key] = price;
                    setPayload(next);
                  }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
