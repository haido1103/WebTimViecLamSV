
import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import NavAuth from "@/components/layout/nav-auth";

export function Header() {
    return (
        <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
            <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

                {/* Logo JobStudent */}
                <Link
                    href="/"
                    className="flex items-center gap-3"
                >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                        <BriefcaseBusiness size={25} strokeWidth={2.5} />
                    </div>

                    <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                        Job<span className="text-blue-600">Student</span>
                    </span>
                </Link>

                {/* Menu điều hướng */}
                <nav className="flex flex-wrap items-center gap-5 text-sm font-semibold text-slate-600 lg:gap-8">
                    <Link
                        href="/"
                        className="transition-colors hover:text-blue-600"
                    >
                        Trang chủ
                    </Link>

                    <Link
                        href="/jobs"
                        className="transition-colors hover:text-blue-600"
                    >
                        Việc làm
                    </Link>

                    <Link
                        href="/companies"
                        className="transition-colors hover:text-blue-600"
                    >
                        Nhà tuyển dụng
                    </Link>

                    <Link
                        href="/about"
                        className="transition-colors hover:text-blue-600"
                    >
                        Về chúng tôi
                    </Link>
                </nav>

                {/* Tự động hiển thị theo trạng thái đăng nhập */}
                <div className="flex flex-wrap items-center gap-3">
                    <NavAuth />
                </div>

            </div>
        </header>
    );
}
