import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
export async function middleware(request:NextRequest){
 let response=NextResponse.next({request});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return response;
 const supabase=createServerClient(url,key,{cookies:{
 getAll(){return request.cookies.getAll()},
 setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options));}
 }});
 const {data:{user}}=await supabase.auth.getUser();
 if(!user && /^\/(dashboard|student|employer|admin)(\/|$)/.test(request.nextUrl.pathname))return NextResponse.redirect(new URL('/login',request.url));
 return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|webp)$).*)']};
