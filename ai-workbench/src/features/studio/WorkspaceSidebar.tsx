"use client";

import { BarChart3, BookOpen, CalendarDays, ChevronRight, FileText, Layers3, Settings2, Sparkles, WandSparkles } from "lucide-react";
import Link from "next/link";

interface WorkspaceSidebarProps {
  active: "studio" | "materials";
  enterpriseId?: string;
  isDevelopment: boolean;
  open: boolean;
  quota: number;
}

export function WorkspaceSidebar({ active, enterpriseId, isDevelopment, open, quota }: WorkspaceSidebarProps) {
  const materialHref = enterpriseId ? `/materials?enterprise=${encodeURIComponent(enterpriseId)}` : "/materials";

  return <aside className={`sidebar ${open ? "open" : ""}`}>
    <div className="brand"><div className="brand-icon"><Layers3 size={21} /></div><div><strong>知行传播</strong><small>AI CONTENT STUDIO</small></div></div>
    <div className="workspace-label">工作空间</div><div className="workspace-card"><div className="workspace-avatar">企</div><div><strong>企业增长工作台</strong><small>本地演示空间</small></div></div>
    <div className="nav-label">创作工作区</div>
    <nav className="side-nav" aria-label="主导航">
      <Link className={active === "studio" ? "selected" : undefined} href="/"><WandSparkles size={18} /> 多平台创作 {active === "studio" && <ChevronRight size={16} />}</Link>
      <Link className={active === "materials" ? "selected" : undefined} href={materialHref}><BookOpen size={18} /> 企业素材库 {active === "materials" && <ChevronRight size={16} />}</Link>
      <Link href="/calendar"><CalendarDays size={18} /> 发布日历</Link>
      <Link href="/analytics"><BarChart3 size={18} /> 传播数据看板</Link>
      <Link href="/settings"><Settings2 size={18} /> 设置</Link>
    </nav>
    <div className="nav-label secondary-label">资源管理</div><nav className="side-nav"><Link href="/#reference"><FileText size={18} /> 创作指南</Link></nav>
    <div className="sidebar-bottom"><div className="quota-card"><div className="quota-head"><span><Sparkles size={15} /> {isDevelopment ? "开发验收模式" : "企业试用额度"}</span><strong>{isDevelopment ? "不限次数" : `${quota}/20 次`}</strong></div>{!isDevelopment && <div className="quota-track"><div style={{ width: `${quota * 5}%` }} /></div>}<p>{isDevelopment ? "可反复生成内容，优先核验界面。" : "生成一次，解锁各平台的双版本创意。"}</p></div><div className="sidebar-help"><Settings2 size={16} /> 本地演示模式</div></div>
  </aside>;
}
