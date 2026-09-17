/* src/app/api/admin/teachers/route.ts */
import { NextResponse } from "next/server";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = "fdarcadia.hello@gmail.com";

function err(message: string, status=400){ return NextResponse.json({error:message},{status}); }
function expiry(start:string){
  const [y,m,d]=start.split("-").map(Number); const x=new Date(y,m-1,d);
  if(Number.isNaN(x.getTime())) throw new Error("Invalid access start date.");
  x.setFullYear(x.getFullYear()+1); x.setDate(x.getDate()-1);
  return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
}
async function sb(path:string, init:RequestInit={}, service=false){
  if(!URL) throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
  const key=service?SERVICE:ANON; if(!key) throw new Error(service?"SUPABASE_SERVICE_ROLE_KEY is missing from .env.local.":"NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.");
  const headers=new Headers(init.headers); headers.set("apikey",key); if(init.body) headers.set("Content-Type","application/json");
  return fetch(`${URL}${path}`,{...init,headers,cache:"no-store"});
}

export async function POST(request:Request){
  let userId="";
  try{
    if(!SERVICE) return err("SUPABASE_SERVICE_ROLE_KEY is missing from .env.local.",500);
    const auth=request.headers.get("authorization"); if(!auth?.startsWith("Bearer ")) return err("Please sign in as admin.",401);
    const token=auth.slice(7).trim();
    const me=await sb("/auth/v1/user",{headers:{Authorization:`Bearer ${token}`}});
    if(!me.ok) return err("Your admin session is invalid or expired.",401);
    const admin=await me.json();
    const isAdmin=admin?.email?.toLowerCase()===ADMIN_EMAIL.toLowerCase() || admin?.app_metadata?.role==="admin";
    if(!isAdmin) return err("Only FD Arcadia admin can create teachers.",403);

    const body=await request.json();
    const full_name=String(body.full_name??"").trim();
    const email=String(body.email??"").trim().toLowerCase();
    const password=String(body.password??"");
    const gender=String(body.gender??"");
    const access_start=String(body.access_start??"");
    if(!full_name) return err("Please enter teacher name.");
    if(!email.includes("@")) return err("Please enter a valid email.");
    if(password.length<8) return err("Password must be at least 8 characters.");
    if(!["female","male"].includes(gender)) return err("Please choose teacher gender.");
    if(!/^\d{4}-\d{2}-\d{2}$/.test(access_start)) return err("Please choose a valid access start date.");
    const access_expires=expiry(access_start);
    const image_url=gender==="male"?"/images/teachers/teacher_hero_male.png":"/images/teachers/teacher_hero_female.png";

    const authRes=await sb("/auth/v1/admin/users",{method:"POST",headers:{Authorization:`Bearer ${SERVICE}`},body:JSON.stringify({email,password,email_confirm:true,user_metadata:{full_name,role:"teacher",gender},app_metadata:{role:"teacher"}})},true);
    const authData=await authRes.json();
    if(!authRes.ok) return err(authData?.msg||authData?.message||authData?.error_description||"Unable to create Supabase Auth user.",authRes.status);
    userId=authData?.id; if(!userId) return err("Auth user was created without a user ID.",500);

    const profileRes=await sb("/rest/v1/teachers",{method:"POST",headers:{Authorization:`Bearer ${SERVICE}`,Prefer:"return=representation"},body:JSON.stringify({user_id:userId,role:"teacher",full_name,email,gender,image_url,status:"active",access_start,access_expires})},true);
    const profile=await profileRes.json();
    if(!profileRes.ok){ await sb(`/auth/v1/admin/users/${userId}`,{method:"DELETE",headers:{Authorization:`Bearer ${SERVICE}`}},true); return err(profile?.message||profile?.details||"Teacher profile could not be created.",500); }
    return NextResponse.json({success:true,teacher:Array.isArray(profile)?profile[0]:profile},{status:201});
  }catch(e){ console.error("CREATE TEACHER ERROR",e); return err(e instanceof Error?e.message:"Unexpected server error.",500); }
}
