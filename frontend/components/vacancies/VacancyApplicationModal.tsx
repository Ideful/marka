"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import type { Vacancy } from "@/data/vacancies";

const EXPERIENCE_OPTIONS = [
  { value: "none", label: "Без опыта" },
  { value: "less1", label: "До 1 года" },
  { value: "1to3", label: "1-3 года" },
  { value: "more3", label: "Более 3 лет" },
] as const;

type Props = {
  vacancy: Vacancy | null;
  onClose: () => void;
};

export function VacancyApplicationModal({ vacancy, onClose }: Props) {
  const formId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState<(typeof EXPERIENCE_OPTIONS)[number]["value"]>("none");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!vacancy) return;
    setName("");
    setPhone("");
    setExperience("none");
    setError(null);
    setSent(false);
  }, [vacancy]);

  useEffect(() => {
    if (!vacancy) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [vacancy]);

  useEffect(() => {
    if (!vacancy) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [vacancy, onClose]);

  if (!vacancy) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/vacancy-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          vacancy_title: vacancy!.title,
          vacancy_slug: vacancy!.slug,
          name: name.trim(),
          phone: phone.trim(),
          experience,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Не удалось отправить отклик");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить отклик");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-title`}
        className="relative z-10 w-full max-w-md rounded-2xl border border-ink/10 bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="text-left">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
              Отклик на вакансию
            </p>
            <h3 id={`${formId}-title`} className="mt-2 text-xl font-bold text-ink md:text-2xl">
              {vacancy.title}
            </h3>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-sand hover:text-ink"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <svg width="16" height="16" viewBox="0 0 19 20" fill="currentColor" aria-hidden>
              <path d="M16.6183 18.924C17.24 19.02 17.5 18.92 17.7 18.72C18.1 18.32 18.1 17.7 17.7 17.3L10.42 10.002 17.72 2.72C18.12 2.32 18.12 1.7 17.72 1.3C17.32 0.9 16.7 0.9 16.3 1.3L9.006 8.585 1.72 1.28C1.32 0.88 0.7 0.88 0.3 1.28C-0.1 1.68 -0.1 2.3 0.3 2.7L7.595 9.995 0.3 17.28C-0.1 17.68 -0.1 18.3 0.3 18.7C1.24 19 1.5 18.9 1.7 18.7L9.009 11.409 16.3 18.7C16.389 18.796 16.498 18.872 16.618 18.924Z" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-base text-ink">Спасибо, мы с Вами свяжемся!</p>
            <button
              type="button"
              className="w-full rounded-full bg-ink px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-ink/90"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor={`${formId}-name`} className="mb-1.5 block text-sm font-medium text-ink">
                Имя <span className="text-accent">*</span>
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                name="name"
                required
                autoComplete="name"
                placeholder="Ваше имя"
                value={name}
                disabled={submitting}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div>
              <label htmlFor={`${formId}-phone`} className="mb-1.5 block text-sm font-medium text-ink">
                Телефон <span className="text-accent">*</span>
              </label>
              <input
                id={`${formId}-phone`}
                type="tel"
                name="phone"
                required
                autoComplete="tel"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                disabled={submitting}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div>
              <label
                htmlFor={`${formId}-experience`}
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Опыт работы
              </label>
              <select
                id={`${formId}-experience`}
                name="experience"
                value={experience}
                disabled={submitting}
                onChange={(e) =>
                  setExperience(e.target.value as (typeof EXPERIENCE_OPTIONS)[number]["value"])
                }
                className="w-full cursor-pointer appearance-none rounded-xl border border-ink/20 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-ink px-6 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-ink/90 disabled:opacity-60"
            >
              {submitting ? "Отправка…" : "Отправить"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
