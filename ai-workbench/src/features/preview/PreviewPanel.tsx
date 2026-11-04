"use client";

import { Bookmark, Copy, Download, Heart, MessageCircle, Send, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { PLATFORM_LABELS, type ContentVersion, type Enterprise, type GenerateResult, type Platform, type Version } from "@/contracts/content";

interface PreviewPanelProps {
  enterprise: Enterprise;
  result: GenerateResult | null;
  activePlatform: Platform;
  activeVersion: Version;
  onPlatformChange: (platform: Platform) => void;
  onVersionChange: (version: Version) => void;
  onSchedule: () => void;
}

export function PreviewPanel({ enterprise, result, activePlatform, activeVersion, onPlatformChange, onVersionChange, onSchedule }: PreviewPanelProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState("");
  const available = Object.keys(result?.platforms ?? {}) as Platform[];
  const content = result?.platforms[activePlatform]?.[activeVersion];

  async function copyContent() {
    if (!content) return;
    const body = [content.title, content.body, ...content.hashtags, ...(content.storyboard?.map((item) => `${item.timeRange}｜${item.shot}｜${item.voiceover}｜${item.bgm}`) ?? [])].join("\n");
    await navigator.clipboard.writeText(body);
    setNotice("已复制到剪贴板");
  }

  async function exportImage() {
    if (!captureRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(captureRef.current, { backgroundColor: "#f8f7f4", scale: 2, useCORS: true });
    const link = document.createElement("a");
    link.download = `${enterprise.name}-${PLATFORM_LABELS[activePlatform]}-${activeVersion}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setNotice("预览长图已导出");
  }

  return (
    <section className="preview-column">
      <div className="preview-header">
        <div><span className="eyebrow">LIVE PREVIEW</span><h2>多端拟真预览</h2></div>
        <span className="live-pill"><span /> 实时同步</span>
      </div>
      <div className="preview-tabs">
        {(["xiaohongshu", "weibo", "douyin"] as Platform[]).map((platform) => (
          <button key={platform} className={activePlatform === platform ? "active" : ""} onClick={() => onPlatformChange(platform)} disabled={Boolean(result) && !available.includes(platform)}>{PLATFORM_LABELS[platform]}</button>
        ))}
      </div>
      <div className="version-row"><span>创意版本</span><div className="version-tabs">{(["A", "B"] as Version[]).map((version) => <button key={version} onClick={() => onVersionChange(version)} className={activeVersion === version ? "active" : ""}>版本 {version}</button>)}</div></div>
      <div className="preview-scroll" ref={captureRef}>
        {!content ? <div className="empty-preview"><div className="empty-icon">✦</div><h3>好内容，即将发生</h3><p>选择素材并输入宣发诉求，点击生成后即可在这里预览各平台 A/B 文案。</p></div> : activePlatform === "xiaohongshu" ? <XiaohongshuPreview content={content} enterprise={enterprise} /> : activePlatform === "weibo" ? <WeiboPreview content={content} enterprise={enterprise} /> : <DouyinPreview content={content} />}
      </div>
      <div className="preview-actions">
        <button onClick={copyContent} disabled={!content}><Copy size={16} /> 复制全文</button>
        <button onClick={exportImage} disabled={!content}><Download size={16} /> 导出长图</button>
        <button className="schedule-action" onClick={onSchedule} disabled={!content}><Send size={16} /> 推送日历</button>
      </div>
      {notice && <p className="action-notice" role="status">{notice}</p>}
    </section>
  );
}

function XiaohongshuPreview({ content, enterprise }: { content: ContentVersion; enterprise: Enterprise }) {
  return <div className="phone-frame"><div className="phone-island" /><div className="phone-screen"><div className="phone-top"><span>9:41</span><span>●●● ▰</span></div><div className="post-top"><span>‹</span><span>{enterprise.name}</span><span>···</span></div><div className="post-hero" style={{ background: `linear-gradient(145deg, ${enterprise.accent}, #f3e7cc)` }}><span>01 / 03</span><div className="hero-mark">{enterprise.industry}</div><strong>{enterprise.tagline}</strong></div><div className="post-body"><h3>{content.title}</h3><p>{content.body}</p><div className="hashtags">{content.hashtags.join("  ")}</div><div className="post-author"><span className="avatar">{enterprise.name.slice(0, 1)}</span><span>{enterprise.name}<small>刚刚发布 · 来自 {enterprise.location}</small></span></div></div><div className="social-bar"><span>说点什么...</span><Heart size={19} /><Bookmark size={19} /><MessageCircle size={19} /></div></div></div>;
}

function WeiboPreview({ content, enterprise }: { content: ContentVersion; enterprise: Enterprise }) {
  return <div className="weibo-card"><div className="weibo-profile"><span className="avatar">{enterprise.name.slice(0, 1)}</span><div><strong>{enterprise.name} <span className="verified">V</span></strong><small>刚刚 · 来自微博网页版</small></div><span>···</span></div><p>{content.body}</p><div className="weibo-tags">{content.hashtags.join("  ")}</div><div className="weibo-grid">{["品牌故事", enterprise.industry, "好物分享", "匠心细节"].map((label, index) => <div key={label} style={{ backgroundColor: `${enterprise.accent}${index % 2 ? "55" : "88"}` }}>{label}</div>)}</div><div className="weibo-footer"><span><Share2 size={16} /> 转发</span><span><MessageCircle size={16} /> 评论</span><span><Heart size={16} /> 赞</span></div></div>;
}

function DouyinPreview({ content }: { content: ContentVersion }) {
  return <div className="script-card"><div className="script-cover"><span>SHORT VIDEO / SCRIPT</span><h3>{content.title}</h3><p>15 秒竖屏短视频 · 黄金前 3 秒钩子</p></div><div className="script-section"><h4>核心口播</h4><p>{content.body}</p></div><div className="script-section"><h4>分镜脚本</h4><div className="shot-list">{content.storyboard?.map((shot) => <div className="shot" key={shot.timeRange}><span>{shot.timeRange}</span><div><strong>{shot.shot}</strong><p>🎙 {shot.voiceover}</p><small>♫ {shot.bgm}</small></div></div>)}</div></div><div className="hashtags">{content.hashtags.join("  ")}</div></div>;
}
