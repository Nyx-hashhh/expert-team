"use client";

import { BookOpen, Check, ChevronRight, Menu, Pencil, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import enterprisesData from "@/data/enterprises.json";
import type { Enterprise, Material, MaterialType } from "@/contracts/content";
import { WorkspaceSidebar } from "@/features/studio/WorkspaceSidebar";
import { MATERIAL_OVERRIDES_STORAGE_KEY, mergeMaterials, type MaterialOverrides } from "@/lib/material-library";
import { readLocal, writeLocal } from "@/lib/storage";

const enterprises = enterprisesData as Enterprise[];
const isDevelopment = process.env.NODE_ENV === "development";
const typeLabels: Record<MaterialType, string> = { product: "产品参数", story: "故事背景", reference: "爆款参考" };

const emptyDraft = { id: "", type: "product" as MaterialType, title: "", content: "" };

export function MaterialLibraryView() {
  const [customEnterprises, setCustomEnterprises] = useState<Enterprise[]>([]);
  const [customMaterials, setCustomMaterials] = useState<Record<string, Material[]>>({});
  const [materialOverrides, setMaterialOverrides] = useState<MaterialOverrides>({});
  const [enterpriseId, setEnterpriseId] = useState(enterprises[0].id);
  const [draft, setDraft] = useState(emptyDraft);
  const [showEditor, setShowEditor] = useState(false);
  const [notice, setNotice] = useState("");
  const [quota, setQuota] = useState(20);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allEnterprises = [...enterprises, ...customEnterprises];
  const enterprise = allEnterprises.find((item) => item.id === enterpriseId) ?? allEnterprises[0];
  const materials = mergeMaterials(enterprise.materials, customMaterials[enterprise.id] ?? [], materialOverrides[enterprise.id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const storedEnterprises = readLocal<Enterprise[]>("custom-enterprises", []);
      const requestedEnterpriseId = new URLSearchParams(window.location.search).get("enterprise");
      setCustomEnterprises(storedEnterprises);
      setCustomMaterials(readLocal<Record<string, Material[]>>("materials", {}));
      setMaterialOverrides(readLocal<MaterialOverrides>(MATERIAL_OVERRIDES_STORAGE_KEY, {}));
      setQuota(readLocal("quota-v2", 20));
      if (requestedEnterpriseId && [...enterprises, ...storedEnterprises].some((item) => item.id === requestedEnterpriseId)) setEnterpriseId(requestedEnterpriseId);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function changeEnterprise(id: string) {
    setEnterpriseId(id);
    setNotice("");
  }

  function openEditor(material: Material) {
    setDraft({ ...material });
    setShowEditor(true);
    setNotice("");
  }

  function closeEditor() {
    setShowEditor(false);
    setDraft(emptyDraft);
  }

  function saveMaterial() {
    const title = draft.title.trim();
    const content = draft.content.trim();
    if (!draft.id || !title || !content) return;
    const updated: Material = { id: draft.id, type: draft.type, title, content };
    const next: MaterialOverrides = {
      ...materialOverrides,
      [enterprise.id]: { ...(materialOverrides[enterprise.id] ?? {}), [updated.id]: updated },
    };
    setMaterialOverrides(next);
    writeLocal(MATERIAL_OVERRIDES_STORAGE_KEY, next);
    closeEditor();
    setNotice(`“${updated.title}”已保存，返回多平台创作后会使用最新内容。`);
  }

  return <div className="library-shell">
    <button className="mobile-menu" onClick={() => setSidebarOpen((value) => !value)} aria-label="切换导航"><Menu size={20} /></button>
    <WorkspaceSidebar active="materials" enterpriseId={enterprise.id} isDevelopment={isDevelopment} open={sidebarOpen} quota={quota} />
    <main className="main-column">
      <header className="topbar"><div className="breadcrumb">工作空间 <ChevronRight size={14} /> <strong>企业素材库</strong></div><div className="topbar-right"><span className="topbar-search"><Search size={15} /> 搜索功能</span><span className="topbar-user">主</span></div></header>
      <div className="material-library-content">
        <div className="material-library-intro"><div><span><BookOpen size={15} /> 企业知识管理</span><h1>企业素材库</h1><p>选择企业后点击素材即可修改，保存内容会同步用于多平台创作。</p></div><a href={`/?enterprise=${encodeURIComponent(enterprise.id)}#knowledge`}>返回多平台创作 <ChevronRight size={15} /></a></div>
        <section className="library-enterprises" aria-label="选择企业">
          {allEnterprises.map((item) => <button key={item.id} className={item.id === enterprise.id ? "active" : ""} onClick={() => changeEnterprise(item.id)}><span style={{ backgroundColor: `${item.accent}33`, color: item.accent }}>{item.name.slice(0, 1)}</span><span><strong>{item.name}</strong><small>{item.industry}</small></span>{item.id === enterprise.id && <Check size={16} />}</button>)}
        </section>
        <section className="library-panel">
          <div className="library-panel-heading"><div><span className="case-dot" style={{ backgroundColor: enterprise.accent }} /><h2>{enterprise.name}的素材</h2></div><span>共 {materials.length} 条 · 点击条目编辑</span></div>
          {materials.length > 0 ? <div className="library-materials">{materials.map((item) => <button key={item.id} onClick={() => openEditor(item)}><span className={`material-kind ${item.type}`}>{typeLabels[item.type]}</span><span><strong>{item.title}</strong><small>{item.content}</small></span><Pencil size={16} /></button>)}</div> : <div className="library-empty"><BookOpen size={28} /><strong>该企业还没有素材</strong><p>请先回到多平台创作页新增素材，之后可在这里修改。</p></div>}
        </section>
        {notice && <p className="library-notice" role="status"><Check size={15} /> {notice}</p>}
      </div>
    </main>
    {showEditor && <div className="modal-backdrop" role="presentation" onClick={closeEditor}><div className="material-modal" role="dialog" aria-modal="true" aria-labelledby="edit-material-title" onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">KNOWLEDGE BASE</span><h2 id="edit-material-title">编辑企业素材</h2></div><button onClick={closeEditor} aria-label="关闭"><X size={20} /></button></div><label>素材类型<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as MaterialType })}><option value="product">产品参数</option><option value="story">故事背景</option><option value="reference">爆款参考</option></select></label><label>素材标题<input value={draft.title} maxLength={200} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label><label>素材内容<textarea value={draft.content} maxLength={5000} onChange={(event) => setDraft({ ...draft, content: event.target.value })} /></label><div className="modal-actions"><button onClick={closeEditor}>取消</button><button onClick={saveMaterial} disabled={!draft.title.trim() || !draft.content.trim()}>保存修改</button></div></div></div>}
  </div>;
}
