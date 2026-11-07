export interface ScheduleTimeZone {
  id: string;
  country: string;
  countryEn: string;
  city: string;
  cityEn: string;
  label: string;
}

export const DEFAULT_TIME_ZONE = "Asia/Shanghai";
export const INITIAL_FAVORITE_TIME_ZONES = ["Asia/Shanghai", "America/New_York", "Europe/London"];
export const RECOMMENDED_TIME_ZONES = ["Asia/Shanghai", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Singapore", "Asia/Tokyo"];

export const SCHEDULE_TIME_ZONES: ScheduleTimeZone[] = [
  { id: "Australia/Sydney", country: "澳大利亚", countryEn: "Australia", city: "悉尼", cityEn: "Sydney", label: "悉尼时间" },
  { id: "America/Sao_Paulo", country: "巴西", countryEn: "Brazil", city: "圣保罗", cityEn: "São Paulo", label: "圣保罗时间" },
  { id: "America/Toronto", country: "加拿大", countryEn: "Canada", city: "多伦多", cityEn: "Toronto", label: "多伦多时间" },
  { id: "Asia/Shanghai", country: "中国", countryEn: "China", city: "北京", cityEn: "Beijing", label: "北京时间" },
  { id: "Europe/Paris", country: "法国", countryEn: "France", city: "巴黎", cityEn: "Paris", label: "巴黎时间" },
  { id: "Europe/Berlin", country: "德国", countryEn: "Germany", city: "柏林", cityEn: "Berlin", label: "柏林时间" },
  { id: "Asia/Kolkata", country: "印度", countryEn: "India", city: "孟买", cityEn: "Mumbai", label: "印度时间" },
  { id: "Asia/Jakarta", country: "印度尼西亚", countryEn: "Indonesia", city: "雅加达", cityEn: "Jakarta", label: "雅加达时间" },
  { id: "Asia/Tokyo", country: "日本", countryEn: "Japan", city: "东京", cityEn: "Tokyo", label: "东京时间" },
  { id: "America/Mexico_City", country: "墨西哥", countryEn: "Mexico", city: "墨西哥城", cityEn: "Mexico City", label: "墨西哥城时间" },
  { id: "Europe/Amsterdam", country: "荷兰", countryEn: "Netherlands", city: "阿姆斯特丹", cityEn: "Amsterdam", label: "阿姆斯特丹时间" },
  { id: "Asia/Singapore", country: "新加坡", countryEn: "Singapore", city: "新加坡", cityEn: "Singapore", label: "新加坡时间" },
  { id: "Asia/Seoul", country: "韩国", countryEn: "South Korea", city: "首尔", cityEn: "Seoul", label: "首尔时间" },
  { id: "Asia/Dubai", country: "阿联酋", countryEn: "United Arab Emirates", city: "迪拜", cityEn: "Dubai", label: "迪拜时间" },
  { id: "Europe/London", country: "英国", countryEn: "United Kingdom", city: "伦敦", cityEn: "London", label: "伦敦时间" },
  { id: "America/Chicago", country: "美国", countryEn: "United States", city: "芝加哥", cityEn: "Chicago", label: "芝加哥时间" },
  { id: "America/Los_Angeles", country: "美国", countryEn: "United States", city: "洛杉矶", cityEn: "Los Angeles", label: "洛杉矶时间" },
  { id: "America/New_York", country: "美国", countryEn: "United States", city: "纽约", cityEn: "New York", label: "纽约时间" },
  { id: "Asia/Ho_Chi_Minh", country: "越南", countryEn: "Vietnam", city: "胡志明市", cityEn: "Ho Chi Minh City", label: "胡志明市时间" },
].sort((a, b) => a.countryEn.localeCompare(b.countryEn, "en") || a.cityEn.localeCompare(b.cityEn, "en"));

export function findScheduleTimeZone(id: string): ScheduleTimeZone | undefined {
  return SCHEDULE_TIME_ZONES.find((zone) => zone.id === id);
}

const zonedPartsFormatter = new Map<string, Intl.DateTimeFormat>();

function zoneParts(instant: Date, timeZone: string) {
  let formatter = zonedPartsFormatter.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    zonedPartsFormatter.set(timeZone, formatter);
  }
  const parts = Object.fromEntries(formatter.formatToParts(instant).map(({ type, value }) => [type, value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), hour: Number(parts.hour), minute: Number(parts.minute) };
}

export function scheduleDateToUtc(date: string, time: string, timeZone: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const clock = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match || !clock || !findScheduleTimeZone(timeZone)) return null;
  const [year, month, day, hour, minute] = [Number(match[1]), Number(match[2]), Number(match[3]), Number(clock[1]), Number(clock[2])];
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;
  const wanted = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = wanted;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const actual = zoneParts(new Date(candidate), timeZone);
    const delta = wanted - Date.UTC(actual.year, actual.month - 1, actual.day, actual.hour, actual.minute);
    if (delta === 0) return new Date(candidate);
    candidate += delta;
  }
  return null; // This wall-clock time can be skipped when daylight saving time starts.
}

export function formatScheduleInZone(instant: string, timeZone: string) {
  const parts = zoneParts(new Date(instant), timeZone);
  return { day: parts.day, month: `${parts.month}月`, dateTime: `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")} ${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}` };
}
