import { z } from "zod";

export const CREATIVE_BRIEF_FIELD_LIMITS = {
  audience: 10,
  coreMessage: 20,
  storyAngle: 25,
  hook: 25,
} as const;

export const CREATIVE_BRIEF_TOTAL_LIMIT = 80;

export function countBriefCharacters(value: string): number {
  return Array.from(value).length;
}

function compactBriefText(value: string, max: number): string {
  const normalized = value
    .trim()
    .replace(/^(核心宣发受众|目标受众|受众|核心表达|内容切口|开场钩子)\s*[：:]\s*/u, "")
    .replace(/\s+/gu, " ");
  if (countBriefCharacters(normalized) <= max) return normalized;

  const prefix = Array.from(normalized).slice(0, max).join("");
  const minimumUsefulLength = Math.floor(max * 0.55);
  const boundary = Math.max(
    prefix.lastIndexOf("，"),
    prefix.lastIndexOf("。"),
    prefix.lastIndexOf("；"),
    prefix.lastIndexOf("！"),
    prefix.lastIndexOf("？"),
  );
  if (boundary >= minimumUsefulLength) return prefix.slice(0, boundary).replace(/[，、：；。！？\s>→-]+$/u, "");
  return prefix.replace(/[，、：；。！？\s>→-]+$/u, "") || prefix;
}

function compactStoryAngle(value: string, max: number): string {
  const normalized = value
    .trim()
    .replace(/^内容切口\s*[：:]\s*/u, "")
    .replace(/想找一杯/gu, "想喝")
    .replace(/感受到/gu, "感受")
    .replace(/\s+/gu, " ");
  if (countBriefCharacters(normalized) <= max) return normalized;

  const parts = normalized.split(/\s*(?:->|→|➡)\s*/u).filter(Boolean).slice(0, 3);
  if (parts.length < 2) return compactBriefText(normalized, max);
  const joined = parts.join("→");
  if (countBriefCharacters(joined) <= max) return joined;
  const separatorLength = parts.length - 1;
  const available = max - separatorLength;
  const base = Math.floor(available / parts.length);
  const remainder = available % parts.length;
  return parts
    .map((part, index) => compactBriefText(part, base + (index >= parts.length - remainder ? 1 : 0)))
    .join("→");
}

function limitedBriefText(label: string, max: number) {
  return z.string().trim().min(1).refine(
    (value) => countBriefCharacters(value) <= max,
    { message: `${label}不得超过${max}字` },
  );
}

export const creativeBriefSchema = z.object({
  mode: z.enum(["story", "seed", "brand"]),
  audience: limitedBriefText("核心宣发受众", CREATIVE_BRIEF_FIELD_LIMITS.audience),
  coreMessage: limitedBriefText("核心表达", CREATIVE_BRIEF_FIELD_LIMITS.coreMessage),
  storyAngle: limitedBriefText("内容切口", CREATIVE_BRIEF_FIELD_LIMITS.storyAngle),
  hook: limitedBriefText("开场钩子", CREATIVE_BRIEF_FIELD_LIMITS.hook),
}).superRefine((brief, context) => {
  const total = countBriefCharacters(brief.audience)
    + countBriefCharacters(brief.coreMessage)
    + countBriefCharacters(brief.storyAngle)
    + countBriefCharacters(brief.hook);
  if (total > CREATIVE_BRIEF_TOTAL_LIMIT) {
    context.addIssue({
      code: "custom",
      message: `四项字段合计不得超过${CREATIVE_BRIEF_TOTAL_LIMIT}字`,
    });
  }
});

export type CreativeBriefCandidate = {
  mode: "story" | "seed" | "brand";
  audience: string;
  coreMessage: string;
  storyAngle: string;
  hook: string;
};

export function fitCreativeBriefToLimits(brief: CreativeBriefCandidate) {
  return creativeBriefSchema.parse({
    ...brief,
    audience: compactBriefText(
      brief.audience.replace(/^(?:核心宣发受众|目标受众|受众)\s*[：:]\s*/u, "").replace(/^(?:希望|想要|需要)/u, ""),
      CREATIVE_BRIEF_FIELD_LIMITS.audience,
    ),
    coreMessage: compactBriefText(
      brief.coreMessage.replace(/^核心表达\s*[：:]\s*/u, "").replace(/^(?:通过|借助|围绕)/u, ""),
      CREATIVE_BRIEF_FIELD_LIMITS.coreMessage,
    ),
    storyAngle: compactStoryAngle(brief.storyAngle, CREATIVE_BRIEF_FIELD_LIMITS.storyAngle),
    hook: compactBriefText(brief.hook, CREATIVE_BRIEF_FIELD_LIMITS.hook),
  });
}

export const CREATIVE_BRIEF_LIMIT_INSTRUCTION = `四个字段必须是备忘录式短句：audience 不超过 ${CREATIVE_BRIEF_FIELD_LIMITS.audience} 字，coreMessage 不超过 ${CREATIVE_BRIEF_FIELD_LIMITS.coreMessage} 字，storyAngle 不超过 ${CREATIVE_BRIEF_FIELD_LIMITS.storyAngle} 字，hook 不超过 ${CREATIVE_BRIEF_FIELD_LIMITS.hook} 字，四项合计不超过 ${CREATIVE_BRIEF_TOTAL_LIMIT} 字。汉字、字母、数字、标点和箭头均计入字数。`;
