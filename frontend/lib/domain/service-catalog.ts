import type { ServiceCategory, ServiceSubcategory } from "@/data/service-tree";
import { SERVICE_TREE } from "@/data/service-tree";

/** Чтение и навигация по дереву услуг (отдельно от React). */
export class ServiceCatalog {
  constructor(private readonly tree: ServiceCategory[] = SERVICE_TREE) {}

  listCategories(): ServiceCategory[] {
    return [...this.tree];
  }

  getCategory(slug: string): ServiceCategory | undefined {
    return this.tree.find((c) => c.slug === slug);
  }

  getSubcategory(
    categorySlug: string,
    subSlug: string,
  ): { category: ServiceCategory; sub: ServiceSubcategory } | undefined {
    const category = this.getCategory(categorySlug);
    if (!category) return undefined;
    const sub = category.subs.find((s) => s.slug === subSlug);
    if (!sub) return undefined;
    return { category, sub };
  }

  /** Для `generateStaticParams` страниц подтипов услуг */
  static subRouteSlugs(): { categorySlug: string; subSlug: string }[] {
    const paths: { categorySlug: string; subSlug: string }[] = [];
    for (const c of SERVICE_TREE) {
      for (const s of c.subs) {
        paths.push({ categorySlug: c.slug, subSlug: s.slug });
      }
    }
    return paths;
  }

}

/** Общий каталог услуг приложения */
export const serviceCatalog = new ServiceCatalog();
