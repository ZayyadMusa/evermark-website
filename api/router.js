function reply(data, status=200) {
  return Response.json(data, {status, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
export async function GET(request) {
  const url = new URL(request.url);
  const route = url.searchParams.get('path') ?? url.pathname.replace(/^\/api\//,'');
  if (route === 'session') return reply({signedIn:false, available:false});
  if (route === 'workspace' || route === 'access') return reply({error:'Account access is not available on this deployment yet.'},503);
  return reply({error:'Not found.'},404);
}
export async function POST() {
  return reply({error:'Account access is not available on this deployment yet. Your information has not been saved.'},503);
}
export const PATCH = POST;
export const DELETE = POST;
