import { getApiBaseUrl } from "@/lib/api/config";

export type DescriptionSection = {
  title: string;
  description: string;
};

export type Specialist = {
  id: number;
  name: string;
  description: DescriptionSection[];
  photo_url: string;
};

function normalizeDescription(raw: unknown): DescriptionSection[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        const row = item as DescriptionSection;
        return {
          title: String(row?.title ?? "").trim(),
          description: String(row?.description ?? "").trim(),
        };
      })
      .filter((s) => s.title || s.description);
  }
  if (raw && typeof raw === "object") {
    return Object.entries(raw as Record<string, string>).map(([title, description]) => ({
      title,
      description: String(description ?? ""),
    }));
  }
  return [];
}

function normalizeSpecialist(raw: Specialist): Specialist {
  return {
    ...raw,
    description: normalizeDescription(
      (raw as Specialist & { description?: unknown }).description,
    ),
  };
}

export async function fetchSpecialists(): Promise<Specialist[]> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/specialists`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API /specialists: ${res.status}`);
  }

  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("API /specialists: expected array");
  }
  return (data as Specialist[]).map(normalizeSpecialist);
}

export async function fetchSpecialist(id: number): Promise<Specialist | null> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/specialists/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`API /specialists/${id}: ${res.status}`);
  }
  return normalizeSpecialist((await res.json()) as Specialist);
}
