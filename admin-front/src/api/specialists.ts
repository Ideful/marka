import { apiFetch } from "./client";
import type { Specialist, SpecialistInput } from "../types/specialist";

export function listSpecialists() {
  return apiFetch<Specialist[]>("/specialists");
}

export function getSpecialist(id: number) {
  return apiFetch<Specialist>(`/specialists/${id}`);
}

export function createSpecialist(data: SpecialistInput) {
  return apiFetch<Specialist>("/specialists", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateSpecialist(id: number, data: SpecialistInput) {
  return apiFetch<Specialist>(`/specialists/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteSpecialist(id: number) {
  return apiFetch<void>(`/specialists/${id}`, { method: "DELETE" });
}
