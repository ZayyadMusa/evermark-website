import handler from 'vinext/server/fetch-handler';
import {accessConfigured,accessIdentity,identityRequest} from '../lib/access-auth';

export default {
  async fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext){
    const url=new URL(request.url);
    if(url.pathname==='/signin'||url.pathname==='/signout'){
      if(!accessConfigured(env))return new Response('Account sign-in is unavailable until the identity service is configured.',{status:503,headers:{'Cache-Control':'no-store','Content-Type':'text/plain; charset=utf-8'}});
      if(url.pathname==='/signout')return Response.redirect(new URL('/cdn-cgi/access/logout',url.origin),302);
      const raw=url.searchParams.get('return_to')||'/';
      const target=new URL(raw,url.origin);
      const safe=raw.startsWith('/')&&!raw.startsWith('//')&&target.origin===url.origin?target:new URL('/',url.origin);
      const login=new URL('/cdn-cgi/access/login',url.origin);
      login.searchParams.set('redirect_url',safe.href);
      return Response.redirect(login.href,302);
    }
    const trusted=identityRequest(request,await accessIdentity(request,env));
    return handler.fetch(trusted,env,ctx);
  }
};
