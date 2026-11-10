
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions/auth";

export default async function NavAuth() {
    const supabase = await createClient();

    // Kiểm tra trạng thái đăng nhập
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Trường hợp chưa đăng nhập
    if (!user) {
        return (
            <div className="flex flex-wrap items-center gap-3">
                <Link
                    href="/login"
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                    Đăng nhập
                </Link>

                <Link
                    href="/register"
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    Đăng ký ngay
                </Link>
            </div>
        );
    }

    // Lấy thông tin người dùng từ bảng profiles
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle();

    // Xác định tên hiển thị
    const displayName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Người dùng";

    // Xác định vai trò
    const role = profile?.role ?? "student";

    // Xác định dashboard theo vai trò
    const dashboardUrl =
        role === "admin"
            ? "/admin"
            : role === "employer"
                ? "/employer"
                : "/student";

    // Xác định tên nút dashboard
    const dashboardLabel =
        role === "admin"
            ? "Quản trị"
            : role === "employer"
                ? "Quản lý tuyển dụng"
                : "Hồ sơ của tôi";

    // Giao diện khi đã đăng nhập
    return (
        <div className="flex flex-wrap items-center gap-3">

            {/* Hiển thị tên người dùng */}
            <span className="hidden text-sm font-semibold text-slate-700 lg:block">
                Xin chào, {displayName}
            </span>

            {/* Dashboard theo vai trò */}
            <Link
                href={dashboardUrl}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
                {dashboardLabel}
            </Link>

            {/* Đăng xuất bằng Supabase Server Action */}
            <form action={signOutAction}>
                <button
                    type="submit"
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                    Đăng xuất
                </button>
            </form>

        </div>
    );
}
