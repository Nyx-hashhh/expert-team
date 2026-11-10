import OpenAI from "openai";
import { Agent, fetch as undiciFetch, type RequestInit as UndiciRequestInit } from "undici";

// 本机到供应商（Cloudflare 边缘）存在间歇性连接停摆，曾把用户整轮生成全部拖死在
// UND_ERR_CONNECT_TIMEOUT：默认 10s 连接超时又叠加重试，单平台轻易烧掉 40-80s。
// 这里统一收口 LLM 上游连接：
//   1. 连接阶段 5s 快速失败，把停摆窗口内的重试机会留在总预算里；
//   2. 长保活：一旦握手成功，后续请求复用连接，绕开"新连接才卡"的停摆分布；
//   3. autoSelectFamily 快速换边，按解析出的多个地址逐个尝试（默认 250ms/地址）。
const llmAgent = new Agent({
  connect: {
    timeout: 5_000,
    autoSelectFamily: true,
    autoSelectFamilyAttemptTimeout: 400,
  },
  keepAliveTimeout: 55_000,
  keepAliveMaxTimeout: 550_000,
  connections: 32,
});

async function fetchWithAgent(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const response = await undiciFetch(input as string, { ...(init ?? {}), dispatcher: llmAgent } as UndiciRequestInit);
  return response as unknown as Response;
}

export interface LlmClientOptions {
  apiKey: string;
  baseURL?: string;
  /** 单次尝试（含连接+生成）的毫秒预算，由路由按前端中止时间倒推 */
  timeoutMs: number;
  maxRetries: number;
}

export function createLlmClient(options: LlmClientOptions): OpenAI {
  return new OpenAI({
    apiKey: options.apiKey,
    baseURL: options.baseURL || undefined,
    timeout: options.timeoutMs,
    maxRetries: options.maxRetries,
    fetch: fetchWithAgent,
  });
}
