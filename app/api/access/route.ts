import { and, eq, gte, count } from "drizzle-orm";
import { getDb } from "../../../db";
import { accessRequests } from "../../../db/schema";
import { requireUser,readJSON,text,choice,RequestError,responseError,NO_STORE } from "../../../lib/request-validation";
export const dynamic="force-dynamic";
export async function GET(request:Request){
  try{const userId=requireUser(request);const rows=await getDb().select({id:accessRequests.id,email:accessRequests.email,interest:accessRequests.interest,createdAt:accessRequests.createdAt}).from(accessRequests).where(eq(accessRequests.userId,userId)).limit(30);return Response.json({requests:rows},{headers:NO_STORE});}catch(e){return responseError(e);}
}
export async function POST(request:Request){
  try{
    const userId=requireUser(request),data=await readJSON(request),db=getDb();
    if(data.website)throw new RequestError("This request could not be accepted.");
    const email=text(data.email,"an email address",5,254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))throw new RequestError("Enter a valid email address.");
    if(data.consent!==true)throw new RequestError("Confirm that Evermark may store this request.");
    const interest=choice(data.interest,["filing","monitoring","general"],"an area of interest");
    const existing=await db.select({id:accessRequests.id}).from(accessRequests).where(and(eq(accessRequests.userId,userId),eq(accessRequests.email,email),eq(accessRequests.interest,interest))).limit(1);
    if(existing.length)return Response.json({received:true,id:existing[0].id},{headers:NO_STORE});
    const [{total}]=await db.select({total:count()}).from(accessRequests).where(and(eq(accessRequests.userId,userId),gte(accessRequests.createdAt,Date.now()-3600000)));
    if(total>=8)throw new RequestError("You’ve sent several requests recently. Please try again in an hour.",429);
    const row={id:crypto.randomUUID(),userId,email,interest,createdAt:Date.now()};await db.insert(accessRequests).values(row);
    return Response.json({received:true,id:row.id},{status:201,headers:NO_STORE});
  }catch(e){return responseError(e);}
}
export async function DELETE(request:Request){
  try{const userId=requireUser(request),data=await readJSON(request),id=text(data.id,"a request",1,100);await getDb().delete(accessRequests).where(and(eq(accessRequests.id,id),eq(accessRequests.userId,userId)));return Response.json({deleted:true},{headers:NO_STORE});}catch(e){return responseError(e);}
}
