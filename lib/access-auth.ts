import {createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey} from 'jose';

export type WorkspaceIdentity = {id:string; email:string};
type AccessSettings = {ACCESS_TEAM_DOMAIN?:string; ACCESS_AUD?:string};
const keySets = new Map<string,ReturnType<typeof createRemoteJWKSet>>();

function issuerFor(domain:string):string|null {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.cloudflareaccess\.com$/i.test(domain)
    ? `https://${domain.toLowerCase()}` : null;
}

export async function verifyAccessToken(token:string,domain:string,audience:string,keys:JWTVerifyGetKey):Promise<WorkspaceIdentity|null> {
  const issuer=issuerFor(domain);
  if(!issuer||!audience||!token||token.length>16000)return null;
  try {
    const {payload}=await jwtVerify(token,keys,{issuer,audience,algorithms:['RS256'],requiredClaims:['exp','sub','email']});
    if(typeof payload.sub!=='string'||!payload.sub||typeof payload.email!=='string'||!payload.email.includes('@'))return null;
    return {id:payload.sub,email:payload.email};
  } catch {return null;}
}

export async function accessIdentity(request:Request,settings:AccessSettings):Promise<WorkspaceIdentity|null> {
  const domain=settings.ACCESS_TEAM_DOMAIN?.trim()||'', audience=settings.ACCESS_AUD?.trim()||'';
  const issuer=issuerFor(domain),token=request.headers.get('Cf-Access-Jwt-Assertion')||'';
  if(!issuer||!audience||!token)return null;
  let keys=keySets.get(issuer);
  if(!keys){keys=createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));keySets.set(issuer,keys);}
  return verifyAccessToken(token,domain,audience,keys);
}

export function identityRequest(request:Request,identity:WorkspaceIdentity|null):Request {
  const headers=new Headers(request.headers);
  headers.delete('x-evermark-user-id');
  if(identity)headers.set('x-evermark-user-id',identity.id);
  return new Request(request,{headers});
}

export function accessConfigured(settings:AccessSettings):boolean {
  return !!(settings.ACCESS_TEAM_DOMAIN&&issuerFor(settings.ACCESS_TEAM_DOMAIN)&&settings.ACCESS_AUD);
}
