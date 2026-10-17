import { and, eq, desc, count } from "drizzle-orm";
import { getDb } from "../../../db";
import { brands, reviewLinks } from "../../../db/schema";
import { requireUser, readJSON, text, choice, website, RequestError, responseError, NO_STORE } from "../../../lib/request-validation";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const userId = requireUser(request), db = getDb();
    const [savedBrands,links] = await Promise.all([
      db.select().from(brands).where(eq(brands.userId,userId)).orderBy(desc(brands.createdAt)).limit(100),
      db.select().from(reviewLinks).where(eq(reviewLinks.userId,userId)).orderBy(desc(reviewLinks.createdAt)).limit(300)
    ]);
    return Response.json({brands:savedBrands,links,monitoringConnected:false,filingConnected:false},{headers:NO_STORE});
  } catch(error) { return responseError(error); }
}
export async function POST(request: Request) {
  try {
    const userId = requireUser(request), data = await readJSON(request), db = getDb();
    if (data.action === "brand") {
      const [{total}] = await db.select({total:count()}).from(brands).where(eq(brands.userId,userId));
      if (total >= 100) throw new RequestError("Your workspace has reached 100 brand briefs. Remove a brief before adding another.", 409);
      const row = {id:crypto.randomUUID(),userId,name:text(data.name,"a brand name",2,60),markType:choice(data.type,["name","logo","work"],"a protection type"),category:text(data.category,"an area of work",2,100),market:text(data.market,"a first market",2,100),owner:text(data.owner,"an owner name",2,100),description:text(data.description ?? "","a description",0,400),createdAt:Date.now()};
      await db.insert(brands).values(row);
      return Response.json({brand:row},{status:201,headers:NO_STORE});
    }
    if (data.action === "link") {
      const brandId = text(data.brandId,"a saved brand",1,100);
      const [owned] = await db.select({id:brands.id}).from(brands).where(and(eq(brands.id,brandId),eq(brands.userId,userId))).limit(1);
      if (!owned) throw new RequestError("Choose one of your saved brand briefs.",404);
      const [{total}] = await db.select({total:count()}).from(reviewLinks).where(eq(reviewLinks.userId,userId));
      if (total >= 300) throw new RequestError("Your workspace has reached 300 saved links. Remove a link before adding another.",409);
      const row = {id:crypto.randomUUID(),userId,brandId,url:website(data.url),title:text(data.title,"a title",2,120),channel:choice(data.channel,["marketplace","social","domain","other"],"a source"),note:text(data.note ?? "","a note",0,1000),status:"pending",createdAt:Date.now()};
      await db.insert(reviewLinks).values(row);
      return Response.json({link:row},{status:201,headers:NO_STORE});
    }
    throw new RequestError("Choose a workspace action.");
  } catch(error) { return responseError(error); }
}
export async function PATCH(request: Request) {
  try {
    const userId=requireUser(request),data=await readJSON(request),db=getDb();
    const id=text(data.id,"a saved link",1,100),status=choice(data.status,["pending","reviewed","dismissed"],"a review status");
    const rows=await db.update(reviewLinks).set({status}).where(and(eq(reviewLinks.id,id),eq(reviewLinks.userId,userId))).returning({id:reviewLinks.id});
    if(!rows.length)throw new RequestError("That saved link is unavailable.",404);
    return Response.json({saved:true},{headers:NO_STORE});
  }catch(error){return responseError(error);}
}
export async function DELETE(request: Request) {
  try {
    const userId=requireUser(request),data=await readJSON(request),db=getDb(),id=text(data.id,"a saved item",1,100);
    if(data.kind==="brand") {
      await db.batch([db.delete(reviewLinks).where(and(eq(reviewLinks.brandId,id),eq(reviewLinks.userId,userId))),db.delete(brands).where(and(eq(brands.id,id),eq(brands.userId,userId)))]);
    }else if(data.kind==="link")await db.delete(reviewLinks).where(and(eq(reviewLinks.id,id),eq(reviewLinks.userId,userId)));
    else throw new RequestError("Choose a saved item to remove.");
    return Response.json({deleted:true},{headers:NO_STORE});
  }catch(error){return responseError(error);}
}
