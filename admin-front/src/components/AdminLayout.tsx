import type { ReactNode } from "react";
import "./AdminLayout.css";

export type AdminSection =
  | "specialists"
  | "prices"
  | "seo"
  | "marquee"
  | "homepage-portfolio"
  | "gift-certificate";

type NavItem = {
  id: AdminSection;
  label: string;
  enabled: boolean;
};

const NAV: NavItem[] = [
  { id: "specialists", label: "Специалисты", enabled: true },
  { id: "prices", label: "Услуги", enabled: true },
  { id: "seo", label: "SEO", enabled: true },
  { id: "marquee", label: "Бегущая строка", enabled: true },
  { id: "homepage-portfolio", label: "Портфолио", enabled: true },
  { id: "gift-certificate", label: "Сертификат", enabled: true },
];

type Props = {
  section: AdminSection;
  onSectionChange: (id: AdminSection) => void;
  onLogout?: () => void;
  children: ReactNode;
};

export function AdminLayout({ section, onSectionChange, onLogout, children }: Props) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">МАРКА · админ</div>
        <nav className="admin-nav" aria-label="Разделы">
          {NAV.map((item) =>
            item.enabled ? (
              <button
                key={item.id}
                type="button"
                className={section === item.id ? "active" : ""}
                onClick={() => onSectionChange(item.id)}
              >
                {item.label}
              </button>
            ) : (
              <button key={item.id} type="button" disabled>
                {item.label}
              </button>
            ),
          )}
        </nav>
        {onLogout ? (
          <div className="admin-sidebar-footer">
            <button type="button" className="btn" onClick={onLogout}>
              Выйти
            </button>
          </div>
        ) : null}
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
