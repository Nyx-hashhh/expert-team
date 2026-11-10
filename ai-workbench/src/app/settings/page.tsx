"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CircleAlert, CreditCard, KeyRound, Loader2, LogOut, Plug, RefreshCcw, Trash2, UserRound } from "lucide-react";
import { authFetch, clearToken, getToken, setToken } from "@/lib/auth-client";

type TabKey = "account" | "api" | "billing" | "general";

type SettingsPayload = {
  llm: { apiKeyMasked: string; hasEnvKey: boolean; baseURL: string; model: string; generateModel: string; translateModel: string; updatedAt: string };
  active: { apiKeyMasked: string; baseURL: string; model: string };
};

type UsagePayload = {
  account: string | null; // 当前额度归属账号；null = 游客额度
  used: number;
  quota: number;
  remaining: number;
  recentLog: { time: string; kind: string; amount: number }[];
  recharges: { time: string; packId: string; amount: number }[];
  orders: OrderPayload[];
  packs: { id: string; name: string; price: string; amount: number }[];
};

type OrderPayload = {
  orderId: string;
  email: string;
  packId: string;
  packName: string;
  amount: number;
  price: string;
  status: "pending" | "paid";
  createdAt: string;
  paidAt?: string;
};

const TABS: { key: TabKey; label: string; icon: typeof UserRound }[] = [
  { key: "account", label: "账号登录", icon: UserRound },
  { key: "api", label: "API 配置", icon: KeyRound },
  { key: "billing", label: "用量与充值", icon: CreditCard },
  { key: "general", label: "通用", icon: RefreshCcw },
];

const inputClass = "w-full rounded-lg border border-[#e8ebe5] bg-white px-3 py-2 text-sm text-[#24342b] outline-none focus:border-[#7caa87]";
const labelClass = "mb-1.5 block text-sm font-medium text-[#24342b]";
const hintClass = "mt-1.5 text-xs text-[#8a9a8e]";
const btnPrimary = "inline-flex items-center gap-2 rounded-lg bg-[#3c6b4c] px-4 py-2 text-sm font-medium text-white hover:bg-[#244d35] disabled:opacity-50";
const btnGhost = "inline-flex items-center gap-2 rounded-lg border border-[#e8ebe5] bg-white px-4 py-2 text-sm font-medium text-[#24342b] hover:border-[#7caa87] disabled:opacity-50";
const cardClass = "rounded-xl border border-[#e8ebe5] bg-white p-6";

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("api");
  const [settings, setSettings] = useState<SettingsPayload | null>(null);
  const [usage, setUsage] = useState<UsagePayload | null>(null);

  // —— 账号 ——
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeCountdown, setCodeCountdown] = useState(0);
  const [sendBusy, setSendBusy] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMsg, setAuthMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // —— 发信邮箱（SMTP）——
  const [smtpUser, setSmtpUser] = useState("18654380225@163.com");
  const [smtpAuthCode, setSmtpAuthCode] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpSaved, setSmtpSaved] = useState<{ user: string; authCodeMasked: string } | null>(null);
  const [smtpBusy, setSmtpBusy] = useState(false);
  const [smtpMsg, setSmtpMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // —— API 配置 ——
  const [apiKey, setApiKey] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [model, setModel] = useState("");
  const [generateModel, setGenerateModel] = useState("");
  const [translateModel, setTranslateModel] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testBusy, setTestBusy] = useState(false);
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // —— 充值 ——
  const [rechargeBusy, setRechargeBusy] = useState("");
  const [rechargeMsg, setRechargeMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pendingOrder, setPendingOrder] = useState<OrderPayload | null>(null);
  const [payBusy, setPayBusy] = useState(false);

  const loadSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = (await res.json()) as SettingsPayload;
      setSettings(data);
      setBaseURL(data.llm.baseURL || "");
      setModel(data.llm.model || "");
      setGenerateModel(data.llm.generateModel || "");
      setTranslateModel(data.llm.translateModel || "");
      setApiKey(data.llm.apiKeyMasked || "");
    }
  }, []);

  const loadUsage = useCallback(async () => {
    const res = await authFetch("/api/usage");
    if (!res.ok) {
      // token 已失效：清掉残留登录态，回落到游客额度视图
      if (res.status === 401) { clearToken(); setUser(null); }
      return;
    }
    setUsage((await res.json()) as UsagePayload);
  }, []);

  useEffect(() => {
    loadSettings();
    loadUsage();
    // 无论是否登录都拉取一次：顺便拿发信邮箱配置状态（只含掩码）
    const token = getToken();
    fetch(`/api/auth?token=${encodeURIComponent(token ?? "")}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else if (token) clearToken();
        if (data.smtp?.user) {
          setSmtpSaved({ user: data.smtp.user, authCodeMasked: data.smtp.authCodeMasked ?? "" });
          if (data.smtp.user) setSmtpUser(data.smtp.user);
        }
      })
      .catch(() => {});
  }, [loadSettings, loadUsage]);

  // 验证码 60 秒重发倒计时
  useEffect(() => {
    if (codeCountdown <= 0) return;
    const timer = setTimeout(() => setCodeCountdown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [codeCountdown]);

  async function sendCode() {
    setSendBusy(true);
    setAuthMsg(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-code", email }),
      });
      const data = await res.json();
      if (!res.ok) { setAuthMsg({ ok: false, text: data.error ?? "发送失败" }); return; }
      setCodeCountdown(60);
      setAuthMsg({ ok: true, text: "验证码已发送，请查收邮箱（10 分钟内有效，注意垃圾箱）" });
    } catch {
      setAuthMsg({ ok: false, text: "网络异常，请重试" });
    } finally {
      setSendBusy(false);
    }
  }

  async function saveSmtp() {
    setSmtpBusy(true);
    setSmtpMsg(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-smtp", user: smtpUser, authCode: smtpAuthCode, host: smtpHost || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setSmtpMsg({ ok: false, text: data.error ?? "保存失败" }); return; }
      setSmtpSaved({ user: data.smtp.user, authCodeMasked: data.smtp.authCodeMasked });
      setSmtpAuthCode("");
      setSmtpMsg({ ok: true, text: "发信邮箱配置已保存（存于本机 .local-data，不入仓库）" });
    } catch {
      setSmtpMsg({ ok: false, text: "网络异常，请重试" });
    } finally {
      setSmtpBusy(false);
    }
  }

  async function submitAuth() {
    setAuthBusy(true);
    setAuthMsg(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: authMode, email, password, ...(authMode === "register" ? { code } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) { setAuthMsg({ ok: false, text: data.error ?? "操作失败" }); return; }
      setToken(data.token);
      setUser({ email: data.user.email });
      setAuthMsg({ ok: true, text: authMode === "register" ? "注册成功，已自动登录" : "登录成功" });
      loadUsage(); // 切到该账号的额度视图
    } catch {
      setAuthMsg({ ok: false, text: "网络异常，请重试" });
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    const token = getToken();
    if (token) await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout", token }) }).catch(() => {});
    clearToken();
    setUser(null);
    setAuthMsg(null);
    setPendingOrder(null);
    setRechargeMsg(null); // 登出后清掉上一账号的到账提示，避免误读到游客视图
    loadUsage(); // 回到游客额度
  }

  async function saveSettings() {
    setSaveBusy(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, baseURL, model, generateModel, translateModel }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveMsg({ ok: false, text: data.error ?? "保存失败" }); return; }
      setSaveMsg({ ok: true, text: `已保存，当前生效模型：${data.active.model}（密钥 ${data.active.apiKeyMasked || "未配置"}）` });
      loadSettings();
    } catch {
      setSaveMsg({ ok: false, text: "网络异常，请重试" });
    } finally {
      setSaveBusy(false);
    }
  }

  async function testConnection() {
    setTestBusy(true);
    setTestMsg(null);
    try {
      const res = await fetch("/api/settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, baseURL, model }),
      });
      const data = await res.json();
      if (data.ok) setTestMsg({ ok: true, text: `连接成功 · 模型 ${data.model} · 耗时 ${data.latencyMs}ms` });
      else setTestMsg({ ok: false, text: data.error ?? "连接失败" });
    } catch {
      setTestMsg({ ok: false, text: "网络异常，请重试" });
    } finally {
      setTestBusy(false);
    }
  }

  // 第一步：创建待支付订单（要求已登录，额度计入当前账号）
  async function startRecharge(packId: string) {
    setRechargeBusy(packId);
    setRechargeMsg(null);
    try {
      const res = await authFetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-order", packId }),
      });
      const data = await res.json();
      if (!res.ok) { setRechargeMsg({ ok: false, text: data.error ?? "创建订单失败" }); return; }
      setPendingOrder(data.order as OrderPayload);
    } catch {
      setRechargeMsg({ ok: false, text: "网络异常，请重试" });
    } finally {
      setRechargeBusy("");
    }
  }

  // 第二步：确认模拟支付后才真正到账
  async function confirmMockPay() {
    if (!pendingOrder) return;
    setPayBusy(true);
    try {
      const res = await authFetch("/api/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mock-pay", orderId: pendingOrder.orderId }),
      });
      const data = await res.json();
      if (!res.ok) { setRechargeMsg({ ok: false, text: data.error ?? "模拟支付失败" }); return; }
      setRechargeMsg({ ok: true, text: data.message });
      setPendingOrder(null);
      loadUsage();
    } catch {
      setRechargeMsg({ ok: false, text: "网络异常，请重试" });
    } finally {
      setPayBusy(false);
    }
  }

  function clearLocalCache() {
    const removed: string[] = [];
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const key = window.localStorage.key(i);
      if (key?.startsWith("传播工作台:v1:") && key !== "传播工作台:v1:auth-token") {
        window.localStorage.removeItem(key);
        removed.push(key);
      }
    }
    window.alert(`已清理 ${removed.length} 项本地演示数据（草稿、偏好等）。`);
  }

  const usedPct = usage ? Math.min(Math.round((usage.used / Math.max(usage.quota, 1)) * 100), 100) : 0;

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-[#fafbf8] px-6 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[#3c6b4c] hover:underline"><ArrowLeft size={16} /> 返回工作台</Link>
          <h1 className="text-xl font-semibold text-[#24342b]">知行传播 · 设置</h1>
        </div>
        {user && <span className="text-sm text-[#8a9a8e]">已登录：{user.email}</span>}
      </header>

      <nav className="mb-6 flex gap-2 rounded-xl border border-[#e8ebe5] bg-white p-1.5" aria-label="设置分区">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === key ? "bg-[#3c6b4c] text-white" : "text-[#24342b] hover:bg-[#f7f8f5]"}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </nav>

      {tab === "account" && (
        <section className={cardClass}>
          <h2 className="mb-4 text-base font-semibold text-[#24342b]">账号</h2>
          {user ? (
            <div className="flex items-center justify-between rounded-lg border border-[#e8ebe5] bg-[#f7f8f5] px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-[#24342b]"><BadgeCheck size={17} className="text-[#3c6b4c]" /> {user.email}</div>
              <button onClick={logout} className={btnGhost}><LogOut size={15} /> 退出登录</button>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex gap-2 text-sm">
                <button onClick={() => setAuthMode("register")} className={`rounded-lg px-3 py-1.5 font-medium ${authMode === "register" ? "bg-[#3c6b4c] text-white" : "border border-[#e8ebe5] text-[#24342b]"}`}>邮箱注册</button>
                <button onClick={() => setAuthMode("login")} className={`rounded-lg px-3 py-1.5 font-medium ${authMode === "login" ? "bg-[#3c6b4c] text-white" : "border border-[#e8ebe5] text-[#24342b]"}`}>登录</button>
              </div>
              <div className="mb-3">
                <label className={labelClass}>邮箱</label>
                <div className="flex gap-2">
                  <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  {authMode === "register" && (
                    <button onClick={sendCode} disabled={sendBusy || !email || codeCountdown > 0} className={btnGhost + " shrink-0 whitespace-nowrap"}>
                      {sendBusy ? <Loader2 size={15} className="animate-spin" /> : null}
                      {codeCountdown > 0 ? `${codeCountdown}s 后可重发` : "发送验证码"}
                    </button>
                  )}
                </div>
              </div>
              {authMode === "register" && (
                <div className="mb-3"><label className={labelClass}>邮箱验证码</label><input className={inputClass} inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="6 位数字，请查收邮件" /></div>
              )}
              <div className="mb-3"><label className={labelClass}>密码</label><input className={inputClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少 6 位" /></div>
              <button onClick={submitAuth} disabled={authBusy || !email || password.length < 6 || (authMode === "register" && code.length !== 6)} className={btnPrimary}>{authBusy ? <Loader2 size={15} className="animate-spin" /> : null}{authMode === "register" ? "注册并登录" : "登录"}</button>
              <p className={hintClass}>注册分两步：先点「发送验证码」查收邮件，再填验证码与密码完成注册。验证码 10 分钟内有效，1 分钟内不可重发。</p>
              <details className="mt-5 rounded-lg border border-[#e8ebe5] p-3">
                <summary className="cursor-pointer text-sm font-medium text-[#24342b]">发信邮箱配置（SMTP，管理员填写一次）</summary>
                <p className="mt-2 text-xs text-[#8a9a8e]">用于给注册用户发验证码。填 163 / QQ 邮箱后台生成的 SMTP「授权码」（不是登录密码），保存后存于本机 .local-data，不会写入仓库。163 邮箱路径：网页版设置 → POP3/SMTP/IMAP → 开启 SMTP 服务 → 新增授权码。</p>
                <div className="mt-3"><label className={labelClass}>发信邮箱</label><input className={inputClass} type="email" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="18654380225@163.com" /></div>
                <div className="mb-1 mt-3"><label className={labelClass}>SMTP 授权码</label><input className={inputClass} type="password" value={smtpAuthCode} onChange={(e) => setSmtpAuthCode(e.target.value)} placeholder={smtpSaved ? `已保存（${smtpSaved.authCodeMasked}），留空则不修改` : "邮箱后台生成的授权码"} /></div>
                <div className="mt-2"><label className={labelClass}>SMTP 服务器（可选，留空按邮箱后缀自动判断）</label><input className={inputClass} value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.163.com" /></div>
                <button onClick={saveSmtp} disabled={smtpBusy || !smtpUser || !smtpAuthCode} className={btnPrimary + " mt-3"}>{smtpBusy ? <Loader2 size={15} className="animate-spin" /> : null}保存发信配置</button>
                {smtpMsg && <p className={`mt-2 text-sm ${smtpMsg.ok ? "text-[#3c6b4c]" : "text-[#c0392b]"}`}>{smtpMsg.text}</p>}
                {smtpSaved && !smtpMsg && <p className="mt-2 text-xs text-[#8a9a8e]">当前发信邮箱：{smtpSaved.user}（授权码 {smtpSaved.authCodeMasked || "未配置"}）</p>}
              </details>
            </div>
          )}
          {authMsg && <p className={`mt-3 text-sm ${authMsg.ok ? "text-[#3c6b4c]" : "text-[#c0392b]"}`}>{authMsg.text}</p>}
        </section>
      )}

      {tab === "api" && (
        <section className={cardClass}>
          <h2 className="mb-1 text-base font-semibold text-[#24342b]">API 密钥与大模型配置</h2>
          <p className="mb-4 text-xs text-[#8a9a8e]">配置保存在本机 .local-data/ 中（不入 Git）。未填写时仍会回退读取 .env.local，老配置不受影响。</p>
          <div className="mb-3"><label className={labelClass}>API 密钥</label><input className={inputClass} type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-…" /></div>
          <div className="mb-3"><label className={labelClass}>Base URL（留空使用供应商默认）</label><input className={inputClass} value={baseURL} onChange={(e) => setBaseURL(e.target.value)} placeholder="https://api.deepseek.com/v1" /></div>
          <div className="mb-3"><label className={labelClass}>默认模型</label><input className={inputClass} value={model} onChange={(e) => setModel(e.target.value)} placeholder="deepseek-chat" /></div>
          <details className="mb-3 rounded-lg border border-[#e8ebe5] p-3">
            <summary className="cursor-pointer text-sm font-medium text-[#24342b]">高级：按功能覆盖模型（可选）</summary>
            <div className="mt-3"><label className={labelClass}>文案生成模型</label><input className={inputClass} value={generateModel} onChange={(e) => setGenerateModel(e.target.value)} placeholder="留空沿用默认模型" /></div>
            <div className="mt-3"><label className={labelClass}>智能转译模型</label><input className={inputClass} value={translateModel} onChange={(e) => setTranslateModel(e.target.value)} placeholder="留空沿用默认模型" /></div>
          </details>
          <div className="flex flex-wrap gap-2">
            <button onClick={saveSettings} disabled={saveBusy} className={btnPrimary}>{saveBusy ? <Loader2 size={15} className="animate-spin" /> : null}保存设置</button>
            <button onClick={testConnection} disabled={testBusy} className={btnGhost}>{testBusy ? <Loader2 size={15} className="animate-spin" /> : <Plug size={15} />}测试连接</button>
          </div>
          {saveMsg && <p className={`mt-3 text-sm ${saveMsg.ok ? "text-[#3c6b4c]" : "text-[#c0392b]"}`}>{saveMsg.text}</p>}
          {testMsg && <p className={`mt-1.5 text-sm ${testMsg.ok ? "text-[#3c6b4c]" : "text-[#c0392b]"}`}>{testMsg.text}</p>}
          {settings && <p className={hintClass}>当前生效：密钥 {settings.active.apiKeyMasked || "未配置"} · 模型 {settings.active.model}{settings.llm.updatedAt ? ` · 上次保存 ${new Date(settings.llm.updatedAt).toLocaleString("zh-CN")}` : ""}</p>}
        </section>
      )}

      {tab === "billing" && usage && (
        <section className={cardClass}>
          <h2 className="mb-4 text-base font-semibold text-[#24342b]">用量与充值</h2>
          <div className={`mb-4 flex items-start gap-2 rounded-lg border px-4 py-2.5 text-sm ${user ? "border-[#cfe3d4] bg-[#f2f8f3] text-[#24342b]" : "border-[#e8ebe5] bg-[#f7f8f5] text-[#8a9a8e]"}`}>
            <BadgeCheck size={16} className={`mt-0.5 shrink-0 ${user ? "text-[#3c6b4c]" : "text-[#b7c2b9]"}`} />
            {user ? (
              <span>当前账号 <strong>{user.email}</strong>，用量与充值均计入该账号。</span>
            ) : (
              <span>当前使用游客额度（全站共享的体验次数）。登录账号后，充值将计入你的账号，<button onClick={() => setTab("account")} className="text-[#3c6b4c] hover:underline">去登录 →</button></span>
            )}
          </div>
          <div className="mb-2 flex items-baseline justify-between text-sm text-[#24342b]">
            <span>已使用 <strong>{usage.used}</strong> / {usage.quota} 次</span>
            <span className="text-[#8a9a8e]">剩余 {usage.remaining} 次</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#f7f8f5]"><div className="h-full rounded-full bg-[#3c6b4c]" style={{ width: `${usedPct}%` }} /></div>
          {usage.remaining <= 3 && <p className="mt-2 flex items-center gap-1.5 text-xs text-[#c0392b]"><CircleAlert size={14} /> {user ? "次数即将用尽，生成将被限制，请及时充值。" : "游客次数即将用尽，生成将被限制；登录后可充值获取更多次数。"}</p>}
          <h3 className="mb-3 mt-6 text-sm font-semibold text-[#24342b]">充值套餐</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {usage.packs.map((pack) => (
              <div key={pack.id} className="rounded-lg border border-[#e8ebe5] p-4">
                <div className="text-sm font-semibold text-[#24342b]">{pack.name}</div>
                <div className="my-1 text-xl font-bold text-[#3c6b4c]">{pack.price}</div>
                <div className="mb-3 text-xs text-[#8a9a8e]">{pack.amount} 次生成额度</div>
                <button onClick={() => startRecharge(pack.id)} disabled={rechargeBusy === pack.id || !user || !!pendingOrder} className={btnPrimary + " w-full justify-center"}>{rechargeBusy === pack.id ? <Loader2 size={15} className="animate-spin" /> : null}{user ? "立即充值" : "登录后可充值"}</button>
              </div>
            ))}
          </div>
          {pendingOrder && (
            <div className="mt-4 rounded-lg border border-[#cfe3d4] bg-[#f2f8f3] p-4">
              <div className="text-sm font-semibold text-[#24342b]">待支付订单：{pendingOrder.orderId}</div>
              <p className="mt-1 text-xs text-[#8a9a8e]">{pendingOrder.packName} · {pendingOrder.price} · 充值 {pendingOrder.amount} 次 → 计入 {pendingOrder.email}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={confirmMockPay} disabled={payBusy} className={btnPrimary}>{payBusy ? <Loader2 size={15} className="animate-spin" /> : null}模拟支付（演示）</button>
                <button onClick={() => setPendingOrder(null)} disabled={payBusy} className={btnGhost}>取消</button>
              </div>
            </div>
          )}
          {rechargeMsg && <p className={`mt-3 text-sm ${rechargeMsg.ok ? "text-[#3c6b4c]" : "text-[#c0392b]"}`}>{rechargeMsg.text}</p>}
          <p className={hintClass}>演示流程：点「立即充值」生成待支付订单，点「模拟支付」后到账（未接真实支付；正式版将接入微信支付）。额度计入当前登录账号。</p>
          {usage.recentLog.length > 0 && (
            <>
              <h3 className="mb-2 mt-6 text-sm font-semibold text-[#24342b]">最近消耗记录</h3>
              <ul className="space-y-1 text-xs text-[#8a9a8e]">
                {usage.recentLog.map((item, index) => (
                  <li key={index}>{new Date(item.time).toLocaleString("zh-CN")} · {item.kind === "generate" ? "多平台生成" : "智能转译"} · 用 {item.amount} 次</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {tab === "general" && (
        <section className={cardClass}>
          <h2 className="mb-4 text-base font-semibold text-[#24342b]">通用</h2>
          <div className="rounded-lg border border-[#e8ebe5] p-4 text-sm text-[#24342b]">
            <div className="font-medium">知行传播 · AI 多平台传播工作台</div>
            <p className="mt-1 text-xs text-[#8a9a8e]">面向中小企业的轻量级 AI 智能多平台传播工作台 · 本地演示版</p>
          </div>
          <h3 className="mb-2 mt-6 text-sm font-semibold text-[#24342b]">本地数据</h3>
          <p className={hintClass}>草稿、素材与偏好保存在浏览器 localStorage；API 密钥与用量保存在服务端 .local-data/。清理后需重新填写配置。</p>
          <button onClick={clearLocalCache} className={btnGhost + " mt-3"}><Trash2 size={15} /> 清理本地演示数据</button>
        </section>
      )}
    </div>
  );
}
