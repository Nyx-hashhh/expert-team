"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, Heart, MessageCircle, TrendingUp } from "lucide-react";
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import metrics from "@/data/demo-metrics.json";

const trendSeries = [
  { key: "xiaohongshu", name: "小红书", color: "#85aa88" },
  { key: "weibo", name: "微博", color: "#ddb184" },
  { key: "douyin", name: "抖音", color: "#7f9ba1" },
  { key: "reddit", name: "Reddit", color: "#ff7043" },
  { key: "discord", name: "Discord", color: "#6574d9" },
  { key: "instagram", name: "IG / Facebook", color: "#6f69bd" },
  { key: "tiktok", name: "TikTok", color: "#2f3437" },
] as const;

export function AnalyticsView() {
  return (
    <main className="subpage">
      <div className="subpage-top"><Link href="/"><ArrowLeft size={16} /> 返回创作工作台</Link><span>知行传播 / 传播数据</span></div>
      <div className="subpage-heading"><div className="subpage-icon"><BarChart3 size={24} /></div><div><span className="eyebrow">PERFORMANCE OVERVIEW</span><h1>传播数据看板</h1><p>观察国内与海外多渠道内容表现，找到下一次创作的灵感。</p></div></div>
      <div className="demo-label">演示模拟数据 · 国内及海外平台 · 近 7 日</div>
      <div className="metric-grid"><div><TrendingUp size={20} /><span>累计触达</span><strong>12,840</strong><small>较上期 +18.6%</small></div><div><Heart size={20} /><span>内容互动</span><strong>4,390</strong><small>较上期 +12.3%</small></div><div><MessageCircle size={20} /><span>互动率</span><strong>34.2%</strong><small>较上期 +4.8%</small></div></div>
      <div className="chart-grid">
        <section className="chart-card trend-card"><h2>多渠道互动趋势</h2><p>近 7 日国内及海外平台互动量变化</p><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><LineChart data={metrics.trend}><CartesianGrid stroke="#edf1ec" vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke="#9aa99b" /><YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#9aa99b" /><Tooltip />{trendSeries.map((series) => <Line key={series.key} dataKey={series.key} name={series.name} stroke={series.color} strokeWidth={series.key === "xiaohongshu" || series.key === "tiktok" ? 3 : 2} dot={false} />)}</LineChart></ResponsiveContainer></div><div className="chart-legend">{trendSeries.map((series) => <span key={series.key}><i style={{ background: series.color }} />{series.name}</span>)}</div></section>
        <section className="chart-card"><h2>平台发帖占比</h2><p>国内及海外渠道内容分布</p><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={metrics.platforms} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={4}>{metrics.platforms.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div><div className="platform-stats">{metrics.platforms.map((item) => <span key={item.name}><i style={{ background: item.color }} />{item.name}<strong>{item.value}%</strong></span>)}</div></section>
      </div>
      <section className="chart-card tag-card"><h2>高频传播话题</h2><p>内容中出现频率较高的标签</p>{metrics.hashtags.map((item, index) => <div className="tag-rank" key={item.tag}><span>0{index + 1}</span><strong>{item.tag}</strong><div><i style={{ width: `${item.count}%` }} /></div><small>{item.count}</small></div>)}</section>
    </main>
  );
}
