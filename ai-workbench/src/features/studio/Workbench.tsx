"use client";

import { BarChart3, BookOpen, CalendarDays, Check, ChevronRight, Copy, FileText, Layers3, Menu, Plus, Search, Settings2, Sparkles, WandSparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import enterprisesData from "@/data/enterprises.json";
import { buildFallback } from "@/data/fallback";
import { CONTRACT_VERSION, PLATFORM_LABELS, PLATFORMS, TRANSLATION_MODE_LABELS, type CreativeBrief, type Enterprise, type GenerateRequest, type GenerateResult, type Material, type MaterialType, type Platform, type ScheduleItem, type TranslateRequest, type TranslateResult, type TranslationMode, type Version } from "@/contracts/content";
import { readLocal, writeLocal } from "@/lib/storage";
import { buildCreativeBrief } from "@/data/translation";
import { PreviewPanel } from "@/features/preview/PreviewPanel";
import { Button } from "@/components/ui/button";

const enterprises = enterprisesData as Enterprise[];
const typeLabels: Record<MaterialType, string> = { product: "产品参数", story: "品牌故事", reference: "参考文案" };
const tones = ["闺蜜安利", "专业品鉴", "年轻活力", "温暖叙事"];
const platformMarks: Record<Platform, string> = { xiaohongshu: "小", weibo: "微", douyin: "抖", reddit: "r/", discord: "D", instagram: "IG", tiktok: "♪" };
const platformDescriptions: Record<Platform, string> = {
  xiaohongshu: "生活化种草",
  weibo: "短平快快讯",
  douyin: "黄金 3 秒口播",
  reddit: "社区讨论帖",
  discord: "社群公告互动",
  instagram: "视觉故事 Caption",
  tiktok: "英文短视频脚本",
};

export function Workbench() {
  const [enterpriseId, setEnterpriseId] = useState(enterprises[0].id);
  const [customMaterials, setCustomMaterials] = useState<Record<string, Material[]>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>(enterprises[0].materials.map((item) => item.id));
  const [goal, setGoal] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([...PLATFORMS]);
  const [tone, setTone] = useState(tones[0]);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [activePlatform, setActivePlatform] = useState<Platform>("xiaohongshu");
  const [activeVersion, setActiveVersion] = useState<Version>("A");
  const [quota, setQuota] = useState(20);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [draftMaterial, setDraftMaterial] = useState({ type: "product" as MaterialType, title: "", content: "" });
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(414);
  const [translationMode, setTranslationMode] = useState<TranslationMode>("story");
  const [creativeBrief, setCreativeBrief] = useState<CreativeBrief | null>(null);
  const [showEnginePanel, setShowEnginePanel] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const enterprise = enterprises.find((item) => item.id === enterpriseId) ?? enterprises[0];
  const materials = [...enterprise.materials, ...(customMaterials[enterprise.id] ?? [])];

  useEffect(() => {
    const timeout = setTimeout(() => { setCustomMaterials(readLocal("materials", {})); setQuota(readLocal("quota-v2", 20)); setPreviewWidth(readLocal("previewWidth", 414)); }, 0);
    return () => clearTimeout(timeout);
  }, []);

  function changeEnterprise(id: string) {
    const next = enterprises.find((item) => item.id === id) ?? enterprises[0];
    setEnterpriseId(next.id);
    setSelectedIds([...next.materials.map((item) => item.id), ...(customMaterials[next.id] ?? []).map((item) => item.id)]);
    setResult(null);
    setCreativeBrief(null);
    setNotice("");
  }

  async function requestCreativeBrief() {
    const selectedMaterials = materials.filter((item) => selectedIds.includes(item.id));
    const translateRequest: TranslateRequest = { contractVersion: CONTRACT_VERSION, enterpriseId, selectedMaterials, goal: goal.trim(), tone, mode: translationMode };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5500);
    try {
      const response = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(translateRequest), signal: controller.signal });
      if (!response.ok) throw new Error("translate unavailable");
      const translated = await response.json() as TranslateResult;
      if (translated.contractVersion !== CONTRACT_VERSION || !translated.brief?.storyAngle) throw new Error("invalid translate response");
      return translated;
    } catch {
      return { contractVersion: CONTRACT_VERSION, source: "local", brief: buildCreativeBrief(translateRequest, enterprise) } satisfies TranslateResult;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function translateIdea() {
    if (!goal.trim()) { setNotice("请先填写客户的核心宣发诉求，再生成文案思路"); return; }
    setIsTranslating(true); setNotice("正在把客户输入转成自然、有故事的文案思路…");
    const translated = await requestCreativeBrief();
    setCreativeBrief(translated.brief); setIsTranslating(false);
    setNotice(translated.source === "local" ? "已由本地转译引擎生成文案思路" : "已由智能模型生成文案思路");
  }

  function addMaterial() {
    if (!draftMaterial.title.trim() || !draftMaterial.content.trim()) return;
    const item: Material = { id: crypto.randomUUID(), type: draftMaterial.type, title: draftMaterial.title.trim(), content: draftMaterial.content.trim() };
    const next = { ...customMaterials, [enterprise.id]: [...(customMaterials[enterprise.id] ?? []), item] };
    setCustomMaterials(next); writeLocal("materials", next);
    setSelectedIds((current) => [...current, item.id]);
    setCreativeBrief(null);
    setDraftMaterial({ type: "product", title: "", content: "" }); setShowMaterialForm(false);
    setNotice("素材已保存到本机");
  }

  async function generate() {
    if (isGenerating) return;
    if (!goal.trim()) { setNotice("请先填写本次宣发诉求"); return; }
    if (!platforms.length) { setNotice("请至少选择一个目标平台"); return; }
    if (quota <= 0) { setNotice("试用额度已用完"); return; }
    setIsGenerating(true); setNotice("正在提炼故事切口与真实表达…");
    const translated = creativeBrief ? null : await requestCreativeBrief();
    const brief = creativeBrief ?? translated?.brief;
    if (brief) setCreativeBrief(brief);
    const request: GenerateRequest = { contractVersion: CONTRACT_VERSION, enterpriseId, selectedMaterialIds: selectedIds, selectedMaterials: materials.filter((item) => selectedIds.includes(item.id)), goal: goal.trim(), platforms, tone, translationMode, creativeBrief: brief };
    setNotice("正在按文案思路准备各平台 A/B 内容…");
    let next: GenerateResult;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(request), signal: controller.signal });
      if (!response.ok) throw new Error("unavailable");
      next = await response.json() as GenerateResult;
      if (next.contractVersion !== CONTRACT_VERSION || !next.platforms[platforms[0]]?.A) throw new Error("invalid response");
    } catch { next = buildFallback(request, enterprise); }
    finally { clearTimeout(timeout); }
    setResult(next); setActivePlatform(platforms[0]); setActiveVersion("A");
    setQuota(quota - 1); writeLocal("quota-v2", quota - 1);
    setIsGenerating(false);
    setNotice(next.source === "fallback" ? "已加载本地优质演示结果" : "已生成各平台 A/B 创意文案");
  }

  function schedule() {
    const content = result?.platforms[activePlatform]?.[activeVersion];
    if (!content) return;
    const item: ScheduleItem = { id: crypto.randomUUID(), enterpriseId, platform: activePlatform, version: activeVersion, content, scheduledAt: new Date().toISOString(), status: "draft" };
    writeLocal("schedule", [item, ...readLocal<ScheduleItem[]>("schedule", [])]);
    setNotice("已加入发布日历草稿");
  }

  function changePreviewWidth(width: number) {
    const next = Math.round(Math.min(720, Math.max(320, width)));
    setPreviewWidth(next);
    writeLocal("previewWidth", next);
  }

  const allPlatformsSelected = platforms.length === PLATFORMS.length;

  return <div className="app-shell" style={{ "--preview-width": `${previewWidth}px` } as CSSProperties}>
    <button className="mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="切换导航"><Menu size={20} /></button>
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="brand"><div className="brand-icon"><Layers3 size={21} /></div><div><strong>知行传播</strong><small>AI CONTENT STUDIO</small></div></div>
      <div className="workspace-label">工作空间</div><div className="workspace-card"><div className="workspace-avatar">企</div><div><strong>企业增长工作台</strong><small>本地演示空间</small></div></div>
      <div className="nav-label">创作工作区</div><nav className="side-nav" aria-label="主导航"><Link className="selected" href="/"><WandSparkles size={18} /> 多平台创作 <ChevronRight size={16} /></Link><Link href="/calendar"><CalendarDays size={18} /> 发布日历</Link><Link href="/analytics"><BarChart3 size={18} /> 传播数据看板</Link></nav>
      <div className="nav-label secondary-label">资源管理</div><nav className="side-nav"><a href="#knowledge"><BookOpen size={18} /> 企业素材库</a><a href="#reference"><FileText size={18} /> 创作指南</a></nav>
      <div className="sidebar-bottom"><div className="quota-card"><div className="quota-head"><span><Sparkles size={15} /> 企业试用额度</span><strong>{quota}/20 次</strong></div><div className="quota-track"><div style={{ width: `${quota * 5}%` }} /></div><p>生成一次，解锁各平台的双版本创意。</p></div><div className="sidebar-help"><Settings2 size={16} /> 本地演示模式</div></div>
    </aside>
    <main className="main-column"><header className="topbar"><div className="breadcrumb">工作空间 <ChevronRight size={14} /> <strong>多平台创作</strong></div><div className="topbar-right"><span className="topbar-search"><Search size={15} /> 搜索功能</span><span className="topbar-user">主</span></div></header>
      <div className="studio-content"><div className="page-intro"><div><div className="intro-kicker"><Sparkles size={15} /> AI 驱动的内容增长工作台</div><h1>让好故事，抵达每一个平台<span>✦</span></h1><p>汇集企业知识，一次创作，多平台精准转译。</p></div><div className="intro-decoration"><span>创意</span><span>策略</span><span>增长</span></div></div>
      <section className="section-card enterprise-section"><div className="section-heading"><div><span className="step">01</span><h2>选择企业案例</h2></div><p>一键载入行业背景与品牌素材</p></div><div className="enterprise-grid">{enterprises.map((item) => <button key={item.id} onClick={() => changeEnterprise(item.id)} className={`enterprise-tile ${item.id === enterpriseId ? "active" : ""}`}><span className="enterprise-symbol" style={{ backgroundColor: `${item.accent}33`, color: item.accent }}>{item.name.slice(0, 1)}</span><span><strong>{item.name}</strong><small>{item.industry}</small></span>{item.id === enterpriseId && <Check size={17} />}</button>)}</div><div className="case-note"><span className="case-dot" style={{ backgroundColor: enterprise.accent }} /> {enterprise.location} · {enterprise.tagline}</div></section>
      <section className="section-card" id="knowledge"><div className="section-heading"><div><span className="step">02</span><h2>企业素材与知识库</h2></div><button className="text-action" onClick={() => setShowMaterialForm(true)}><Plus size={16} /> 新增素材</button></div><p className="section-desc">勾选素材，AI 将从这些真实信息中提取亮点，融入创作。</p><div className="material-list">{materials.map((item) => <button className={`material-item ${selectedIds.includes(item.id) ? "checked" : ""}`} key={item.id} onClick={() => { setSelectedIds((current) => current.includes(item.id) ? current.filter((value) => value !== item.id) : [...current, item.id]); setCreativeBrief(null); }}><span className="check-box">{selectedIds.includes(item.id) && <Check size={13} />}</span><span className={`material-kind ${item.type}`}>{typeLabels[item.type]}</span><span className="material-copy"><strong>{item.title}</strong><small>{item.content}</small></span></button>)}</div><div className="selected-foot">已选 <strong>{selectedIds.length}</strong> 项素材，将作为生成背景知识</div></section>
      <section className="section-card create-section"><div className="section-heading"><div><span className="step">03</span><h2>设置本次宣发任务</h2></div><button className={`ai-badge engine-trigger ${showEnginePanel ? "active" : ""}`} type="button" onClick={() => setShowEnginePanel((value) => !value)} aria-expanded={showEnginePanel}><Sparkles size={14} /> 智能转译引擎 · {TRANSLATION_MODE_LABELS[translationMode].name}<ChevronRight size={13} /></button></div>{showEnginePanel && <div className="engine-panel"><div className="engine-panel-heading"><div><strong>选择转译思路</strong><p>不是润色原句，而是先找到值得讲的故事，再写成自然的平台文案。</p></div><span>已启用</span></div><div className="engine-mode-grid">{(["story", "seed", "brand"] as TranslationMode[]).map((mode) => <button type="button" key={mode} className={translationMode === mode ? "active" : ""} onClick={() => { setTranslationMode(mode); setCreativeBrief(null); }}><span>{translationMode === mode && <Check size={12} />}</span><strong>{TRANSLATION_MODE_LABELS[mode].name}</strong><small>{TRANSLATION_MODE_LABELS[mode].description}</small></button>)}</div><button className="translate-idea-button" type="button" onClick={translateIdea} disabled={isTranslating}><Sparkles size={14} /> {isTranslating ? "正在生成思路…" : creativeBrief ? "重新生成文案思路" : "生成文案思路"}</button>{creativeBrief && <div className="creative-brief" aria-live="polite"><div><span>目标受众</span><strong>{creativeBrief.audience}</strong></div><div><span>故事切口</span><strong>{creativeBrief.storyAngle}</strong></div><div><span>开场钩子</span><strong>{creativeBrief.hook}</strong></div><div className="brief-arc"><span>叙事节奏</span><ol>{creativeBrief.storyArc.map((item) => <li key={item}>{item}</li>)}</ol></div></div>}</div>}<label className="field-label" htmlFor="goal">核心宣发诉求 <span>*</span></label><textarea id="goal" value={goal} onChange={(event) => { setGoal(event.target.value); setCreativeBrief(null); }} placeholder="例如：新品上市早鸟特惠，主打年轻白领送礼场景；希望突出产地故事和品质感……" /><div className="field-meta"><span>清晰描述目标、受众与卖点，效果更好</span><span>{goal.length} 字</span></div><div className="form-divider" /><div className="platform-field-heading"><div className="field-label">目标平台 <small>支持多选 · 海外平台自动生成原生英文文案</small></div><button className={`select-all-button ${allPlatformsSelected ? "active" : ""}`} type="button" onClick={() => setPlatforms(allPlatformsSelected ? [] : [...PLATFORMS])} aria-pressed={allPlatformsSelected}><span className="select-all-check">{allPlatformsSelected && <Check size={12} />}</span>{allPlatformsSelected ? "取消全选" : "全选"}</button></div><div className="platform-choices">{PLATFORMS.map((platform) => <button key={platform} className={platforms.includes(platform) ? "active" : ""} onClick={() => setPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform])}><span className={`platform-mark ${platform}`}>{platformMarks[platform]}</span><span><strong>{PLATFORM_LABELS[platform]}</strong><small>{platformDescriptions[platform]}</small></span><span className="choice-check">{platforms.includes(platform) && <Check size={12} />}</span></button>)}</div><div className="field-label tone-label">表达语调</div><div className="tone-choices">{tones.map((item) => <button key={item} className={tone === item ? "active" : ""} onClick={() => { setTone(item); setCreativeBrief(null); }}>{item}</button>)}</div><div className="generate-row"><div><strong>智能转译 + A/B 双版本创作</strong><p>先提炼故事切口，再为每个平台生成两种自然表达</p></div><Button className="generate-button" onClick={generate} disabled={isGenerating || isTranslating}><WandSparkles size={18} /> {isGenerating ? "生成中…" : "一键生成内容"} <ChevronRight size={17} /></Button></div>{notice && <p className="studio-notice" role="status">{notice}</p>}</section>
      <div className="bottom-tip" id="reference"><Copy size={17} /> 创作建议：先选择 2–3 项最相关素材，再简要说明推广场景与目标受众。</div></div>
    </main>
    <PreviewPanel enterprise={enterprise} result={result} activePlatform={activePlatform} activeVersion={activeVersion} previewWidth={previewWidth} onPlatformChange={setActivePlatform} onVersionChange={setActiveVersion} onPreviewWidthChange={changePreviewWidth} onSchedule={schedule} />
    {showMaterialForm && <div className="modal-backdrop" role="presentation" onClick={() => setShowMaterialForm(false)}><div className="material-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">KNOWLEDGE BASE</span><h2 id="modal-title">新增企业素材</h2></div><button onClick={() => setShowMaterialForm(false)} aria-label="关闭"><X size={20} /></button></div><label>素材类型<select value={draftMaterial.type} onChange={(event) => setDraftMaterial({ ...draftMaterial, type: event.target.value as MaterialType })}><option value="product">产品参数</option><option value="story">品牌故事</option><option value="reference">参考文案</option></select></label><label>素材标题<input value={draftMaterial.title} onChange={(event) => setDraftMaterial({ ...draftMaterial, title: event.target.value })} placeholder="例如：2026 春季新品卖点" /></label><label>素材内容<textarea value={draftMaterial.content} onChange={(event) => setDraftMaterial({ ...draftMaterial, content: event.target.value })} placeholder="填写可供 AI 引用的真实信息" /></label><div className="modal-actions"><button onClick={() => setShowMaterialForm(false)}>取消</button><button onClick={addMaterial} disabled={!draftMaterial.title.trim() || !draftMaterial.content.trim()}>保存素材</button></div></div></div>}
  </div>;
}
