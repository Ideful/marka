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
}: {
  headers: string[];
  rows: string[][];
}) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-ink/15" data-service-price-table>
      <table className="w-full text-center text-sm">
        <thead>
          <tr className="bg-ink-muted text-white">
            {headers.map((header) => (
              <th
                key={header}
                className="whitespace-nowrap px-3 py-3 font-medium uppercase tracking-wide"
              >
                {header}
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
                  className="px-3 py-3 font-medium tabular-nums text-ink"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
