"use client";

import { Bookmark, ChevronLeft, ChevronRight, Copy, Download, Heart, ImageIcon, MessageCircle, MessageCircleMore, Music2, Pause, Play, Send, Share2, Star, UserRound, UserPlus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PLATFORM_LABELS, PLATFORMS, type ContentVersion, type Enterprise, type GenerateResult, type Platform, type Version } from "@/contracts/content";
import styles from "./preview.module.css";

interface PreviewPanelProps {
  enterprise: Enterprise;
  result: GenerateResult | null;
  activePlatform: Platform;
  activeVersion: Version;
  onPlatformChange: (platform: Platform) => void;
  onVersionChange: (version: Version) => void;
  onSchedule: () => void;
}

function hashCode(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function formatCount(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

export function PreviewPanel({ enterprise, result, activePlatform, activeVersion, onPlatformChange, onVersionChange, onSchedule }: PreviewPanelProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState("");
  const [visibleCount, setVisibleCount] = useState(0);
  const [slide, setSlide] = useState(0);
  const [liked, setLiked] = useState(false);
  const [collected, setCollected] = useState(false);
  const [extraLikes, setExtraLikes] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const [activeShot, setActiveShot] = useState(0);
  const [playing, setPlaying] = useState(true);
  const available = Object.keys(result?.platforms ?? {}) as Platform[];
  const content = result?.platforms[activePlatform]?.[activeVersion];
  const shots = content?.storyboard ?? [];

  useEffect(() => {
    if (!content || result?.source !== "fallback") return;
    const reset = setTimeout(() => setVisibleCount(0), 0);
    const timer = setInterval(() => setVisibleCount((value) => Math.min(value + 6, content.body.length)), 16);
    return () => { clearTimeout(reset); clearInterval(timer); };
  }, [content, result?.source]);
  const shownContent = content && result?.source === "fallback" ? { ...content, body: content.body.slice(0, visibleCount), hashtags: visibleCount >= content.body.length ? content.hashtags : [] } : content;

  const metrics = useMemo(() => {
    const seed = hashCode(`${enterprise.id}|${activePlatform}|${activeVersion}`);
    return {
      likes: 860 + (seed % 4200),
      collects: 130 + ((seed >>> 5) % 940),
      comments: 16 + ((seed >>> 9) % 190),
      reposts: 6 + ((seed >>> 13) % 280),
      shares: 3 + ((seed >>> 17) % 120),
    };
  }, [enterprise.id, activePlatform, activeVersion]);

  useEffect(() => { setSlide(0); setLiked(false); setCollected(false); setExtraLikes(0); setBurstKey(0); setActiveShot(0); setPlaying(true); }, [content]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 2200); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    if (shots.length <= 1 || !playing) return;
    const timer = setInterval(() => setActiveShot((index) => (index + 1) % shots.length), 2400);
    return () => clearInterval(timer);
  }, [shots.length, playing]);

  function toggleLike() {
    setLiked(true);
    setExtraLikes((value) => value + 1);
    setBurstKey((key) => key + 1);
  }

  const interaction = {
    slide,
    onSlideChange: setSlide,
    liked,
    collected,
    likeCount: metrics.likes + extraLikes,
    collectCount: metrics.collects,
    commentCount: metrics.comments,
    repostCount: metrics.reposts,
    shareCount: metrics.shares,
    burstKey,
    activeShot,
    playing,
    onLike: toggleLike,
    onCollect: () => setCollected((value) => !value),
    onShotChange: setActiveShot,
    onTogglePlay: () => setPlaying((value) => !value),
  };

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
        {PLATFORMS.map((platform) => (
          <button key={platform} className={activePlatform === platform ? "active" : ""} onClick={() => onPlatformChange(platform)} disabled={Boolean(result) && !available.includes(platform)}>{PLATFORM_LABELS[platform]}</button>
        ))}
      </div>
      <div className="version-row"><span>创意版本</span><div className="version-tabs">{(["A", "B"] as Version[]).map((version) => <button key={version} onClick={() => onVersionChange(version)} className={activeVersion === version ? "active" : ""}>版本 {version}</button>)}</div></div>
      <div className="preview-scroll" ref={captureRef}>
        {!shownContent ? <div className="empty-preview"><div className="empty-icon">✦</div><h3>好内容，即将发生</h3><p>选择素材并输入宣发诉求，点击生成后即可在这里预览各平台 A/B 文案。</p></div> : <PlatformPreview platform={activePlatform} content={shownContent} enterprise={enterprise} interaction={interaction} />}
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

type PreviewInteraction = {
  slide: number;
  onSlideChange: (slide: number) => void;
  liked: boolean;
  collected: boolean;
  likeCount: number;
  collectCount: number;
  commentCount: number;
  repostCount: number;
  shareCount: number;
  burstKey: number;
  activeShot: number;
  playing: boolean;
  onLike: () => void;
  onCollect: () => void;
  onShotChange: (index: number) => void;
  onTogglePlay: () => void;
};

function PlatformPreview({ platform, content, enterprise, interaction }: { platform: Platform; content: ContentVersion; enterprise: Enterprise; interaction: PreviewInteraction }) {
  switch (platform) {
    case "xiaohongshu": return <XiaohongshuPreview content={content} enterprise={enterprise} slide={interaction.slide} onSlideChange={interaction.onSlideChange} liked={interaction.liked} collected={interaction.collected} burstKey={interaction.burstKey} onLike={interaction.onLike} onCollect={interaction.onCollect} />;
    case "weibo": return <WeiboPreview content={content} enterprise={enterprise} repostCount={interaction.repostCount} commentCount={interaction.commentCount} likeCount={interaction.likeCount} />;
    case "douyin": return <DouyinPreview content={content} enterprise={enterprise} activeShot={interaction.activeShot} playing={interaction.playing} liked={interaction.liked} likeCount={interaction.likeCount} commentCount={interaction.commentCount} shareCount={interaction.shareCount} onShotChange={interaction.onShotChange} onTogglePlay={interaction.onTogglePlay} onLike={interaction.onLike} />;
    case "reddit": return <RedditPreview content={content} enterprise={enterprise} />;
    case "discord": return <DiscordPreview content={content} enterprise={enterprise} />;
    case "instagram": return <InstagramPreview content={content} enterprise={enterprise} />;
    case "tiktok": return <TikTokPreview content={content} enterprise={enterprise} />;
  }
}

function XiaohongshuPreview({ content, enterprise, slide, onSlideChange, liked, collected, burstKey, onLike, onCollect }: {
  content: ContentVersion;
  enterprise: Enterprise;
  slide: number;
  onSlideChange: (slide: number) => void;
  liked: boolean;
  collected: boolean;
  burstKey: number;
  onLike: () => void;
  onCollect: () => void;
}) {
  // 当前 Turbopack 规则将此文件作为普通 CSS 加载；小红书预览显式回退到全局类名。
  const xhsCss = new Proxy(styles, { get: (target, key) => Reflect.get(target, key) || String(key) });
  const imageSlots = [1, 2, 3];
  return (
    <div className={xhsCss.xhsPhone}>
      <div className={xhsCss.xhsScreen}>
        <div className={xhsCss.xhsStatus}><span>9:41</span><span aria-hidden="true">●●● ▰</span></div>
        <div className={xhsCss.xhsHeader}>
          <ChevronLeft size={20} aria-hidden="true" />
          <span className={xhsCss.xhsAvatar} aria-hidden="true"><UserRound size={17} /></span>
          <strong>{enterprise.name}</strong>
          <span className={xhsCss.xhsFollow}>关注</span>
          <Share2 size={19} aria-label="分享图标" />
        </div>
        <div className={xhsCss.xhsContent}>
        <div className={xhsCss.carousel} onDoubleClick={onLike} title="双击图片区域试试点赞">
          <div className={xhsCss.carouselTrack} style={{ transform: `translateX(-${slide * 100}%)` }}>
            {imageSlots.map((slot) => (
              <div key={slot} className={`${xhsCss.carouselSlide} ${xhsCss.imagePlaceholder}`} aria-label={`图片位置 ${slot}`}>
                <ImageIcon size={30} strokeWidth={1.4} aria-hidden="true" />
                <span>图片位置 {slot}</span>
              </div>
            ))}
          </div>
          {burstKey > 0 && <Heart key={burstKey} size={64} className={xhsCss.burst} color="#ff2442" fill="#ff2442" />}
          <button type="button" className={`${xhsCss.carouselArrow} ${xhsCss.l}`} aria-label="上一张" onClick={(event) => { event.stopPropagation(); onSlideChange((slide - 1 + imageSlots.length) % imageSlots.length); }} onDoubleClick={(event) => event.stopPropagation()}><ChevronLeft size={13} /></button>
          <button type="button" className={`${xhsCss.carouselArrow} ${xhsCss.r}`} aria-label="下一张" onClick={(event) => { event.stopPropagation(); onSlideChange((slide + 1) % imageSlots.length); }} onDoubleClick={(event) => event.stopPropagation()}><ChevronRight size={13} /></button>
        </div>
        <div className={xhsCss.carouselDots}>
          {imageSlots.map((slot, index) => (
            <button type="button" key={slot} aria-label={`第 ${slot} 张`} aria-current={index === slide ? "true" : undefined} className={index === slide ? xhsCss.on : undefined} onClick={() => onSlideChange(index)} />
          ))}
        </div>
        <div className={xhsCss.xhsBody}>
          <h3>{content.title || "标题将在这里显示"}</h3>
          <p>{content.body || "正文将在这里显示"}</p>
          {content.hashtags.length > 0 && <div className={xhsCss.xhsHashtags}>{content.hashtags.join("  ")}</div>}
          <div className={xhsCss.xhsMeta}>刚刚{enterprise.location ? ` · 来自 ${enterprise.location}` : ""} · 预览</div>
          <section className={xhsCss.commentBlock} aria-label="评论区预留位置">
            <div className={xhsCss.commentHeading}>评论</div>
            <div className={xhsCss.commentEmpty}>
              <span className={xhsCss.commentAvatar} aria-hidden="true"><UserRound size={16} /></span>
              <span>发布后，评论将在这里显示</span>
            </div>
          </section>
        </div>
        </div>
        <div className={xhsCss.xhsDock}>
          <span className={xhsCss.xhsInput}>✎&nbsp; 说点什么</span>
          <button type="button" className={liked ? xhsCss.xhsSelected : undefined} onClick={onLike} aria-label="点赞" aria-pressed={liked}><Heart size={18} fill={liked ? "currentColor" : "none"} />{Number(liked)}</button>
          <button type="button" className={collected ? xhsCss.xhsCollected : undefined} onClick={onCollect} aria-label={collected ? "取消收藏" : "收藏"} aria-pressed={collected}><Star size={20} strokeWidth={1.9} fill={collected ? "currentColor" : "none"} />{Number(collected)}</button>
          <span className={xhsCss.xhsDockCount}><MessageCircleMore size={20} strokeWidth={1.9} aria-hidden="true" />0</span>
        </div>
      </div>
    </div>
  );
}

function WeiboPreview({ content, enterprise, repostCount, commentCount, likeCount }: {
  content: ContentVersion;
  enterprise: Enterprise;
  repostCount: number;
  commentCount: number;
  likeCount: number;
}) {
  return (
    <div className="weibo-card">
      <div className="weibo-profile"><span className="avatar">{enterprise.name.slice(0, 1)}</span><div><strong>{enterprise.name} <span className="verified">V</span></strong><small>刚刚 · 来自微博网页版</small></div><span>···</span></div>
      <p>{content.body}</p>
      <div className="weibo-tags">{content.hashtags.join("  ")}</div>
      <div className="weibo-grid">{["品牌故事", enterprise.industry, "好物分享", "匠心细节"].map((label, index) => <div key={label} style={{ backgroundColor: `${enterprise.accent}${index % 2 ? "55" : "88"}` }}>{label}</div>)}</div>
      <div className={styles.hotComment}><b>@薄荷绿茶</b>：支持本土小品牌，这条文案是真的走心，已经转发给闺蜜了 <span>· {formatCount(Math.max(12, Math.round(likeCount / 6)))} 人赞</span></div>
      <div className="weibo-footer">
        <span><Share2 size={16} /> 转发 {formatCount(repostCount)}</span>
        <span><MessageCircle size={16} /> 评论 {formatCount(commentCount)}</span>
        <span><Heart size={16} /> 赞 {formatCount(likeCount)}</span>
      </div>
    </div>
  );
}

function DouyinPreview({ content, enterprise, activeShot, playing, liked, likeCount, commentCount, shareCount, onShotChange, onTogglePlay, onLike }: {
  content: ContentVersion;
  enterprise: Enterprise;
  activeShot: number;
  playing: boolean;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  onShotChange: (index: number) => void;
  onTogglePlay: () => void;
  onLike: () => void;
}) {
  const shots = content.storyboard ?? [];
  return (
    <div className="script-card">
      <div className={styles.dyPlayer}>
        <div className={styles.dyProgress}>{shots.map((shot, index) => <i key={shot.timeRange} className={index <= activeShot ? styles.on : undefined} />)}</div>
        <div className={styles.dyCenter}>
          <button type="button" className={styles.dyPlay} onClick={onTogglePlay} aria-label={playing ? "暂停分镜演示" : "播放分镜演示"}>{playing ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 3 }} />}</button>
          <div className={styles.dyTitle}>{content.title}</div>
          <div className={styles.dySub}>15 秒竖屏短视频 · 黄金前 3 秒钩子</div>
        </div>
        <div className={styles.dyCaption}><b>@{enterprise.name}</b><small>{content.hashtags.join("  ")}</small></div>
        <div className={styles.dyRail}>
          <span className={styles.commentAvatar} style={{ background: enterprise.accent, width: 34, height: 34, fontSize: 13 }}>{enterprise.name.slice(0, 1)}</span>
          <span className={styles.dyFollow}><UserPlus size={9} /></span>
          <button type="button" className={styles.dyRailItem} onClick={onLike} aria-label="点赞"><Heart size={25} color={liked ? "#ff2c55" : "#fff"} fill={liked ? "#ff2c55" : "none"} />{formatCount(likeCount)}</button>
          <span className={styles.dyRailItem}><MessageCircle size={25} />{formatCount(commentCount)}</span>
          <span className={styles.dyRailItem}><Share2 size={25} />{formatCount(shareCount)}</span>
          <span className={styles.dyDisc}><Music2 size={13} color="#cfe0d6" /></span>
        </div>
      </div>
      <div className="script-section"><h4>核心口播</h4><p>{content.body}</p></div>
      <div className="script-section">
        <h4>分镜脚本<span className={styles.demoTag}>{playing ? "自动演示中" : "已暂停"}</span></h4>
        <div className={styles.shotListV2}>
          {shots.map((shot, index) => (
            <button type="button" key={shot.timeRange} className={`${styles.shotItem} ${index === activeShot ? styles.shotOn : ""}`} style={index === activeShot ? { borderColor: enterprise.accent } : undefined} onClick={() => onShotChange(index)}>
              <span className={styles.shotTime}>{shot.timeRange}</span>
              <span className={styles.shotMain}>
                <strong>{shot.shot}</strong>
                <span className={styles.shotText}>🎙 {shot.voiceover}</span>
                <small className={styles.shotBgm}>♫ {shot.bgm}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="hashtags">{content.hashtags.join("  ")}</div>
    </div>
  );
}

function RedditPreview({ content, enterprise }: { content: ContentVersion; enterprise: Enterprise }) {
  return <div className="reddit-shell"><div className="reddit-bar"><strong>reddit</strong><span>r/smallbusiness</span><button>Join</button></div><div className="reddit-post"><aside><button>▲</button><strong>128</strong><button>▼</button></aside><article><div className="reddit-meta"><span className="reddit-community">r/smallbusiness</span> · Posted by u/{enterprise.name.replaceAll(" ", "_")} · just now</div><h3>{content.title}</h3><p>{content.body}</p><div className="reddit-flairs">{content.hashtags.map((tag) => <span key={tag}>{tag}</span>)}</div><footer><span><MessageCircle size={14} /> 24 Comments</span><span><Share2 size={14} /> Share</span><span>•••</span></footer></article></div></div>;
}

function DiscordPreview({ content, enterprise }: { content: ContentVersion; enterprise: Enterprise }) {
  return <div className="discord-shell"><aside><span className="discord-home">D</span><span>{enterprise.name.slice(0, 1)}</span><span>+</span></aside><div className="discord-main"><header><strong># announcements</strong><small>Official news, launches and community updates</small></header><div className="discord-thread"><div className="discord-date"><span>November 4, 2026</span></div><div className="discord-message"><span className="discord-avatar">{enterprise.name.slice(0, 1)}</span><div><div className="discord-author"><strong>{enterprise.name}</strong><span>APP</span><small>Today at 9:41 AM</small></div><h3>{content.title}</h3><p>{content.body}</p><div className="discord-tags">{content.hashtags.join("  ")}</div><div className="discord-reactions"><span>🌿 18</span><span>✨ 12</span><span>＋</span></div></div></div></div><div className="discord-input">Message #announcements <span>☺</span></div></div></div>;
}

function InstagramPreview({ content, enterprise }: { content: ContentVersion; enterprise: Enterprise }) {
  return <div className="instagram-phone"><div className="instagram-head"><strong>Instagram</strong><span>♡　⌁</span></div><div className="instagram-profile"><span className="ig-avatar" style={{ background: `linear-gradient(135deg, ${enterprise.accent}, #edc77a)` }}><i>{enterprise.name.slice(0, 1)}</i></span><div><strong>{enterprise.name.replaceAll(" ", "").toLowerCase()}</strong><small>{enterprise.location}</small></div><span>•••</span></div><div className="instagram-hero" style={{ background: `linear-gradient(145deg, ${enterprise.accent}, #d9c7a4 70%, #f3ead7)` }}><span>01 / 03</span><div><small>FROM {enterprise.location.toUpperCase()}</small><strong>{content.title}</strong></div></div><div className="instagram-actions"><span><Heart size={22} /><MessageCircle size={21} /><Send size={20} /></span><Bookmark size={21} /></div><div className="instagram-caption"><strong>Liked by community and 1,248 others</strong><p><b>{enterprise.name.replaceAll(" ", "").toLowerCase()}</b> {content.body}</p><div>{content.hashtags.join(" ")}</div><small>View all 36 comments · just now</small></div></div>;
}

function TikTokPreview({ content, enterprise }: { content: ContentVersion; enterprise: Enterprise }) {
  return <div className="tiktok-phone"><div className="tiktok-top"><span>Following</span><strong>For You</strong></div><div className="tiktok-scene" style={{ background: `linear-gradient(165deg, #111 8%, ${enterprise.accent} 54%, #c5a477)` }}><div className="tiktok-scene-copy"><small>FROM {enterprise.location.toUpperCase()}</small><strong>{content.title}</strong><span>▶ 00:15</span></div></div><div className="tiktok-rail"><span className="tiktok-avatar">{enterprise.name.slice(0, 1)}<i>+</i></span><span>♥<small>12.8K</small></span><span>●<small>328</small></span><span>↗<small>Share</small></span></div><div className="tiktok-caption"><strong>@{enterprise.name.replaceAll(" ", "").toLowerCase()}</strong><p>{content.body}</p><div>{content.hashtags.join(" ")}</div><span>♫ original sound · {enterprise.name}</span></div><nav><span>⌂<small>Home</small></span><span>⌕<small>Discover</small></span><b>＋</b><span>▣<small>Inbox</small></span><span>♙<small>Profile</small></span></nav></div>;
}
