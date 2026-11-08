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
  source: "ai";
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
  source: "ai";
  platforms: Partial<Record<Platform, PlatformVersions>>;
}

export interface ScheduleItem {
  id: string;
  enterpriseId: string;
  platform: Platform;
  version: Version;
  content: ContentVersion;
  scheduledAt: string;
  timeZone?: string;
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
  story: { name: "故事型", description: "用文学化五幕与真实案例呈现卖点" },
  seed: { name: "种草型", description: "像朋友一样分享真实体验与适用边界" },
  brand: { name: "品牌型", description: "以专业和可信证据建立品牌心智" },
};
