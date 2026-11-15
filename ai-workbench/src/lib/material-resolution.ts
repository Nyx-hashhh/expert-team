import { createHash } from "node:crypto";
import type { Material, MaterialResolution } from "@/contracts/content";

export interface MaterialResolutionCandidate {
  currentProductIdentity: string;
  productIdentitySource: "goal" | "materials" | "unknown";
  hasConflict: boolean;
  compatibleMaterialIds: string[];
  excludedMaterials: Array<{ id: string; reason: string }>;
  factsSufficient: boolean;
}

const PERSONALIZED_BRIEF_MARKER = "【个性化思路】";

export function normalizeGoalForMaterialResolution(goal: string): string {
  return goal.split(PERSONALIZED_BRIEF_MARKER)[0].trim().replace(/\s+/gu, " ");
}

export function buildMaterialContextSignature(goal: string, materials: readonly Material[]): string {
  const normalizedMaterials = [...materials]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map(({ id, type, title, content }) => ({ id, type, title: title.trim(), content: content.trim() }));
  return createHash("sha256")
    .update(JSON.stringify({ goal: normalizeGoalForMaterialResolution(goal), materials: normalizedMaterials }))
    .digest("hex");
}

export function finalizeMaterialResolution(
  candidate: MaterialResolutionCandidate,
  goal: string,
  selectedMaterials: readonly Material[],
): MaterialResolution {
  const selectedById = new Map(selectedMaterials.map((material) => [material.id, material]));
  const requestedCompatibleIds = new Set(candidate.compatibleMaterialIds.filter((id) => selectedById.has(id)));
  const hasReportedConflict = candidate.hasConflict || candidate.excludedMaterials.length > 0;
  const compatibleMaterialIds = hasReportedConflict
    ? selectedMaterials.filter((material) => requestedCompatibleIds.has(material.id)).map((material) => material.id)
    : selectedMaterials.map((material) => material.id);
  const compatibleSet = new Set(compatibleMaterialIds);
  const reasonById = new Map(
    candidate.excludedMaterials
      .filter((item) => selectedById.has(item.id))
      .map((item) => [item.id, item.reason.trim()]),
  );
  const excludedMaterials = selectedMaterials
    .filter((material) => !compatibleSet.has(material.id))
    .map((material) => ({
      id: material.id,
      title: material.title,
      reason: reasonById.get(material.id) || "与当前诉求中的产品身份不一致，已停止引用",
    }));
  const compatibleMaterials = selectedMaterials.filter((material) => compatibleSet.has(material.id));
  const warningParts: string[] = [];
  if (excludedMaterials.length > 0) {
    warningParts.push(`已自动排除冲突素材：${excludedMaterials.map((item) => item.title).join("、")}`);
  }
  if (!candidate.factsSufficient) {
    warningParts.push("当前产品事实较少，将只使用已明确的信息并采用保守表述");
  }

  return {
    currentProductIdentity: candidate.currentProductIdentity.trim() || "未明确产品",
    productIdentitySource: candidate.productIdentitySource,
    hasConflict: excludedMaterials.length > 0,
    compatibleMaterialIds,
    excludedMaterials,
    factsSufficient: candidate.factsSufficient,
    warning: warningParts.join("；"),
    contextSignature: buildMaterialContextSignature(goal, compatibleMaterials),
  };
}

export function filterCompatibleMaterials(
  materials: readonly Material[],
  resolution: MaterialResolution,
): Material[] {
  const compatibleIds = new Set(resolution.compatibleMaterialIds);
  return materials.filter((material) => compatibleIds.has(material.id));
}

export function isMaterialResolutionCurrent(
  goal: string,
  compatibleMaterials: readonly Material[],
  resolution: MaterialResolution,
): boolean {
  return buildMaterialContextSignature(goal, compatibleMaterials) === resolution.contextSignature;
}
