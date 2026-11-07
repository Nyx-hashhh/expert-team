import type { ContentVersion, TranslationMode } from "@/contracts/content";
import type { CaseFacts } from "./facts";

export interface VoiceContext {
  /** 从诉求提炼的受众描述 */
  audience: string;
  /** 用户原始诉求 */
  goal: string;
  /** 稳定种子：同一请求选同一变体 */
  seed: string;
}

export interface VersionPair {
  A: ContentVersion;
  B: ContentVersion;
}

export interface PlatformDrafts {
  xiaohongshu: VersionPair;
  weibo: VersionPair;
  douyin: VersionPair;
}

export type VoiceRenderer = (mode: TranslationMode, facts: CaseFacts, ctx: VoiceContext) => PlatformDrafts;

export function makeStoryboard(shots: ReadonlyArray<{ timeRange: string; shot: string; voiceover: string; bgm: string }>): ContentVersion["storyboard"] {
  return shots.map((shot) => ({ ...shot }));
}
