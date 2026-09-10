import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
const env={}; for(const l of readFileSync("./.env","utf8").split(/\r?\n/)){const m=l.match(/^([A-Z0-9_]+)=(.*)$/); if(m) env[m[1]]=m[2];}
const URL_=env.NEXT_PUBLIC_SUPABASE_URL, ANON=env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb=createClient(URL_, env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const EMAIL="refund-repro@tabor.quest", PASS="repro-"+Math.random().toString(36).slice(2,10);
const {data:list}=await sb.auth.admin.listUsers({page:1,perPage:200});
let u=list.users.find(x=>x.email===EMAIL);
if(u) await sb.auth.admin.updateUserById(u.id,{password:PASS});
else u=(await sb.auth.admin.createUser({email:EMAIL,password:PASS,email_confirm:true})).data.user;
const c=new pg.Client({connectionString:env.SUPABASE_DB_URL,ssl:{rejectUnauthorized:false}});
await c.connect();
await c.query("update profiles set role='admin' where user_id=$1",[u.id]);
await c.end();
// sign in for a real session
const tok=await (await fetch(`${URL_}/auth/v1/token?grant_type=password`,{method:"POST",headers:{apikey:ANON,"Content-Type":"application/json"},body:JSON.stringify({email:EMAIL,password:PASS})})).json();
if(!tok.access_token){ console.log("sign-in failed:",JSON.stringify(tok).slice(0,200)); process.exit(1); }
const ref=URL_.replace("https://","").split(".")[0];
const session={access_token:tok.access_token,token_type:"bearer",expires_in:tok.expires_in,expires_at:Math.floor(Date.now()/1000)+tok.expires_in,refresh_token:tok.refresh_token,user:tok.user};
const val="base64-"+Buffer.from(JSON.stringify(session)).toString("base64");
// @supabase/ssr chunks cookies over ~3180 bytes
const NAME=`sb-${ref}-auth-token`;
let cookie;
if(val.length<=3180) cookie=`${NAME}=${val}`;
else { const parts=[]; for(let i=0;i<val.length;i+=3180) parts.push(val.slice(i,i+3180));
  cookie=parts.map((p,i)=>`${NAME}.${i}=${p}`).join("; "); }
writeFileSync(".cookie.tmp", cookie);
console.log("session ready, cookie length", cookie.length, "| chunks", cookie.split("; ").length);
