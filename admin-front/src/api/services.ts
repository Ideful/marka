import { apiFetch } from "./client";
import type { MainService, Service, ServiceInput } from "../types/services";

export function listMainServices() {
  return apiFetch<MainService[]>("/main-services");
}

export function getMainService(slug: string) {
  return apiFetch<MainService>(`/main-services/${slug}`);
}

export function listServices(sectionId: number) {
  return apiFetch<Service[]>(`/prices?section_id=${sectionId}`);
}

export function createService(data: ServiceInput) {
  return apiFetch<Service>("/prices", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateService(id: number, data: ServiceInput) {
  return apiFetch<Service>(`/prices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteService(id: number) {
  return apiFetch<void>(`/prices/${id}`, { method: "DELETE" });
}
