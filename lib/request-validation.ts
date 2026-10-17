export class RequestError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function requireUser(request: Request) {
  const userId = request.headers.get("x-evermark-user-id");
  if (!userId) throw new RequestError("Sign in to save changes to your workspace.", 401);
  return userId;
}
export function checkWrite(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new RequestError("This request must come from Evermark.", 403);
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") throw new RequestError("This request must come from Evermark.", 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new RequestError("Send JSON to this endpoint.", 415);
}
export async function readJSON(request: Request) {
  checkWrite(request);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 8192) throw new RequestError("The request is too large.", 413);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError("Add the required details.");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const {done,value} = await reader.read(); if (done) break; size += value.length; if (size > 8192) { await reader.cancel(); throw new RequestError("The request is too large.", 413); } chunks.push(value); }
  const combined = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { combined.set(chunk, offset); offset += chunk.length; }
  try { const value = JSON.parse(new TextDecoder().decode(combined)); if (!value || typeof value !== "object" || Array.isArray(value)) throw Error(); return value as Record<string, unknown>; }
  catch { throw new RequestError("The request contains invalid JSON."); }
}
export function text(value: unknown, label: string, min: number, max: number) {
  if (typeof value !== "string") throw new RequestError(`Enter ${label}.`);
  const result = value.trim();
  if (result.length < min || result.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result)) throw new RequestError(`${label} must contain ${min}–${max} characters.`);
  return result;
}
export function choice(value: unknown, options: string[], label: string) {
  if (typeof value !== "string" || !options.includes(value)) throw new RequestError(`Choose ${label}.`);
  return value;
}
export function website(value: unknown) {
  const raw = text(value, "a website link", 8, 2048);
  let url: URL; try { url = new URL(raw); } catch { throw new RequestError("Enter a complete website link, beginning with https://."); }
  if (!["http:","https:"].includes(url.protocol) || url.username || url.password || !url.hostname.includes(".")) throw new RequestError("Use a public http or https website link without login details.");
  return url.toString();
}
export function responseError(error: unknown) {
  if (error instanceof RequestError) return Response.json({error:error.message},{status:error.status,headers:{"Cache-Control":"no-store"}});
  console.error("Evermark request failed", error instanceof Error ? error.name : "Unknown error");
  return Response.json({error:"Your changes could not be saved. Please try again."},{status:503,headers:{"Cache-Control":"no-store"}});
}
export const NO_STORE = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
