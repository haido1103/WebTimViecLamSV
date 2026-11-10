import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
export function ButtonLink({href,children,variant='primary',className}:{href:string;children:ReactNode;variant?:'primary'|'outline'|'white';className?:string}) {
 return <Link href={href} className={cn('inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5',variant==='primary'&&'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200',variant==='outline'&&'border border-slate-200 bg-white text-slate-700 hover:border-blue-300',variant==='white'&&'bg-white text-blue-700 hover:bg-blue-50',className)}>{children}</Link>;
}
