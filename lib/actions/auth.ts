
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Kiểm tra thông tin email và mật khẩu
const credentialsSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});

// Xử lý lỗi đăng nhập
function loginError(message: string): never {
    redirect(`/login?error=${encodeURIComponent(message)}`);
}

// 1. ĐĂNG NHẬP BẰNG EMAIL

export async function signInAction(formData: FormData) {
    const parsed = credentialsSchema.safeParse(
        Object.fromEntries(formData)
    );

    if (!parsed.success) {
        loginError("Email hoặc mật khẩu không hợp lệ");
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword(
        parsed.data
    );

    if (error) {
        loginError("Email hoặc mật khẩu không chính xác");
    }

    redirect("/dashboard");
}

// 2. ĐĂNG KÝ TÀI KHOẢN

export async function signUpAction(formData: FormData) {
    const registerSchema = credentialsSchema.extend({
        full_name: z.string().trim().min(2).max(100),
        role: z.enum(["student", "employer"]),
    });

    const parsed = registerSchema.safeParse(
        Object.fromEntries(formData)
    );

    if (!parsed.success) {
        redirect("/register?error=invalid");
    }

    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
            data: {
                full_name: parsed.data.full_name,
                role: parsed.data.role,
            },
            emailRedirectTo: origin
                ? `${origin}/auth/callback`
                : undefined,
        },
    });

    if (error) {
        redirect(
            `/register?error=${encodeURIComponent(error.message)}`
        );
    }

    // Trường hợp không yêu cầu xác thực email
    if (data.session) {
        redirect("/dashboard");
    }

    // Mã hóa tiếng Việt để tránh lỗi x-action-redirect
    const notice = encodeURIComponent(
        "Vui lòng kiểm tra email để xác thực tài khoản trước khi đăng nhập"
    );

    redirect(`/login?notice=${notice}`);
}


export async function signOutAction() {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        throw new Error(
            `Đăng xuất thất bại: ${error.message}`
        );
    }

    redirect("/");
}
