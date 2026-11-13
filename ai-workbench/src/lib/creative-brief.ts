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

export const CREATIVE_BRIEF_LIMIT_INSTRUCTION = `四个字段必须是备忘录式短句：audience 不超过 ${CREATIVE_BRIEF_FIELD_LIMITS.audience} 字，coreMessage 不超过 ${CREATIVE_BRIEF_FIELD_LIMITS.coreMessage} 字，storyAngle 不超过 ${CREATIVE_BRIEF_FIELD_LIMITS.storyAngle} 字，hook 不超过 ${CREATIVE_BRIEF_FIELD_LIMITS.hook} 字，四项合计不超过 ${CREATIVE_BRIEF_TOTAL_LIMIT} 字。汉字、字母、数字、标点和箭头均计入字数。`;
