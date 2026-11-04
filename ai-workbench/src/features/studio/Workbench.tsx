"use client";

import { BarChart3, BookOpen, CalendarDays, Check, ChevronRight, Copy, FileText, Layers3, Menu, Plus, Search, Settings2, Sparkles, WandSparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import enterprisesData from "@/data/enterprises.json";
import { buildFallback } from "@/data/fallback";
import { CONTRACT_VERSION, PLATFORM_LABELS, PLATFORMS, type Enterprise, type GenerateRequest, type GenerateResult, type Material, type MaterialType, type Platform, type ScheduleItem, type Version } from "@/contracts/content";
import { readLocal, writeLocal } from "@/lib/storage";
import { PreviewPanel } from "@/features/preview/PreviewPanel";
import { Button } from "@/components/ui/button";

const enterprises = enterprisesData as Enterprise[];
const typeLabels: Record<MaterialType, string> = { product: "产品参数", story: "品牌故事", reference: "参考文案" };
const tones = ["闺蜜安利", "专业品鉴", "年轻活力", "温暖叙事"];

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
  const [quota, setQuota] = useState(17);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [draftMaterial, setDraftMaterial] = useState({ type: "product" as MaterialType, title: "", content: "" });
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const enterprise = enterprises.find((item) => item.id === enterpriseId) ?? enterprises[0];
  const materials = [...enterprise.materials, ...(customMaterials[enterprise.id] ?? [])];

  useEffect(() => {
    const timeout = setTimeout(() => { setCustomMaterials(readLocal("materials", {})); setQuota(readLocal("quota", 17)); }, 0);
    return () => clearTimeout(timeout);
  }, []);

  function changeEnterprise(id: string) {
    const next = enterprises.find((item) => item.id === id) ?? enterprises[0];
    setEnterpriseId(next.id);
    setSelectedIds([...next.materials.map((item) => item.id), ...(customMaterials[next.id] ?? []).map((item) => item.id)]);
    setResult(null);
    setNotice("");
  }

  function addMaterial() {
    if (!draftMaterial.title.trim() || !draftMaterial.content.trim()) return;
    const item: Material = { id: crypto.randomUUID(), type: draftMaterial.type, title: draftMaterial.title.trim(), content: draftMaterial.content.trim() };
    const next = { ...customMaterials, [enterprise.id]: [...(customMaterials[enterprise.id] ?? []), item] };
    setCustomMaterials(next); writeLocal("materials", next);
    setSelectedIds((current) => [...current, item.id]);
    setDraftMaterial({ type: "product", title: "", content: "" }); setShowMaterialForm(false);
    setNotice("素材已保存到本机");
  }

  async function generate() {
    if (isGenerating) return;
    if (!goal.trim()) { setNotice("请先填写本次宣发诉求"); return; }
    if (!platforms.length) { setNotice("请至少选择一个目标平台"); return; }
    if (quota <= 0) { setNotice("试用额度已用完"); return; }
    const request: GenerateRequest = { contractVersion: CONTRACT_VERSION, enterpriseId, selectedMaterialIds: selectedIds, goal: goal.trim(), platforms, tone };
    setIsGenerating(true); setNotice("正在准备各平台 A/B 文案…");
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
    setQuota(quota - 1); writeLocal("quota", quota - 1);
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

  return <div className="app-shell">
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
      <section className="section-card" id="knowledge"><div className="section-heading"><div><span className="step">02</span><h2>企业素材与知识库</h2></div><button className="text-action" onClick={() => setShowMaterialForm(true)}><Plus size={16} /> 新增素材</button></div><p className="section-desc">勾选素材，AI 将从这些真实信息中提取亮点，融入创作。</p><div className="material-list">{materials.map((item) => <button className={`material-item ${selectedIds.includes(item.id) ? "checked" : ""}`} key={item.id} onClick={() => setSelectedIds((current) => current.includes(item.id) ? current.filter((value) => value !== item.id) : [...current, item.id])}><span className="check-box">{selectedIds.includes(item.id) && <Check size={13} />}</span><span className={`material-kind ${item.type}`}>{typeLabels[item.type]}</span><span className="material-copy"><strong>{item.title}</strong><small>{item.content}</small></span></button>)}</div><div className="selected-foot">已选 <strong>{selectedIds.length}</strong> 项素材，将作为生成背景知识</div></section>
      <section className="section-card create-section"><div className="section-heading"><div><span className="step">03</span><h2>设置本次宣发任务</h2></div><span className="ai-badge"><Sparkles size={14} /> 智能转译引擎</span></div><label className="field-label" htmlFor="goal">核心宣发诉求 <span>*</span></label><textarea id="goal" value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="例如：新品上市早鸟特惠，主打年轻白领送礼场景；希望突出产地故事和品质感……" /><div className="field-meta"><span>清晰描述目标、受众与卖点，效果更好</span><span>{goal.length} 字</span></div><div className="form-divider" /><div className="field-label">目标平台 <small>支持多选</small></div><div className="platform-choices">{PLATFORMS.map((platform) => <button key={platform} className={platforms.includes(platform) ? "active" : ""} onClick={() => setPlatforms((current) => current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform])}><span className={`platform-mark ${platform}`}>{platform === "xiaohongshu" ? "小" : platform === "weibo" ? "微" : "抖"}</span><span><strong>{PLATFORM_LABELS[platform]}</strong><small>{platform === "xiaohongshu" ? "生活化种草" : platform === "weibo" ? "短平快快讯" : "黄金 3 秒口播"}</small></span><span className="choice-check">{platforms.includes(platform) && <Check size={12} />}</span></button>)}</div><div className="field-label tone-label">表达语调</div><div className="tone-choices">{tones.map((item) => <button key={item} className={tone === item ? "active" : ""} onClick={() => setTone(item)}>{item}</button>)}</div><div className="generate-row"><div><strong>A/B 双版本创作</strong><p>每个平台生成两种切入点，并提取话题标签</p></div><Button className="generate-button" onClick={generate} disabled={isGenerating}><WandSparkles size={18} /> {isGenerating ? "生成中…" : "一键生成内容"} <ChevronRight size={17} /></Button></div>{notice && <p className="studio-notice" role="status">{notice}</p>}</section>
      <div className="bottom-tip" id="reference"><Copy size={17} /> 创作建议：先选择 2–3 项最相关素材，再简要说明推广场景与目标受众。</div></div>
    </main>
    <PreviewPanel enterprise={enterprise} result={result} activePlatform={activePlatform} activeVersion={activeVersion} onPlatformChange={setActivePlatform} onVersionChange={setActiveVersion} onSchedule={schedule} />
    {showMaterialForm && <div className="modal-backdrop" role="presentation" onClick={() => setShowMaterialForm(false)}><div className="material-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">KNOWLEDGE BASE</span><h2 id="modal-title">新增企业素材</h2></div><button onClick={() => setShowMaterialForm(false)} aria-label="关闭"><X size={20} /></button></div><label>素材类型<select value={draftMaterial.type} onChange={(event) => setDraftMaterial({ ...draftMaterial, type: event.target.value as MaterialType })}><option value="product">产品参数</option><option value="story">品牌故事</option><option value="reference">参考文案</option></select></label><label>素材标题<input value={draftMaterial.title} onChange={(event) => setDraftMaterial({ ...draftMaterial, title: event.target.value })} placeholder="例如：2026 春季新品卖点" /></label><label>素材内容<textarea value={draftMaterial.content} onChange={(event) => setDraftMaterial({ ...draftMaterial, content: event.target.value })} placeholder="填写可供 AI 引用的真实信息" /></label><div className="modal-actions"><button onClick={() => setShowMaterialForm(false)}>取消</button><button onClick={addMaterial} disabled={!draftMaterial.title.trim() || !draftMaterial.content.trim()}>保存素材</button></div></div></div>}
  </div>;
}
