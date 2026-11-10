import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
export const metadata:Metadata={title:{default:'JobStudent – Việc làm thêm cho sinh viên',template:'%s | JobStudent'},description:'Tìm việc làm thêm linh hoạt, thực tập và cơ hội nghề nghiệp dành cho sinh viên.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi"><body className="min-h-screen antialiased"><Header/><main className="min-h-[65vh]">{children}</main><Footer/></body></html>}
