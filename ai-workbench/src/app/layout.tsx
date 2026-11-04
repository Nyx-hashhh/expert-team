import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "知行传播 · AI 多平台传播工作台",
  description: "面向中小企业的轻量级 AI 智能多平台传播工作台",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
