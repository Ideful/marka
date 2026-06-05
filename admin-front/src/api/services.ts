import { apiFetch } from "./client";
import type { MainService, SubService, SubServiceInput } from "../types/services";

export function listMainServices() {
  return apiFetch<MainService[]>("/main-services");
}

export function getMainService(slug: string) {
  return apiFetch<MainService>(`/main-services/${slug}`);
}

export function listSubServices(serviceTypeId: number) {
  return apiFetch<SubService[]>(`/sub-services?service_type_id=${serviceTypeId}`);
}

export function createSubService(data: SubServiceInput) {
  return apiFetch<SubService>("/sub-services", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateSubService(id: number, data: SubServiceInput) {
  return apiFetch<SubService>(`/sub-services/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteSubService(id: number) {
  return apiFetch<void>(`/sub-services/${id}`, { method: "DELETE" });
}
