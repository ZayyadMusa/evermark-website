import { sitePages } from "../../lib/site-pages";
export const dynamic="force-dynamic";
export async function GET(request:Request){
  const path=new URL(request.url).pathname;
  const key=path==="/"?"/":path.replace(/\/+$/,"")+"/";
  const body=sitePages[key]||sitePages["404"];
  const headers={"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"strict-origin-when-cross-origin","Permissions-Policy":"camera=(), microphone=(), geolocation=()","Content-Security-Policy":"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'"};
  return new Response(body,{status:sitePages[key]?200:404,headers});
}
