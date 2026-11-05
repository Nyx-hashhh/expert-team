export const CONTRACT_VERSION = 1 as const;

export type Platform = "xiaohongshu" | "weibo" | "douyin" | "reddit" | "discord" | "instagram" | "tiktok";
export type Version = "A" | "B";
export type MaterialType = "product" | "story" | "reference";
export type TranslationMode = "story" | "seed" | "brand";
export type ScheduleStatus = "draft" | "review" | "scheduled" | "published_mock";

export interface Material {
  id: string;
  type: MaterialType;
  title: string;
  content: string;
}

export interface Enterprise {
  id: string;
  name: string;
  industry: string;
  location: string;
  tagline: string;
  accent: string;
  materials: Material[];
}

export interface StoryboardShot {
  timeRange: string;
  shot: string;
  voiceover: string;
  bgm: string;
}

export interface ContentVersion {
  title: string;
  body: string;
  hashtags: string[];
  storyboard?: StoryboardShot[];
}

export type PlatformVersions = Record<Version, ContentVersion>;

export interface CreativeBrief {
  mode: TranslationMode;
  audience: string;
  coreMessage: string;
  storyAngle: string;
  hook: string;
  storyArc: string[];
  humanTouch: string[];
  avoid: string[];
}

export interface TranslateRequest {
  contractVersion: typeof CONTRACT_VERSION;
  enterpriseId: string;
  selectedMaterials: Material[];
  goal: string;
  tone: string;
  mode: TranslationMode;
}

export interface TranslateResult {
  contractVersion: typeof CONTRACT_VERSION;
  source: "ai" | "local";
  brief: CreativeBrief;
}

export interface GenerateRequest {
  contractVersion: typeof CONTRACT_VERSION;
  enterpriseId: string;
  selectedMaterialIds: string[];
  selectedMaterials: Material[];
  goal: string;
  platforms: Platform[];
  tone: string;
  translationMode?: TranslationMode;
  creativeBrief?: CreativeBrief;
}

export interface GenerateResult {
  contractVersion: typeof CONTRACT_VERSION;
  enterpriseId: string;
  source: "ai" | "fallback";
  platforms: Partial<Record<Platform, PlatformVersions>>;
}

export interface ScheduleItem {
  id: string;
  enterpriseId: string;
  platform: Platform;
  version: Version;
  content: ContentVersion;
  scheduledAt: string;
  status: ScheduleStatus;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  xiaohongshu: "小红书",
  weibo: "微博",
  douyin: "抖音脚本",
  reddit: "Reddit",
  discord: "Discord",
  instagram: "Instagram",
  tiktok: "TikTok",
};

export const PLATFORMS: Platform[] = ["xiaohongshu", "weibo", "douyin", "reddit", "discord", "instagram", "tiktok"];

export const TRANSLATION_MODE_LABELS: Record<TranslationMode, { name: string; description: string }> = {
  story: { name: "故事型", description: "用场景、人物与转折建立记忆点" },
  seed: { name: "种草型", description: "从真实痛点和使用体验自然带出卖点" },
  brand: { name: "品牌型", description: "突出初心、在地感与品牌长期价值" },
};
