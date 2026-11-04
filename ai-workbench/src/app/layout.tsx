import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "知行传播 · AI 多平台传播工作台",
  description: "面向中小企业的轻量级 AI 智能多平台传播工作台",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" className={cn("font-sans", geist.variable)}><body>{children}</body></html>;
}
