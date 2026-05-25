import { useState } from "react";
import "./App.css";
import { AdminLayout, type AdminSection } from "./components/AdminLayout";
import { SpecialistsPage } from "./pages/SpecialistsPage";

export function App() {
  const [section, setSection] = useState<AdminSection>("specialists");

  return (
    <AdminLayout section={section} onSectionChange={setSection}>
      {section === "specialists" ? <SpecialistsPage /> : null}
    </AdminLayout>
  );
}
