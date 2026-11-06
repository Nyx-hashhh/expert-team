"use client";

import { Bookmark, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Copy, Download, Globe2, Heart, ImageIcon, MessageCircle, MessageCircleMore, Music2, Pause, Play, Repeat2, Search, Send, Share2, Star, UserRound, UserPlus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { PLATFORM_LABELS, PLATFORMS, type ContentVersion, type Enterprise, type GenerateResult, type Platform, type Version } from "@/contracts/content";
import { readLocal, writeLocal } from "@/lib/storage";
import { DEFAULT_TIME_ZONE, INITIAL_FAVORITE_TIME_ZONES, RECOMMENDED_TIME_ZONES, SCHEDULE_TIME_ZONES, findScheduleTimeZone, scheduleDateToUtc, type ScheduleTimeZone } from "@/lib/schedule-timezones";
import springTeaHero from "./hero-spring-tea.png";
import heritageTownHero from "./hero-heritage-town.png";
import navelOrangeHero from "./hero-navel-orange.png";
import styles from "./preview.module.css";

interface PreviewPanelProps {
  enterprise: Enterprise;
  result: GenerateResult | null;
  activePlatform: Platform;
  activeVersion: Version;
  previewWidth: number;
  onPlatformChange: (platform: Platform) => void;
  onVersionChange: (version: Version) => void;
  onPreviewWidthChange: (width: number) => void;
  onSchedule: (scheduledAt: string, timeZone: string) => void;
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

function formatInstagramCount(value: number): string {
  return value >= 10000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString("en-US");
}

function dateValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

const DEMO_HEROES: Partial<Record<string, { image: typeof springTeaHero; alt: string }>> = {
  "spring-tea": { image: springTeaHero, alt: "春茶茶汤与鲜叶场景示意图" },
  "heritage-town": { image: heritageTownHero, alt: "古镇陶艺体验场景示意图" },
  "navel-orange": { image: navelOrangeHero, alt: "新鲜脐橙产品场景示意图" },
};

type PreviewLanguage = "zh" | "en";

const ENGLISH_LOCATIONS: Record<string, string> = {
  "spring-tea": "Anji, Zhejiang",
  "heritage-town": "Jingdezhen, Jiangxi",
  "navel-orange": "Ganzhou, Jiangxi",
};

const ENGLISH_HERO_ALTS: Record<string, string> = {
  "spring-tea": "Spring tea leaves and brewed tea",
  "heritage-town": "Traditional pottery experience in an old town",
  "navel-orange": "Fresh navel oranges",
};

function previewLanguage(content: ContentVersion, enterprise: Enterprise): PreviewLanguage {
  const copy = `${content.title} ${content.body} ${content.hashtags.join(" ")}`
    .replaceAll(enterprise.name, "")
    .replaceAll(enterprise.location, "");
  const chineseCharacters = copy.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  const englishWords = copy.match(/[a-z]+/gi)?.length ?? 0;
  return chineseCharacters > englishWords ? "zh" : "en";
}

function previewLocation(enterprise: Enterprise, language: PreviewLanguage): string {
  if (language === "zh" || !/[\u3400-\u9fff]/.test(enterprise.location)) return enterprise.location;
  return ENGLISH_LOCATIONS[enterprise.id] ?? "";
}

const previewCss = new Proxy(styles, { get: (target, key) => Reflect.get(target, key) || String(key) });

function DemoHero({ enterprise, creditClassName = "", language = "zh" }: { enterprise: Enterprise; creditClassName?: string; language?: PreviewLanguage }) {
  const hero = DEMO_HEROES[enterprise.id];
  if (!hero) return null;
  return <><Image src={hero.image} alt={language === "zh" ? hero.alt : ENGLISH_HERO_ALTS[enterprise.id] ?? "Illustrative image"} fill sizes="300px" loading="eager" className={previewCss.demoHeroImage} unoptimized /><small className={`${previewCss.demoHeroCredit} ${creditClassName}`}>{language === "zh" ? "AI 示意图" : "AI illustration"}</small></>;
}

export function PreviewPanel({ enterprise, result, activePlatform, activeVersion, previewWidth, onPlatformChange, onVersionChange, onPreviewWidthChange, onSchedule }: PreviewPanelProps) {
  const captureRef = useRef<HTMLDivElement>(null);
  const platformTabsRef = useRef<HTMLDivElement>(null);
  const [notice, setNotice] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [activePicker, setActivePicker] = useState<"date" | "time" | "zone" | null>(null);
  const [selectedTimeZone, setSelectedTimeZone] = useState(DEFAULT_TIME_ZONE);
  const [defaultTimeZone, setDefaultTimeZone] = useState(DEFAULT_TIME_ZONE);
  const [favoriteTimeZones, setFavoriteTimeZones] = useState<string[]>(INITIAL_FAVORITE_TIME_ZONES);
  const [timeZoneSearch, setTimeZoneSearch] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(2000, 0, 1));
  const [isExporting, setIsExporting] = useState(false);
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
  const selectedZone = findScheduleTimeZone(selectedTimeZone) ?? SCHEDULE_TIME_ZONES[0];
  const favoriteZones = favoriteTimeZones.map(findScheduleTimeZone).filter((zone): zone is ScheduleTimeZone => Boolean(zone));
  const recommendedZones = RECOMMENDED_TIME_ZONES.map(findScheduleTimeZone).filter((zone): zone is ScheduleTimeZone => Boolean(zone)).sort((a, b) => a.countryEn.localeCompare(b.countryEn, "en") || a.cityEn.localeCompare(b.cityEn, "en"));
  const filteredZones = SCHEDULE_TIME_ZONES.filter((zone) => `${zone.country} ${zone.countryEn} ${zone.city} ${zone.cityEn} ${zone.label} ${zone.id}`.toLowerCase().includes(timeZoneSearch.trim().toLowerCase()));
  const selectedHour = scheduleTime ? scheduleTime.slice(0, 2) : "";
  const selectedMinute = scheduleTime ? scheduleTime.slice(3, 5) : "";
  const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const calendarOffset = (monthStart.getDay() + 6) % 7;
  const calendarDays = Array.from({ length: Math.ceil((calendarOffset + new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()) / 7) * 7 }, (_, index) => {
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), index - calendarOffset + 1);
    return { date, value: dateValue(date), inMonth: date.getMonth() === calendarMonth.getMonth() };
  });

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

  useEffect(() => {
    const reset = setTimeout(() => {
      setSlide(0);
      setLiked(false);
      setCollected(false);
      setExtraLikes(0);
      setBurstKey(0);
      setActiveShot(0);
      setPlaying(true);
    }, 0);
    return () => clearTimeout(reset);
  }, [content]);
  useEffect(() => {
    const list = platformTabsRef.current;
    const selected = list?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!list || !selected) return;
    const listBounds = list.getBoundingClientRect();
    const selectedBounds = selected.getBoundingClientRect();
    if (selectedBounds.left < listBounds.left) list.scrollBy({ left: selectedBounds.left - listBounds.left, behavior: "smooth" });
    else if (selectedBounds.right > listBounds.right) list.scrollBy({ left: selectedBounds.right - listBounds.right, behavior: "smooth" });
  }, [activePlatform]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 2200); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => { if (!scheduleSuccess) return; const timer = setTimeout(() => setScheduleSuccess(false), 1600); return () => clearTimeout(timer); }, [scheduleSuccess]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const saved = readLocal<{ defaultTimeZone: string; favorites: string[] }>("schedule-timezone-prefs", { defaultTimeZone: DEFAULT_TIME_ZONE, favorites: INITIAL_FAVORITE_TIME_ZONES });
      const nextDefault = findScheduleTimeZone(saved.defaultTimeZone) ? saved.defaultTimeZone : DEFAULT_TIME_ZONE;
      const nextFavorites = Array.isArray(saved.favorites) ? saved.favorites.filter((id) => findScheduleTimeZone(id)) : INITIAL_FAVORITE_TIME_ZONES;
      setDefaultTimeZone(nextDefault);
      setSelectedTimeZone(nextDefault);
      setFavoriteTimeZones([...new Set([nextDefault, ...nextFavorites])]);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);
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

  function confirmSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scheduleDate || !scheduleTime) {
      setScheduleError("请选择发布日期和时间");
      return;
    }
    const scheduled = scheduleDateToUtc(scheduleDate, scheduleTime, selectedTimeZone);
    if (!scheduled) { setScheduleError("该时区的此时间不存在，请换一个时间"); return; }
    if (scheduled.getTime() <= Date.now()) {
      setScheduleError("请选择将来的发布日期和时间");
      return;
    }
    try {
      onSchedule(scheduled.toISOString(), selectedTimeZone);
      setScheduleOpen(false);
      setActivePicker(null);
      setScheduleSuccess(true);
      setScheduleError("");
    } catch {
      setScheduleError("保存失败，请重试");
    }
  }

  function toggleFavoriteTimeZone(id: string) {
    if (id === defaultTimeZone) return;
    const next = favoriteTimeZones.includes(id) ? favoriteTimeZones.filter((item) => item !== id) : [...favoriteTimeZones, id];
    setFavoriteTimeZones(next);
    writeLocal("schedule-timezone-prefs", { defaultTimeZone, favorites: next });
  }

  function makeDefaultTimeZone(id: string) {
    const next = [...new Set([id, ...favoriteTimeZones])];
    setDefaultTimeZone(id);
    setSelectedTimeZone(id);
    setFavoriteTimeZones(next);
    writeLocal("schedule-timezone-prefs", { defaultTimeZone: id, favorites: next });
  }

  function timeZoneRow(zone: ScheduleTimeZone) {
    return <div className={previewCss.zoneRow} key={zone.id}>
      <button type="button" className={previewCss.zoneChoice} onClick={() => { setSelectedTimeZone(zone.id); setScheduleError(""); }} aria-pressed={selectedTimeZone === zone.id}><span><strong>{zone.label}</strong><small>{zone.country} {zone.countryEn} · {zone.city}</small></span>{selectedTimeZone === zone.id && <Check size={14} />}</button>
      <button type="button" className={`${previewCss.zoneStar} ${favoriteTimeZones.includes(zone.id) ? previewCss.zoneStarOn : ""}`} onClick={() => toggleFavoriteTimeZone(zone.id)} disabled={zone.id === defaultTimeZone} aria-label={`${zone.id === defaultTimeZone ? "默认常用" : favoriteTimeZones.includes(zone.id) ? "移出常用" : "加入常用"}：${zone.label}`} aria-pressed={favoriteTimeZones.includes(zone.id)} title={zone.id === defaultTimeZone ? "默认时区始终保留在常用" : "添加或移除常用时区"}><Star size={14} fill={favoriteTimeZones.includes(zone.id) ? "currentColor" : "none"} /></button>
      {selectedTimeZone === zone.id && <button type="button" className={previewCss.zoneDefault} onClick={() => makeDefaultTimeZone(zone.id)} disabled={defaultTimeZone === zone.id}>{defaultTimeZone === zone.id ? "默认" : "设默认"}</button>}
    </div>;
  }

  async function exportImage() {
    const target = captureRef.current;
    if (!target || !content || isExporting) return;
    const filename = `${enterprise.name}-${PLATFORM_LABELS[activePlatform]}-${activeVersion}.png`.replace(/[<>:"/\\|?*]/g, "_");
    setIsExporting(true);
    try {
      // The picker must open during the click gesture, before rendering the image.
      let fileHandle: FileSystemFileHandle | null = null;
      const pickerWindow = window as Window & { showSaveFilePicker?: (options: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) => Promise<FileSystemFileHandle> };
      if (pickerWindow.showSaveFilePicker) {
        try {
          fileHandle = await pickerWindow.showSaveFilePicker({ suggestedName: filename, types: [{ description: "PNG 图片", accept: { "image/png": [".png"] } }] });
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") return;
          // Embedded browsers may block the picker; use their normal download flow.
        }
      }

      const html2canvas = (await import("html2canvas-pro")).default;
      const innerScroller = target.querySelector<HTMLElement>(`.${previewCss.xhsContent}`);
      const innerOverflow = innerScroller ? Math.max(0, innerScroller.scrollHeight - innerScroller.clientHeight) : 0;
      const captureHeight = target.scrollHeight + innerOverflow;
      const canvas = await html2canvas(target, {
        backgroundColor: "#f8f7f4",
        scale: 2,
        useCORS: true,
        height: captureHeight,
        windowHeight: Math.max(window.innerHeight, captureHeight),
        onclone: (_document, clonedTarget) => {
          if (innerScroller) {
            const phone = clonedTarget.querySelector<HTMLElement>(`.${previewCss.xhsPhone}`);
            const screen = clonedTarget.querySelector<HTMLElement>(`.${previewCss.xhsScreen}`);
            const content = clonedTarget.querySelector<HTMLElement>(`.${previewCss.xhsContent}`);
            if (phone) phone.style.height = "auto";
            if (screen) screen.style.height = "auto";
            if (content) {
              content.style.flex = "none";
              content.style.height = "auto";
              content.style.overflow = "visible";
              content.scrollTop = 0;
            }
          }
          clonedTarget.style.flex = "none";
          clonedTarget.style.height = `${captureHeight}px`;
          clonedTarget.style.maxHeight = "none";
          clonedTarget.style.overflow = "visible";
          clonedTarget.scrollTop = 0;
        },
      });
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG conversion failed")), "image/png"));
      if (fileHandle) {
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        setNotice("预览长图已保存");
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
        setNotice("预览长图已下载");
      }
    } catch (error) {
      console.error("Preview image export failed", error);
      setNotice("导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  }

  function startResize(event: React.PointerEvent<HTMLDivElement>) {
    if (window.innerWidth <= 1020) return;
    const startX = event.clientX;
    const startWidth = previewWidth;
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    document.body.classList.add("resizing-preview");

    function resize(moveEvent: PointerEvent) {
      const maxWidth = Math.min(720, window.innerWidth - 244 - 480);
      onPreviewWidthChange(Math.min(maxWidth, startWidth + startX - moveEvent.clientX));
    }

    function stopResize() {
      document.body.classList.remove("resizing-preview");
      window.removeEventListener("pointermove", resize);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
    }

    window.addEventListener("pointermove", resize);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);
  }

  function resizeWithKeyboard(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    onPreviewWidthChange(previewWidth + (event.key === "ArrowLeft" ? 24 : -24));
  }

  return (
    <section className="preview-column">
      <div className="preview-resizer" role="separator" aria-label="调节拟真预览宽度" aria-orientation="vertical" aria-valuemin={320} aria-valuemax={720} aria-valuenow={previewWidth} tabIndex={0} onPointerDown={startResize} onKeyDown={resizeWithKeyboard}><span /><small>拖动调节预览宽度</small></div>
      <div className="preview-header">
        <div><span className="eyebrow">LIVE PREVIEW</span><h2>多端拟真预览</h2></div>
        <span className="live-pill"><span /> 实时同步</span>
      </div>
      <div className={previewCss.platformTabStrip}>
        <button type="button" className={previewCss.platformTabArrow} aria-label="向左查看平台" onClick={() => platformTabsRef.current?.scrollBy({ left: -180, behavior: "smooth" })}><ChevronLeft size={15} /></button>
        <div className={`preview-tabs ${previewCss.platformTabTrack}`} ref={platformTabsRef} aria-label="预览平台，可横向滑动">
          {PLATFORMS.map((platform) => (
            <button key={platform} type="button" className={activePlatform === platform ? "active" : ""} aria-pressed={activePlatform === platform} onClick={() => { setScheduleOpen(false); onPlatformChange(platform); }} disabled={Boolean(result) && !available.includes(platform)}>{PLATFORM_LABELS[platform]}</button>
          ))}
        </div>
        <button type="button" className={previewCss.platformTabArrow} aria-label="向右查看平台" onClick={() => platformTabsRef.current?.scrollBy({ left: 180, behavior: "smooth" })}><ChevronRight size={15} /></button>
      </div>
      <div className="version-row"><span>创意版本</span><div className="version-tabs">{(["A", "B"] as Version[]).map((version) => <button key={version} onClick={() => { setScheduleOpen(false); onVersionChange(version); }} className={activeVersion === version ? "active" : ""}>版本 {version}</button>)}</div></div>
      <div className="preview-scroll" ref={captureRef}>
        {!shownContent ? <div className="empty-preview"><div className="empty-icon">✦</div><h3>好内容，即将发生</h3><p>选择素材并输入宣发诉求，点击生成后即可在这里预览各平台 A/B 文案。</p></div> : <PlatformPreview platform={activePlatform} content={shownContent} enterprise={enterprise} interaction={interaction} />}
      </div>
      <div className="preview-actions">
        <button onClick={copyContent} disabled={!content}><Copy size={16} /> 复制全文</button>
        <button onClick={exportImage} disabled={!content || isExporting}><Download size={16} /> {isExporting ? "导出中…" : "导出长图"}</button>
        <button className="schedule-action" onClick={() => { if (!scheduleOpen) { setScheduleDate(""); setScheduleTime(""); setSelectedTimeZone(defaultTimeZone); setTimeZoneSearch(""); } setScheduleOpen((open) => !open); setActivePicker(null); setScheduleError(""); setScheduleSuccess(false); }} disabled={!content} aria-expanded={scheduleOpen} aria-controls="preview-schedule-form"><Send size={16} /> 推送日历</button>
      </div>
      {scheduleOpen && content && <form id="preview-schedule-form" className={previewCss.schedulePanel} onSubmit={confirmSchedule}>
        <div className={previewCss.scheduleHeading}><div><CalendarDays size={16} /><strong>选择推送时间</strong></div><button type="button" aria-label="关闭排期设置" onClick={() => setScheduleOpen(false)}><X size={16} /></button></div>
        <p>为 {PLATFORM_LABELS[activePlatform]} · 版本 {activeVersion} 设置发布日期</p>
        <div className={previewCss.scheduleFields}>
          <div className={previewCss.scheduleField} onMouseLeave={() => setActivePicker((current) => current === "date" ? null : current)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActivePicker((current) => current === "date" ? null : current); }}>
            <span>发布日期</span>
            <button type="button" className={previewCss.pickerTrigger} aria-label="选择发布日期" aria-expanded={activePicker === "date"} onClick={() => { const opening = activePicker !== "date"; setActivePicker(opening ? "date" : null); if (opening) { const selected = scheduleDate ? new Date(`${scheduleDate}T12:00`) : new Date(); setCalendarMonth(new Date(selected.getFullYear(), selected.getMonth(), 1)); } }}><CalendarDays size={14} />{scheduleDate || "选择日期"}<ChevronDown size={13} /></button>
            {activePicker === "date" && <div className={previewCss.datePopover} role="group" aria-label="发布日期日历">
              <div className={previewCss.calendarTop}><strong>{calendarMonth.getFullYear()} 年 {calendarMonth.getMonth() + 1} 月</strong><div><button type="button" aria-label="上个月" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}><ChevronLeft size={15} /></button><button type="button" aria-label="下个月" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}><ChevronRight size={15} /></button></div></div>
              <div className={previewCss.calendarGrid}>{["一", "二", "三", "四", "五", "六", "日"].map((day) => <span key={day}>{day}</span>)}{calendarDays.map(({ date, value, inMonth }) => <button key={value} type="button" className={`${!inMonth ? previewCss.outsideMonth : ""} ${value === scheduleDate ? previewCss.selectedDay : ""}`} aria-label={value} aria-pressed={value === scheduleDate} onClick={() => { setScheduleDate(value); setScheduleError(""); if (!inMonth) setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1)); }}>{date.getDate()}</button>)}</div>
              <button type="button" className={previewCss.todayButton} onClick={() => { const today = new Date(); setScheduleDate(dateValue(today)); setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setScheduleError(""); }}>选择今天</button>
            </div>}
          </div>
          <div className={previewCss.scheduleField} onMouseLeave={() => setActivePicker((current) => current === "time" ? null : current)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActivePicker((current) => current === "time" ? null : current); }}>
            <span>推送时间</span>
            <button type="button" className={previewCss.pickerTrigger} aria-label="选择推送时间" aria-expanded={activePicker === "time"} onClick={() => setActivePicker(activePicker === "time" ? null : "time")}><Clock3 size={14} />{scheduleTime || "选择时间"}<ChevronDown size={13} /></button>
            {activePicker === "time" && <div className={previewCss.timePopover} role="group" aria-label="推送时间选择"><div className={previewCss.timeCaption}><strong>选择时间</strong><small>24 小时制</small></div><div className={previewCss.timeColumns}><div><span>小时</span>{Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, "0")).map((hour) => <button key={hour} type="button" className={selectedHour === hour ? previewCss.selectedTime : ""} aria-pressed={selectedHour === hour} onClick={() => { setScheduleTime(`${hour}:${selectedMinute || "00"}`); setScheduleError(""); }}>{hour}</button>)}</div><div><span>分钟</span>{Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, "0")).map((minute) => <button key={minute} type="button" className={selectedMinute === minute ? previewCss.selectedTime : ""} aria-pressed={selectedMinute === minute} onClick={() => { setScheduleTime(`${selectedHour || "00"}:${minute}`); setScheduleError(""); }}>{minute}</button>)}</div></div><div className={previewCss.timeSummary}>已选 {scheduleTime || "--:--"}</div></div>}
          </div>
        </div>
        <div className={previewCss.zoneField} onMouseLeave={() => setActivePicker((current) => current === "zone" ? null : current)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActivePicker((current) => current === "zone" ? null : current); }}>
          <span>发布时区 <small>日期和时间均按所选城市计算</small></span>
          <button type="button" className={previewCss.zoneTrigger} aria-label="选择发布时区" aria-expanded={activePicker === "zone"} onClick={() => setActivePicker(activePicker === "zone" ? null : "zone")}><Globe2 size={15} /><strong>{selectedZone.country} · {selectedZone.label}</strong>{selectedTimeZone === defaultTimeZone && <em>默认</em>}<ChevronDown size={13} /></button>
          {activePicker === "zone" && <div className={previewCss.zonePopover} role="group" aria-label="发布时区列表">
            <div className={previewCss.zonePopoverHead}><strong>选择发布时区</strong><small>按国家英文名 A–Z 排列</small></div>
            <label className={previewCss.zoneSearch}><Search size={14} /><input value={timeZoneSearch} onChange={(event) => setTimeZoneSearch(event.target.value)} placeholder="搜索国家或城市" aria-label="搜索国家或城市" /></label>
            {!timeZoneSearch.trim() && <><div className={previewCss.zoneSectionTitle}>我的常用 <small>点击星标可自定义</small></div><div className={previewCss.zoneList}>{favoriteZones.map(timeZoneRow)}</div><div className={previewCss.zoneSectionTitle}>常用推荐</div><div className={previewCss.zoneList}>{recommendedZones.map(timeZoneRow)}</div></>}
            <div className={previewCss.zoneSectionTitle}>全部时区 · A–Z</div><div className={`${previewCss.zoneList} ${previewCss.zoneAllList}`}>{filteredZones.length ? filteredZones.map((zone, index) => <div key={zone.id}>{(index === 0 || filteredZones[index - 1].countryEn[0] !== zone.countryEn[0]) && <div className={previewCss.zoneLetter}>{zone.countryEn[0]}</div>}{timeZoneRow(zone)}</div>) : <p className={previewCss.zoneEmpty}>没有找到匹配的国家或城市</p>}</div>
          </div>}
        </div>
        {scheduleError && <p className={previewCss.scheduleError} role="alert">{scheduleError}</p>}
        <button className={previewCss.scheduleConfirm} type="submit"><Check size={15} /> 确认推送</button>
      </form>}
      {scheduleSuccess && <div className={previewCss.scheduleToast} role="status"><Check size={16} /> 日历推送成功</div>}
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
    case "xiaohongshu": return <XiaohongshuPreview content={content} enterprise={enterprise} slide={interaction.slide} onSlideChange={interaction.onSlideChange} liked={interaction.liked} collected={interaction.collected} likeCount={interaction.likeCount} collectCount={interaction.collectCount} burstKey={interaction.burstKey} onLike={interaction.onLike} onCollect={interaction.onCollect} />;
    case "weibo": return <WeiboPreview content={content} enterprise={enterprise} repostCount={interaction.repostCount} commentCount={interaction.commentCount} likeCount={interaction.likeCount} />;
    case "douyin": return <DouyinPreview content={content} enterprise={enterprise} activeShot={interaction.activeShot} playing={interaction.playing} liked={interaction.liked} likeCount={interaction.likeCount} commentCount={interaction.commentCount} shareCount={interaction.shareCount} onShotChange={interaction.onShotChange} onTogglePlay={interaction.onTogglePlay} onLike={interaction.onLike} />;
    case "reddit": return <RedditPreview content={content} enterprise={enterprise} />;
    case "discord": return <DiscordPreview content={content} enterprise={enterprise} />;
    case "instagram": return <InstagramPreview key={enterprise.id} content={content} enterprise={enterprise} interaction={interaction} />;
    case "tiktok": return <TikTokPreview content={content} enterprise={enterprise} />;
  }
}

function XiaohongshuPreview({ content, enterprise, slide, onSlideChange, liked, collected, likeCount, collectCount, burstKey, onLike, onCollect }: {
  content: ContentVersion;
  enterprise: Enterprise;
  slide: number;
  onSlideChange: (slide: number) => void;
  liked: boolean;
  collected: boolean;
  likeCount: number;
  collectCount: number;
  burstKey: number;
  onLike: () => void;
  onCollect: () => void;
}) {
  // 当前 Turbopack 规则将此文件作为普通 CSS 加载；小红书预览显式回退到全局类名。
  const xhsCss = previewCss;
  const imageSlots = [1, 2, 3];
  const hero = DEMO_HEROES[enterprise.id];
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
              <div key={slot} className={`${xhsCss.carouselSlide} ${slot === 1 && hero ? "" : xhsCss.imagePlaceholder}`} aria-label={slot === 1 && hero ? hero.alt : `图片位置 ${slot}`}>
                {slot === 1 && hero ? <><Image src={hero.image} alt={hero.alt} fill sizes="300px" loading="eager" className={xhsCss.heroPhoto} unoptimized /><span className={xhsCss.heroNote}>AI 示意图</span></> : <><ImageIcon size={30} strokeWidth={1.4} aria-hidden="true" /><span>图片位置 {slot}</span></>}
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
          <div className={xhsCss.xhsMeta}>刚刚{enterprise.location ? ` · 来自 ${enterprise.location}` : ""} · 互动数据为模拟</div>
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
          <button type="button" className={liked ? xhsCss.xhsSelected : undefined} onClick={onLike} aria-label="点赞" aria-pressed={liked}><Heart size={18} fill={liked ? "currentColor" : "none"} />{formatCount(likeCount)}</button>
          <button type="button" className={collected ? xhsCss.xhsCollected : undefined} onClick={onCollect} aria-label={collected ? "取消收藏" : "收藏"} aria-pressed={collected}><Star size={20} strokeWidth={1.9} fill={collected ? "currentColor" : "none"} />{formatCount(collectCount + Number(collected))}</button>
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
      <div className="weibo-grid">{["品牌故事", enterprise.industry, "好物分享", "匠心细节"].map((label, index) => <div key={label} className={index === 0 ? previewCss.weiboHeroTile : undefined} style={{ backgroundColor: `${enterprise.accent}${index % 2 ? "55" : "88"}` }}>{index === 0 && DEMO_HEROES[enterprise.id] ? <DemoHero enterprise={enterprise} /> : label}</div>)}</div>
      <div className={previewCss.hotComment}><b>@薄荷绿茶</b>：支持本土小品牌，这条文案是真的走心，已经转发给闺蜜了 <span>· {formatCount(Math.max(12, Math.round(likeCount / 6)))} 人赞</span></div>
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
      <div className={previewCss.dyPlayer}>
        {DEMO_HEROES[enterprise.id] && <><DemoHero enterprise={enterprise} creditClassName={previewCss.videoHeroCredit} /><div className={previewCss.videoHeroShade} /></>}
        <div className={previewCss.dyProgress}>{shots.map((shot, index) => <i key={shot.timeRange} className={index <= activeShot ? previewCss.on : undefined} />)}</div>
        <div className={previewCss.dyCenter}>
          <button type="button" className={previewCss.dyPlay} onClick={onTogglePlay} aria-label={playing ? "暂停分镜演示" : "播放分镜演示"}>{playing ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 3 }} />}</button>
          <div className={previewCss.dyTitle}>{content.title}</div>
          <div className={previewCss.dySub}>15 秒竖屏短视频 · 黄金前 3 秒钩子</div>
        </div>
        <div className={previewCss.dyCaption}><b>@{enterprise.name}</b><small>{content.hashtags.join("  ")}</small></div>
        <div className={previewCss.dyRail}>
          <span className={previewCss.commentAvatar} style={{ background: enterprise.accent, width: 34, height: 34, fontSize: 13 }}>{enterprise.name.slice(0, 1)}</span>
          <span className={previewCss.dyFollow}><UserPlus size={9} /></span>
          <button type="button" className={previewCss.dyRailItem} onClick={onLike} aria-label="点赞"><Heart size={25} color={liked ? "#ff2c55" : "#fff"} fill={liked ? "#ff2c55" : "none"} />{formatCount(likeCount)}</button>
          <span className={previewCss.dyRailItem}><MessageCircle size={25} />{formatCount(commentCount)}</span>
          <span className={previewCss.dyRailItem}><Share2 size={25} />{formatCount(shareCount)}</span>
          <span className={previewCss.dyDisc}><Music2 size={13} color="#cfe0d6" /></span>
        </div>
      </div>
      <div className="script-section"><h4>核心口播</h4><p>{content.body}</p></div>
      <div className="script-section">
        <h4>分镜脚本<span className={previewCss.demoTag}>{playing ? "自动演示中" : "已暂停"}</span></h4>
        <div className={previewCss.shotListV2}>
          {shots.map((shot, index) => (
            <button type="button" key={shot.timeRange} className={`${previewCss.shotItem} ${index === activeShot ? previewCss.shotOn : ""}`} style={index === activeShot ? { borderColor: enterprise.accent } : undefined} onClick={() => onShotChange(index)}>
              <span className={previewCss.shotTime}>{shot.timeRange}</span>
              <span className={previewCss.shotMain}>
                <strong>{shot.shot}</strong>
                <span className={previewCss.shotText}>🎙 {shot.voiceover}</span>
                <small className={previewCss.shotBgm}>♫ {shot.bgm}</small>
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
  const language = previewLanguage(content, enterprise);
  return <div className="reddit-shell" lang={language === "zh" ? "zh-CN" : "en"}><div className="reddit-bar"><strong>reddit</strong><span>r/smallbusiness</span><button>{language === "zh" ? "加入" : "Join"}</button></div><div className="reddit-post"><aside><button>▲</button><strong>128</strong><button>▼</button></aside><article><div className="reddit-meta"><span className="reddit-community">r/smallbusiness</span> · {language === "zh" ? `由 u/${enterprise.name.replaceAll(" ", "_")} 发布 · 刚刚` : `Posted by u/${enterprise.name.replaceAll(" ", "_")} · just now`}</div><h3>{content.title}</h3>{DEMO_HEROES[enterprise.id] && <div className={previewCss.feedHero}><DemoHero enterprise={enterprise} language={language} /></div>}<p>{content.body}</p><div className="reddit-flairs">{content.hashtags.map((tag) => <span key={tag}>{tag}</span>)}</div><footer><span><MessageCircle size={14} /> {language === "zh" ? "24 条评论" : "24 Comments"}</span><span><Share2 size={14} /> {language === "zh" ? "分享" : "Share"}</span><span>•••</span></footer></article></div></div>;
}

function DiscordPreview({ content, enterprise }: { content: ContentVersion; enterprise: Enterprise }) {
  const language = previewLanguage(content, enterprise);
  const channel = language === "zh" ? "# 公告" : "# announcements";
  return <div className="discord-shell" lang={language === "zh" ? "zh-CN" : "en"}><aside><span className="discord-home">D</span><span>{enterprise.name.slice(0, 1)}</span><span>+</span></aside><div className="discord-main"><header><strong>{channel}</strong><small>{language === "zh" ? "官方消息、新品发布与社群动态" : "Official news, launches and community updates"}</small></header><div className="discord-thread"><div className="discord-date"><span>{language === "zh" ? "2026年11月4日" : "November 4, 2026"}</span></div><div className="discord-message"><span className="discord-avatar">{enterprise.name.slice(0, 1)}</span><div><div className="discord-author"><strong>{enterprise.name}</strong><span>{language === "zh" ? "应用" : "APP"}</span><small>{language === "zh" ? "今天 9:41" : "Today at 9:41 AM"}</small></div><h3>{content.title}</h3>{DEMO_HEROES[enterprise.id] && <div className={previewCss.discordHero}><DemoHero enterprise={enterprise} language={language} /></div>}<p>{content.body}</p><div className="discord-tags">{content.hashtags.join("  ")}</div><div className="discord-reactions"><span>🌿 18</span><span>✨ 12</span><span>＋</span></div></div></div></div><div className="discord-input">{language === "zh" ? `发送消息至 ${channel}` : `Message ${channel}`} <span>☺</span></div></div></div>;
}

function InstagramPreview({ content, enterprise, interaction }: { content: ContentVersion; enterprise: Enterprise; interaction: PreviewInteraction }) {
  const [following, setFollowing] = useState(false);
  const language = previewLanguage(content, enterprise);
  const isChinese = language === "zh";
  const location = previewLocation(enterprise, language);
  return <div className="instagram-phone" lang={isChinese ? "zh-CN" : "en"}>
    <div className={previewCss.igHead}><strong>Instagram</strong></div>
    <div className="instagram-profile">
      <span className="ig-avatar" style={{ background: `linear-gradient(135deg, ${enterprise.accent}, #edc77a)` }}><i>{enterprise.name.slice(0, 1)}</i></span>
      <div className={previewCss.igProfileName}><strong>{enterprise.name.replaceAll(" ", "").toLowerCase()}</strong>{location && <small>{location}</small>}</div>
      <span className={previewCss.igProfileControls}>
        <button type="button" className={previewCss.igFollow} aria-pressed={following} onClick={() => setFollowing((value) => !value)}>{following ? (isChinese ? "已关注" : "Following") : (isChinese ? "关注" : "Follow")}</button>
        <span className={previewCss.igTwoLineMenu} role="img" aria-label={isChinese ? "更多选项" : "More options"}><i /><i /></span>
      </span>
    </div>
    <div className="instagram-hero" style={{ background: `linear-gradient(145deg, ${enterprise.accent}, #d9c7a4 70%, #f3ead7)` }}>
      {DEMO_HEROES[enterprise.id] && <><DemoHero enterprise={enterprise} language={language} creditClassName={previewCss.instagramHeroCredit} /><div className={previewCss.instagramHeroShade} /></>}
      <span>01 / 03</span><div className={previewCss.instagramHeroText}>{location && <small>{location}</small>}<strong>{content.title}</strong></div>
    </div>
    <div className={previewCss.igActions} aria-label={isChinese ? "模拟互动数据" : "Simulated engagement"}>
      <div className={previewCss.igMetrics}>
        <button type="button" className={previewCss.igMetric} onClick={interaction.onLike} aria-label={`${isChinese ? "点赞" : "Like"} ${interaction.likeCount}`} aria-pressed={interaction.liked}><Heart fill={interaction.liked ? "#ed4956" : "none"} color={interaction.liked ? "#ed4956" : "currentColor"} aria-hidden="true" />{formatInstagramCount(interaction.likeCount)}</button>
        <span className={previewCss.igMetric} aria-label={`${isChinese ? "评论" : "Comments"} ${interaction.commentCount}`}><MessageCircle aria-hidden="true" />{formatInstagramCount(interaction.commentCount)}</span>
        <span className={previewCss.igMetric} aria-label={`${isChinese ? "转发" : "Reposts"} ${interaction.repostCount}`}><Repeat2 aria-hidden="true" />{formatInstagramCount(interaction.repostCount)}</span>
        <span className={previewCss.igMetric} aria-label={`${isChinese ? "分享" : "Shares"} ${interaction.shareCount}`}><Send aria-hidden="true" />{formatInstagramCount(interaction.shareCount)}</span>
      </div>
      <button type="button" className={`${previewCss.igMetric} ${previewCss.igBookmarkMetric}`} onClick={interaction.onCollect} aria-label={`${isChinese ? "收藏" : "Save"} ${interaction.collectCount + Number(interaction.collected)}`} aria-pressed={interaction.collected}><Bookmark fill={interaction.collected ? "currentColor" : "none"} aria-hidden="true" />{formatInstagramCount(interaction.collectCount + Number(interaction.collected))}</button>
    </div>
    <div className="instagram-caption"><p><b>{enterprise.name.replaceAll(" ", "").toLowerCase()}</b> {content.body}</p><div>{content.hashtags.join(" ")}</div><small>{isChinese ? `查看全部 ${formatInstagramCount(interaction.commentCount)} 条评论 · 刚刚` : `View all ${formatInstagramCount(interaction.commentCount)} comments · just now`}</small></div>
  </div>;
}

function TikTokPreview({ content, enterprise }: { content: ContentVersion; enterprise: Enterprise }) {
  const language = previewLanguage(content, enterprise);
  const isChinese = language === "zh";
  const location = previewLocation(enterprise, language);
  return <div className="tiktok-phone" lang={isChinese ? "zh-CN" : "en"}>
    <div className="tiktok-top"><span>{isChinese ? "关注" : "Following"}</span><strong>{isChinese ? "推荐" : "For You"}</strong></div>
    <div className="tiktok-scene" style={{ background: `linear-gradient(165deg, #111 8%, ${enterprise.accent} 54%, #c5a477)` }}>
      {DEMO_HEROES[enterprise.id] && <DemoHero enterprise={enterprise} language={language} creditClassName={previewCss.tiktokHeroCredit} />}
      <div className="tiktok-scene-copy">{location && <small>{isChinese ? `来自 ${location}` : `FROM ${location.toUpperCase()}`}</small>}<strong>{content.title}</strong><span>▶ 00:15</span></div>
    </div>
    <div className="tiktok-rail"><span className="tiktok-avatar">{enterprise.name.slice(0, 1)}<i>+</i></span><span>♥<small>12.8K</small></span><span>●<small>328</small></span><span>↗<small>{isChinese ? "分享" : "Share"}</small></span></div>
    <div className="tiktok-caption"><strong>@{enterprise.name.replaceAll(" ", "").toLowerCase()}</strong><p>{content.body}</p><div>{content.hashtags.join(" ")}</div><span>♫ {isChinese ? "原声" : "original sound"} · {enterprise.name}</span></div>
    <nav><span>⌂<small>{isChinese ? "首页" : "Home"}</small></span><span>⌕<small>{isChinese ? "发现" : "Discover"}</small></span><b>＋</b><span>▣<small>{isChinese ? "收件箱" : "Inbox"}</small></span><span>♙<small>{isChinese ? "个人主页" : "Profile"}</small></span></nav>
  </div>;
}
