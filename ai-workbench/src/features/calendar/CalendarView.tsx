"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PLATFORM_LABELS, type ScheduleItem, type ScheduleStatus } from "@/contracts/content";
import { readLocal, writeLocal } from "@/lib/storage";
import { findScheduleTimeZone, formatScheduleInZone } from "@/lib/schedule-timezones";

const statuses: ScheduleStatus[] = ["draft", "review", "scheduled", "published_mock"];
const labels: Record<ScheduleStatus, string> = { draft: "草稿", review: "待审核", scheduled: "已排期", published_mock: "模拟已发布" };

function displaySchedule(item: ScheduleItem) {
  if (item.timeZone && findScheduleTimeZone(item.timeZone)) {
    const date = formatScheduleInZone(item.scheduledAt, item.timeZone);
    const zone = findScheduleTimeZone(item.timeZone)!;
    return { ...date, zone: `${zone.country} · ${zone.label}` };
  }
  const date = new Date(item.scheduledAt);
  return { day: date.getDate(), month: date.toLocaleDateString("zh-CN", { month: "short" }), dateTime: date.toLocaleString("zh-CN", { hour12: false }), zone: "本地时间" };
}

export function CalendarView() {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  useEffect(() => {
    const timeout = setTimeout(() => setItems(readLocal("schedule", [])), 0);
    return () => clearTimeout(timeout);
  }, []);
  function advance(id: string) {
    const next = items.map((item) => item.id !== id ? item : { ...item, status: statuses[Math.min(statuses.indexOf(item.status) + 1, statuses.length - 1)] });
    setItems(next); writeLocal("schedule", next);
  }
  return <main className="subpage"><div className="subpage-top"><Link href="/"><ArrowLeft size={16} /> 返回创作工作台</Link><span>知行传播 / 发布日历</span></div><div className="subpage-heading"><div className="subpage-icon"><CalendarDays size={24} /></div><div><span className="eyebrow">CONTENT CALENDAR</span><h1>多端发布日历</h1><p>从创作草稿到模拟发布，管理每一条内容的进度。</p></div></div><div className="schedule-summary">{statuses.map((status) => <div key={status}><strong>{items.filter((item) => item.status === status).length}</strong><span>{labels[status]}</span></div>)}</div><section className="schedule-list"><h2>排期任务 <small>共 {items.length} 条</small></h2>{items.length ? items.map((item) => { const display = displaySchedule(item); return <article className="schedule-item" key={item.id}><div className="schedule-date"><strong>{display.day}</strong><small>{display.month}</small></div><div className="schedule-body"><span className="schedule-platform">{PLATFORM_LABELS[item.platform]} · 版本 {item.version} · {display.zone} · {display.dateTime}</span><h3>{item.content.title}</h3><p>{item.content.body}</p></div><button onClick={() => advance(item.id)} disabled={item.status === "published_mock"}>{labels[item.status]} {item.status !== "published_mock" && <ChevronRight size={14} />}</button></article>; }) : <div className="schedule-empty">暂无排期任务。先在工作台生成文案，再点击“推送日历”。</div>}</section></main>;
}
