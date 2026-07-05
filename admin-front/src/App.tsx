import { useState } from "react";
import "./App.css";
import { AdminLayout, type AdminSection } from "./components/AdminLayout";
import { MarqueePage } from "./pages/MarqueePage";
import { HomepagePortfolioPage } from "./pages/HomepagePortfolioPage";
import { GiftCertificatePage } from "./pages/GiftCertificatePage";
import { SpecialistsPage } from "./pages/SpecialistsPage";
import { SubServicesPage } from "./pages/SubServicesPage";

const ADMIN_USERNAME = "r721rQWD";
const ADMIN_PASSWORD = "ygb87!@E$8";
const AUTH_STORAGE_KEY = "marka-admin-auth";

export function App() {
  const [section, setSection] = useState<AdminSection>("specialists");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => window.sessionStorage.getItem(AUTH_STORAGE_KEY) === "1",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, "1");
      setIsAuthenticated(true);
      setAuthError("");
      setPassword("");
      return;
    }
    setAuthError("Неверный логин или пароль.");
  }

  function handleLogout() {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  }

  if (!isAuthenticated) {
    return (
      <div className="login-shell">
        <form className="login-card" onSubmit={handleLoginSubmit}>
          <h1>Вход в админку</h1>
          <p className="login-hint">Введите логин и пароль администратора</p>
          {authError ? <div className="alert alert-error">{authError}</div> : null}

          <label className="form-field">
            <span>Логин</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="form-field">
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit" className="btn btn-primary login-submit">
            Войти
          </button>
        </form>
      </div>
    );
  }

  return (
    <AdminLayout section={section} onSectionChange={setSection} onLogout={handleLogout}>
      {section === "specialists" ? <SpecialistsPage /> : null}
      {section === "sub-services" ? <SubServicesPage /> : null}
      {section === "marquee" ? <MarqueePage /> : null}
      {section === "homepage-portfolio" ? <HomepagePortfolioPage /> : null}
      {section === "gift-certificate" ? <GiftCertificatePage /> : null}
    </AdminLayout>
  );
}
