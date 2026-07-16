import Link from "next/link";

const BOOKING_URL = "https://n717666.yclients.com/company/677152/personal/menu?o=";

export function BookingConsultationLink() {
  return (
    <Link
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl bg-ink-muted px-6 py-4 text-center text-lg font-medium uppercase leading-tight tracking-wide text-white transition hover:bg-ink-muted/90 md:text-xl"
    >
      Бесплатная консультация со специалистом
    </Link>
  );
}

export function PriceMatrixTable({
  headers,
  rows,
  layout = "default",
}: {
  headers: string[];
  rows: string[][];
  layout?: "default" | "service-length";
}) {
  if (rows.length === 0) return null;

  const isServiceLength = layout === "service-length";
  const firstColClass = isServiceLength
    ? "px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide sm:text-xs"
    : "w-[42%] px-2 py-3 text-left text-xs font-medium uppercase tracking-wide sm:px-3 sm:text-sm";
  const dataColClass = isServiceLength
    ? "px-2 py-2.5 text-center align-middle text-[10px] font-medium uppercase tracking-wide sm:px-3 sm:text-xs"
    : "px-1 py-3 text-center text-xs font-medium uppercase tracking-wide sm:px-2 sm:text-sm";
  const firstCellClass = isServiceLength
    ? "px-3 py-2.5 text-left align-middle text-[10px] font-medium leading-snug text-ink sm:text-xs"
    : "px-2 py-3 text-left text-xs font-medium leading-snug text-ink sm:px-3 sm:text-sm";
  const dataCellClass = isServiceLength
    ? "px-2 py-2.5 text-center align-middle text-[10px] font-medium tabular-nums text-ink sm:px-3 sm:text-xs"
    : "px-1 py-3 text-center text-xs font-medium tabular-nums text-ink sm:px-2 sm:text-sm";

  return (
    <div className="rounded-xl border border-ink/15" data-service-price-table>
      <table className="w-full table-fixed text-sm">
        {isServiceLength ? (
          <colgroup>
            <col className="w-[32%]" />
            <col className="w-[23%]" />
            <col className="w-[23%]" />
            <col className="w-[22%]" />
          </colgroup>
        ) : null}
        <thead>
          <tr className="bg-ink-muted text-white">
            {headers.map((header, index) => (
              <th
                key={header}
                className={index === 0 ? firstColClass : dataColClass}
              >
                {isServiceLength && index > 0 ? (
                  <span className="mx-auto block w-full text-center">{header}</span>
                ) : (
                  header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, index) => (
            <tr key={`${cells[0]}-${index}`} className={index % 2 === 0 ? "bg-white" : "bg-sand/40"}>
              {cells.map((cell, cellIndex) => (
                <td
                  key={`${cell}-${cellIndex}`}
                  className={cellIndex === 0 ? firstCellClass : dataCellClass}
                >
                  {isServiceLength && cellIndex > 0 ? (
                    <span className="mx-auto block w-full text-center">{cell}</span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
