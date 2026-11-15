import type { Material } from "@/contracts/content";

export type MaterialOverrides = Record<string, Record<string, Material>>;

export const MATERIAL_OVERRIDES_STORAGE_KEY = "material-overrides";

export function mergeMaterials(
  baseMaterials: readonly Material[],
  customMaterials: readonly Material[],
  overrides: Record<string, Material> = {},
): Material[] {
  return [...baseMaterials, ...customMaterials].map((material) => overrides[material.id] ?? material);
}
