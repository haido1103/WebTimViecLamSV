# JobStudent – Nền tảng tìm việc làm thêm cho sinh viên

## Công nghệ
- Next.js App Router + TypeScript
- Tailwind CSS v4; `components.json` chuẩn bị cho shadcn/ui; UI components có thể mở rộng bằng shadcn CLI
- Supabase PostgreSQL + `@supabase/ssr`
- Lucide Icons

Mặc định nếu **chưa có `.env.local`**, website chạy với **6 tin tuyển dụng giả lập** để xem giao diện. Các tin này không có nhà tuyển dụng thật. Trang đăng nhập/đăng ký chỉ là placeholder, chưa thu thập dữ liệu.

## Kết nối Supabase
1. Tạo Supabase project và chờ cơ sở dữ liệu được khởi tạo.
2. Trong **SQL Editor**, dán toàn bộ `supabase/schema.sql`, bấm Run.
3. Sao chép `.env.example` thành `.env.local`. Điền:
   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
   ```
4. Tạo công ty và tin tuyển dụng sau khi có user thực / chức năng admin ở tuần 3. Bản giai đoạn 1–2 **không tự seed dữ liệu giả vào bảng production** vì `companies.owner_id` tham chiếu tài khoản thực. Khi nối Supabase với bảng trống, trang việc làm hiển thị trạng thái rỗng.
5. Khởi động lại `npm run dev` sau khi thay đổi `.env.local`.

**Key:** KHÔNG đặt service role key hoặc secret key trong biến `NEXT_PUBLIC_*` hay commit `.env.local`. Chỉ dùng publishable/anon key ở phía client. Bật RLS cho các bảng. Hiện tại database chỉ có quyền đọc tin đã công khai; ghi dữ liệu sẽ được bổ sung cùng chính sách bảo mật tuần 3.

## Các trang đã có
- `/` – trang chủ, tìm kiếm nhanh, ngành nghề, việc làm mới nhất
- `/jobs` – lọc theo danh mục / địa điểm / từ khóa, phân trang
- `/jobs/[id]` – chi tiết công việc
- `/companies` – giới thiệu dành cho nhà tuyển dụng
- `/about` – giới thiệu dự án
- `/login`, `/register` – màn hình chuẩn bị cho Auth tuần 3 (không có form hoạt động)

## Chưa triển khai 
- Đăng nhập email/Google và refresh session
- Quy trình đăng ký, tự động tạo profile/role an toàn
- Proxy/Middleware bảo vệ route, RLS ghi dữ liệu, Server Actions và Zod
- Đăng tin, ứng tuyển, lưu CV, quản lý hồ sơ, admin
- Kiểm thử E2E, Vercel production, tài liệu và slide bảo vệ

## Cấu trúc quan trọng
- `app/` – routing và Server Components
- `components/` – giao diện tái sử dụng
- `lib/jobs.ts` – đọc dữ liệu từ Supabase hoặc dữ liệu xem thử
- `lib/supabase/` – Supabase SSR clients
- `data/demo-jobs.ts` – dữ liệu minh họa, không phải tin tuyển dụng thực
- `supabase/schema.sql` – bảng quan hệ, index, chính sách RLS nền tảng

## Lệnh kiểm tra
```bash
npm run typecheck
npm run lint
npm run build
```

## Giai đoạn MVP mở rộng — chức năng 3 vai trò 

**Key:** Các chức năng đã được viết vào mã nguồn nhưng CHƯA được kiểm thử tích hợp trên một Supabase project thực. Chạy theo thứ tự dưới đây và kiểm thử kỹ RLS trước khi dùng với dữ liệu thật. `npm install` trong môi trường đóng gói đã timeout.

### Luồng chức năng
- `/register`, `/login`, `/auth/callback`: Email/password, đăng ký theo vai trò, Google OAuth, SSR cookie.
- `/dashboard`: chuyển sang màn hình theo vai trò và đăng xuất.
- `/student`: danh sách ứng tuyển, việc đã lưu. Tại `/jobs/[id]` có form ứng tuyển kèm PDF ≤5MB và nút lưu việc (chỉ hiển thị nếu đã cấu hình Supabase).
- `/employer`: tạo doanh nghiệp, theo dõi tin và cập nhật trạng thái ứng viên. `/employer/new`: đăng tin (chờ admin duyệt).
- `/admin`: thống kê tổng quan và duyệt/từ chối/đóng tin.
- `middleware.ts`: refresh phiên đăng nhập, chặn truy cập không xác thực vào đường dẫn riêng. **Quyền thực tế** bắt buộc dựa trên `requireRole`, RLS, trigger SQL — không chỉ dựa trên proxy.



### Giới hạn hiện tại — việc cần hoàn thiện
- Chưa có UI sửa/xóa bài đăng, cập nhật hồ sơ, tải CV bằng signed URL, tìm kiếm ứng viên, thống kê nâng cao, ảnh đại diện, thông báo hay trang quản lý tài khoản admin.
- CV hiện chỉ hiển thị đường dẫn trong dashboard nhà tuyển dụng; bucket private và RLS đã có cơ sở nhưng chưa có nút tải file qua signed URL.
- `schema.sql` là schema tạo ban đầu; `02_security.sql` được thiết kế cho project mới. Nếu từng sửa bảng/chính sách, nên dùng project test mới hoặc migration được kiểm tra riêng.
- Dữ liệu demo chỉ khi chưa cấu hình Supabase. Khi đã kết nối, cần đăng tin rồi admin duyệt để thấy dữ liệu thật.
- Dự án đang sử dụng Next.js 15 nên file `middleware.ts` được dùng để làm mới session. Khi nâng lên Next.js 16, chuyển sang `proxy.ts` và đổi tên hàm thành `proxy`.
