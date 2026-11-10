// 前端登录态小工具：统一管理 token 的存取与带凭证请求。
// token 仍存 localStorage（key 沿用历史值，老用户无感），但集中在这里避免散落裸写。

const TOKEN_KEY = "传播工作台:v1:auth-token";

export function getToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

// 带 x-auth-token 头的 fetch：generate/translate/usage 等需要按账号计费的请求都用它
export function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("x-auth-token", token);
  return fetch(url, { ...init, headers });
}
