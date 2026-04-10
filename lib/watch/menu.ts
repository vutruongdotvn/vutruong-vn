import type {
  OPhimCategory,
  OPhimCountry,
  OPhimListType,
} from "./types";

/**
 * Normalize + clean data từ API // lấy full từ api dropdown
 */
export function normalizeCategories(categories: OPhimCategory[]) {
  return categories
    .filter((c) => c?.name && c?.slug)
    .map((c) => ({
      name: c.name.trim(),
      slug: c.slug.trim(),
    }));
}

export function normalizeCountries(countries: OPhimCountry[]) {
  return countries
    .filter((c) => c?.name && c?.slug)
    .map((c) => ({
      name: c.name.trim(),
      slug: c.slug.trim(),
    }));
}

export function normalizeListTypes(list: OPhimListType[]) {
  return list
    .filter((c) => c?.name && c?.slug)
    .map((c) => ({
      name: c.name.trim(),
      slug: c.slug.trim(),
    }));
}