import { NO_STORE } from "../../../lib/request-validation";
export const dynamic="force-dynamic";
export async function GET(request:Request){
  return Response.json({signedIn:Boolean(request.headers.get("x-evermark-user-id"))},{headers:NO_STORE});
}
