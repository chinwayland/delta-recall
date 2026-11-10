import { and, eq } from 'drizzle-orm';
import { getDb } from '../../../db';
import { progress } from '../../../db/schema';
import { getChatGPTUser } from '../../chatgpt-auth';
import { normalizeState } from '../../../public/progress-state.js';

export const dynamic = 'force-dynamic';
const response = (body: unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store, private','Vary':'Cookie'}});
async function snapshot(userId:string) {
  const row=await getDb().select().from(progress).where(eq(progress.userId,userId)).get();
  return row?{revision:row.revision,state:JSON.parse(row.state),updatedAt:row.updatedAt}:{revision:0,state:null,updatedAt:null};
}
export async function GET() {
  const user=await getChatGPTUser();
  if(!user)return response({error:'Sign in to load your progress.'},401);
  return response({...await snapshot(user.userId),user:{id:user.userId,email:user.email}});
}
export async function PUT(request:Request) {
  const user=await getChatGPTUser();
  if(!user)return response({error:'Sign in to save your progress.'},401);
  if(request.headers.get('Origin')!==new URL(request.url).origin)return response({error:'Request origin rejected.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return response({error:'JSON required.'},415);
  if(Number(request.headers.get('Content-Length')||0)>131072)return response({error:'Progress is too large.'},413);
  const raw=await request.text();if(raw.length>131072)return response({error:'Progress is too large.'},413);
  let body:any,state;
  try {body=JSON.parse(raw);if(!Number.isSafeInteger(body.revision)||body.revision<0)throw new Error('Invalid revision.');state=normalizeState(body.state);}catch(error){return response({error:error instanceof Error?error.message:'Invalid progress.'},400);}
  if(body.accountId!==user.userId)return response({error:'The signed-in account changed. Reload before saving.'},401);
  const updatedAt=Date.now(),db=getDb();
  const result=body.revision===0
    ?await db.insert(progress).values({userId:user.userId,state:JSON.stringify(state),revision:1,updatedAt}).onConflictDoNothing().returning({revision:progress.revision})
    :await db.update(progress).set({state:JSON.stringify(state),revision:body.revision+1,updatedAt}).where(and(eq(progress.userId,user.userId),eq(progress.revision,body.revision))).returning({revision:progress.revision});
  if(!result.length)return response({error:'Progress changed on another device.',...await snapshot(user.userId)},409);
  return response({revision:result[0].revision,updatedAt});
}
