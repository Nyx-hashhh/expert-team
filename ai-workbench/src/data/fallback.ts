import type { ContentVersion, Enterprise, GenerateRequest, GenerateResult, Platform, PlatformVersions, TranslationMode } from "@/contracts/content";
import { buildCreativeBrief } from "@/data/translation";
import { factsFor, pickBySeed } from "@/data/fallback/facts";
import type { CaseFacts } from "@/data/fallback/facts";
import { calibrateDouyin, calibrateWeibo, calibrateXhs } from "@/data/fallback/calibrate";
import type { VoiceRenderer } from "@/data/fallback/voice-types";
import { renderBff } from "@/data/fallback/voice-bff";
import { renderPro } from "@/data/fallback/voice-pro";
import { renderYouth } from "@/data/fallback/voice-youth";
import { renderWarm } from "@/data/fallback/voice-warm";

interface CopyPair {
  A: ContentVersion;
  B: ContentVersion;
}

function makeVersion(title: string, body: string, hashtags: string[], storyboard?: ContentVersion["storyboard"]): ContentVersion {
  return { title, body, hashtags, ...(storyboard ? { storyboard } : {}) };
}

const VOICES: Record<string, VoiceRenderer> = {
  闺蜜安利: renderBff,
  专业品鉴: renderPro,
  年轻活力: renderYouth,
  温暖叙事: renderWarm,
};

/** 标题 emoji 配额：闺蜜/年轻 1 个，温暖 1 个（柔和系），专业为 0 */
const TITLE_EMOJI: Record<string, string[]> = {
  闺蜜安利: ["🫶", "✨", "🤍"],
  年轻活力: ["🔥", "✨", "⚡"],
  温暖叙事: ["🌿", "🕊️", "☕"],
  专业品鉴: [],
};

function withTitleEmoji(tone: string, title: string, seed: string): string {
  const pool = TITLE_EMOJI[tone];
  if (!pool || pool.length === 0) return title;
  const emoji = pickBySeed(pool, seed, 7);
  return `${title} ${emoji}`;
}

/**
 * 兜底文案 · 组装层
 *
 * 中文三平台（小红书/微博/抖音）走"事实层 facts → 语调渲染器 voice → 平台结构"流水线：
 * 同一事实底座，语调决定视角、节奏与词汇，模式决定信息顺序，平台决定结构。
 * 海外四平台保持原有英文生成逻辑，事实来源切换到 facts 层。
 */
export function buildFallback(request: GenerateRequest, enterprise: Enterprise): GenerateResult {
  const goal = request.goal.trim() || "把品牌的真实价值分享给更多人";
  const product = request.selectedMaterials.find((item) => item.type === "product")?.content ?? request.selectedMaterials[0]?.content ?? enterprise.tagline;
  const mode: TranslationMode = request.translationMode ?? request.creativeBrief?.mode ?? "story";
  const brief = request.creativeBrief ?? buildCreativeBrief({ contractVersion: 1, enterpriseId: request.enterpriseId, selectedMaterials: request.selectedMaterials, goal, tone: request.tone, mode }, enterprise);
  const facts = factsFor(enterprise, product);

  const tone = request.tone;
  const renderer = VOICES[tone] ?? renderBff;
  const seed = `${enterprise.id}|${mode}|${tone}|${goal}`;
  const drafts = renderer(mode, facts, { audience: brief.audience, goal, seed });

  const applyEmoji = (version: ContentVersion, offset: number): ContentVersion => ({
    ...version,
    title: withTitleEmoji(tone, version.title, seed + offset),
  });

  const chinese: Partial<Record<Platform, PlatformVersions>> = {
    xiaohongshu: {
      A: applyEmoji(calibrateXhs(drafts.xiaohongshu.A, facts, tone), 1),
      B: applyEmoji(calibrateXhs(drafts.xiaohongshu.B, facts, tone), 2),
    },
    weibo: {
      A: calibrateWeibo(drafts.weibo.A, facts),
      B: calibrateWeibo(drafts.weibo.B, facts),
    },
    douyin: {
      A: applyEmoji(calibrateDouyin(drafts.douyin.A), 3),
      B: applyEmoji(calibrateDouyin(drafts.douyin.B), 4),
    },
  };

  const english = englishPlatforms(mode, request.tone, enterprise, facts);

  const platforms = Object.fromEntries(request.platforms.map((platform) => {
    if (platform === "reddit" || platform === "discord" || platform === "instagram" || platform === "tiktok") return [platform, english[platform]];
    return [platform, chinese[platform]];
  })) as Partial<Record<Platform, PlatformVersions>>;
  return { contractVersion: 1, enterpriseId: enterprise.id, source: "fallback", platforms };
}

/* ─────────────────────────────────────────────────────────────
 * 海外平台（英文生成逻辑保持现状，仅事实来源切换到 facts 层）
 * ───────────────────────────────────────────────────────────── */

function englishPlatforms(mode: TranslationMode, tone: string, enterprise: Enterprise, facts: CaseFacts): Pick<Record<Platform, PlatformVersions>, "reddit" | "discord" | "instagram" | "tiktok"> {
  const modeFocus = mode === "story"
    ? `A concrete production choice sits at the center of the story: ${facts.englishProduct}.`
    : mode === "seed"
      ? `The everyday case for it is ${facts.englishBenefit}.`
      : `${enterprise.name} is building its name around ${facts.englishProduct}.`;
  const friendLead = tone === "闺蜜安利" ? "This is the detail I would send to a friend before they bought anything." : tone === "专业品鉴" ? "The claim only becomes useful when its conditions are visible." : tone === "年轻活力" ? "Watch the process closely; the useful bit happens fast." : `The work begins quietly in ${facts.englishPlace}.`;
  return {
    reddit: {
      A: makeVersion(`We run ${enterprise.name} in ${facts.englishPlace}. What would you want us to document?`, `Disclosure: this is the brand team. ${modeFocus}\n\nFor customers, that translates to ${facts.englishBenefit}. We can document the source and process; we will not turn an unverified ranking or a personal impression into a general claim.\n\nIf you were evaluating this category, which part would you scrutinize first?`, ["r/smallbusiness", "Discussion", "Transparent business"]),
      B: makeVersion(`What useful proof can a small ${enterprise.industry} brand publish?`, `${friendLead}\n\n${modeFocus} Place, process, use conditions, and limitations give people something concrete to question. Awards and adjectives do not fill the same role.\n\nWhich format would help more: a process log, a use-case demonstration, or a specification sheet?`, ["r/Entrepreneur", "Question", "Brand building"]),
    },
    discord: {
      A: makeVersion(`📌 Choose the next ${enterprise.name} field note`, `We are filming ${facts.englishProduct}.\n\nReact with 🛠️ for the making process, 🏠 for everyday use, or 🔎 for specifications and evidence. The most-picked angle becomes the next update.`, ["#community", "#poll", "#behind-the-scenes"]),
      B: makeVersion(`👀 A working detail from ${facts.englishPlace}`, `${friendLead}\n\n${modeFocus}\n\nDrop a question in the thread. We will answer with what can be documented and mark anything that still needs checking.`, ["#first-look", "#feedback", "#ask-us"]),
    },
    instagram: {
      A: makeVersion(`Made in ${facts.englishPlace}, meant for a real routine`, `${friendLead}\n\n${modeFocus}\n\nThe carousel follows the work from its source to the moment it becomes ${facts.englishBenefit}.`, ["#BrandStory", "#MadeWithCare", "#BehindTheScenes", "#SmallBusiness"]),
      B: makeVersion(`The hands and decisions behind ${enterprise.name}`, `Frame one shows the finished moment. The next frames trace ${facts.englishProduct}—where it begins, which decisions shape it, and where it fits in daily life.`, ["#VisualStory", "#DiscoverLocal", "#IndependentBrand"]),
    },
    tiktok: {
      A: makeVersion(`One decision changes the whole ${enterprise.name} process`, `${friendLead} ${modeFocus}`, ["#SmallBusinessTok", "#BehindTheScenes", "#KnowWhatYouBuy"], [
        { timeRange: "0–2s", shot: `Open on a tactile detail from ${facts.englishPlace}`, voiceover: "Before the brand name, look at this detail.", bgm: "Natural sound, then a clean beat" },
        { timeRange: "2–9s", shot: "Show the hands, setting, and process without decorative filler", voiceover: modeFocus, bgm: "Cuts follow the real action" },
        { timeRange: "9–16s", shot: "Move into a clear everyday-use context", voiceover: facts.englishBenefit, bgm: "Lower the music under the key fact" },
        { timeRange: "16–20s", shot: "Brand lockup and a specific comment prompt", voiceover: "What would you want us to verify next?", bgm: "Brief pause before the question" },
      ]),
      B: makeVersion(`Watch this result travel back to its source`, `${facts.englishBenefit} The video shows the decision that makes that possible.`, ["#MeetTheMaker", "#BrandProcess", "#ShopSmall"], [
        { timeRange: "0–2s", shot: "Show the finished moment first", voiceover: "The result makes more sense when you see what came before it.", bgm: "Fast opening, immediate pause" },
        { timeRange: "2–10s", shot: "Rewind through place, material, and process", voiceover: `This begins in ${facts.englishPlace}.`, bgm: "Reverse transition into organic rhythm" },
        { timeRange: "10–18s", shot: "Pair one claim with one visible proof", voiceover: modeFocus, bgm: "Steady build" },
        { timeRange: "18–22s", shot: "End on the real-life fit, not a hard sell", voiceover: facts.englishBenefit, bgm: "Warm, clean finish" },
      ]),
    },
  };
}
