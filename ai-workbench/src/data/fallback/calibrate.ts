import type { ContentVersion } from "@/contracts/content";
import type { CaseFacts } from "./facts";

/**
 * 字数校准层
 *
 * 按 copy-skeleton.md 的平台规矩把正文收敛到区间内。
 * 补足只使用 facts 里的真实事实（型号、参数、场景、边界），不写套话；
 * 超出则按句/行裁剪，优先删掉重复度最高的互动句。
 */

export const LIMITS = {
  xhs: { min: 300, max: 600 },
  weibo: { min: 100, max: 140 },
  douyin: { min: 80, max: 150 },
} as const;

/** 按真实事实生成补充段：用于小红书字数不足。tone 决定补充句的语气 */
function supplementParagraphs(facts: CaseFacts, used: string, tone: string): string[] {
  const pool: string[] = [];
  const narrative = tone === "温暖叙事" || tone === "专业品鉴";

  if (!used.includes(facts.model) && facts.model) {
    pool.push(narrative
      ? `罐身印着型号 ${facts.model}，一个小标签，不多说别的。`
      : `下单认型号：**${facts.model}**，同类里别拿错了。`);
  }
  const unusedSpecs = facts.specs.filter((spec) => !used.includes(spec.slice(0, 8)));
  if (unusedSpecs.length > 0) {
    pool.push(narrative
      ? `后来还问清楚了几件事：${unusedSpecs.slice(0, 2).join("；")}。`
      : `还有几条核验信息一起放这：${unusedSpecs.slice(0, 2).join("；")}。`);
  }
  const unusedScene = facts.scenes.find((scene) => !used.includes(scene.slice(0, 6)));
  if (unusedScene) {
    pool.push(narrative
      ? `这几天${unusedScene}也带着它，一样顺手。`
      : `这几天${unusedScene}也带着它，一样顺手。`);
  }
  if (!used.includes(facts.notFit.slice(0, 8))) {
    pool.push(narrative
      ? `也有不合适的时候，${facts.notFit}，这没什么好瞒的。`
      : `不合适的情况也说清楚：${facts.notFit}。`);
  }
  if (!used.includes(facts.smellLine.slice(0, 6)) && facts.smellLine) {
    pool.push(`顺带记一笔感官上的：${facts.smellLine}。`);
  }
  return pool;
}

/** 按句号/换行切分为可裁单元，保留标点 */
function splitUnits(text: string): string[] {
  return text.split(/(?<=[。！？!?])/).filter((unit) => unit.trim().length > 0);
}

function joinUnits(units: string[]): string {
  return units.join("").trim();
}

/** 小红书：不足补真实事实，超出按段裁剪（保留首尾段，删中间冗余段） */
export function calibrateXhs(version: ContentVersion, facts: CaseFacts, tone: string): ContentVersion {
  let body = version.body.trim();
  const { min, max } = LIMITS.xhs;

  if (body.length < min) {
    const extra = supplementParagraphs(facts, body, tone);
    for (const paragraph of extra) {
      if (body.length >= min + 40) break;
      body = `${body}\n\n${paragraph}`;
    }
    // 极端情况仍不足：追加场景化收束（基于已有事实）
    if (body.length < min) {
      body = `${body}\n\n${facts.scenes.join("、")}这几个场景都试过，${facts.costPerUse}。${facts.tagline}。`;
    }
  }

  if (body.length > max) {
    const paragraphs = body.split("\n\n");
    while (joinParagraphs(paragraphs).length > max && paragraphs.length > 3) {
      // 从倒数第二段开始删，保留结尾的边界与互动
      paragraphs.splice(paragraphs.length - 2, 1);
    }
    body = joinParagraphs(paragraphs);
    if (body.length > max) {
      const units = splitUnits(body);
      while (joinUnits(units).length > max && units.length > 2) units.splice(units.length - 2, 1);
      body = joinUnits(units);
    }
  }

  return { ...version, body: normalizePunctuation(body) };
}

function joinParagraphs(paragraphs: string[]): string {
  return paragraphs.filter((p) => p.trim().length > 0).join("\n\n").trim();
}

/** 规整标点：清理补句产生的粘连（。， 、。； 等），保留换行结构 */
function normalizePunctuation(text: string): string {
  return text
    .split("\n")
    .map((line) => line
      .replace(/([。！？])[，、；]+/g, "$1")
      .replace(/[，、；]+([。！？])/g, "$1")
      .replace(/。{2,}/g, "。")
      .replace(/，{2,}/g, "，")
      .replace(/[ \t]+/g, " ")
      .replace(/[ \t]+([。！？，])/g, "$1")
      .trim())
    .filter((line, index, arr) => line.length > 0 || (index > 0 && index < arr.length - 1))
    .join("\n")
    .trim();
}

/** 微博：严格 100–140 字；不足补事实，超出按句裁剪（保留首句与收尾问题） */
export function calibrateWeibo(version: ContentVersion, facts: CaseFacts): ContentVersion {
  let body = version.body.trim();
  const { min, max } = LIMITS.weibo;

  // 先裁剪到上限内（保完整句），再补足下限，避免"先截断后补字"产生半句
  if (body.length > max) {
    const units = splitUnits(body);
    // 从后往前找可删单元，绝不删首句，也不把问句删成半截
    while (joinUnits(units).length > max && units.length > 2) {
      units.splice(units.length - 2, 1);
    }
    body = joinUnits(units);
    if (body.length > max) {
      // 剩余仍超限：只接受"完整句"结尾，宁可低于上限也不截出半句
      const cut = body.slice(0, max);
      const lastStop = Math.max(cut.lastIndexOf("。"), cut.lastIndexOf("？"), cut.lastIndexOf("！"));
      if (lastStop >= min) {
        body = cut.slice(0, lastStop + 1);
      }
    }
  }

  if (body.length < min) {
    const additions = [
      `${facts.costPerUse}。`,
      `${facts.fit}可以参考。`,
      `${facts.specs[1] ?? facts.specs[0]}。`,
      `${facts.notFit}。`,
      facts.scenes.length > 1 ? `${facts.scenes[1]}也能用。` : "",
      facts.pollQuestion,
      `${facts.tagline}。`,
    ];
    for (const addition of additions) {
      if (body.length >= min + 6) break;
      if (!addition) continue;
      if (body.includes(addition.slice(0, 8))) continue;
      const needsPeriod = !/[。！？]$/.test(body);
      const candidate = body + (needsPeriod ? "。" : "") + addition;
      if (candidate.length > max) continue;
      body = candidate;
    }
    if (body.length < min) {
      for (const scene of facts.scenes) {
        if (body.length >= min) break;
        const candidate = `${body}${body.endsWith("。") || body.endsWith("？") ? "" : "。"}${scene}也常用。`;
        if (candidate.length <= max) body = candidate;
      }
    }
  }

  return { ...version, body: normalizePunctuation(body) };
}

/** 抖音口播稿：80–150 字；按行裁剪（保留开头钩子与结尾行动） */
export function calibrateDouyin(version: ContentVersion): ContentVersion {
  let body = version.body.trim();
  const { min, max } = LIMITS.douyin;

  if (body.length > max) {
    const lines = body.split("\n").filter((line) => line.trim().length > 0);
    // 从倒数第二行开始删，保留最后一句行动号召
    while (body.length > max && lines.length > 3) {
      lines.splice(lines.length - 2, 1);
      body = lines.join("\n");
    }
    if (body.length > max) {
      const units = splitUnits(body.replace(/\n/g, ""));
      while (joinUnits(units).length > max && units.length > 2) units.splice(units.length - 2, 1);
      body = joinUnits(units);
    }
    // 仍超出：截到最后一个完整句，且不低于下限
    if (body.length > max) {
      const cut = body.slice(0, max);
      const lastStop = Math.max(cut.lastIndexOf("。"), cut.lastIndexOf("？"), cut.lastIndexOf("！"));
      body = lastStop >= min ? cut.slice(0, lastStop + 1) : cut;
    }
  }

  return { ...version, body: normalizePunctuation(body) };
}
