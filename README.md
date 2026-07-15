# 🎤 Kho bài hát Karaoke cá nhân

Web app cá nhân để lưu trữ và quản lý những bài hát karaoke yêu thích: tên bài, ca sĩ, nhiều thể loại, nhiều tâm trạng (sôi động / trầm lắng…), link YouTube, lời bài hát, ghi chú riêng và đánh giá sao.

- **Frontend**: Vite + React + TypeScript + Tailwind CSS, chạy trên GitHub Pages (miễn phí).
- **Backend**: Supabase (Postgres + Auth, gói miễn phí).
- **Bảo mật**: đăng nhập email/mật khẩu qua Supabase Auth; database bật Row Level Security (RLS) nên kể cả khi anon key bị lộ (vốn công khai trong web tĩnh), không ai đọc/ghi được dữ liệu nếu không đăng nhập đúng tài khoản của bạn. Đăng ký tài khoản mới bị khóa hoàn toàn.

---

## Hướng dẫn cài đặt từ A đến Z

### Bước 1: Tạo project Supabase và lấy 2 thông tin cấu hình

1. Vào [supabase.com](https://supabase.com) → đăng nhập (có thể dùng tài khoản GitHub) → bấm **New project**.
2. Điền:
   - **Name**: `karaoke-songs` (tên gì cũng được).
   - **Database Password**: đặt mật khẩu mạnh và **lưu lại** (ít khi dùng nhưng cần giữ).
   - **Region**: chọn `Southeast Asia (Singapore)` cho gần Việt Nam.
3. Bấm **Create new project** và chờ khoảng 2 phút.
4. Lấy 2 giá trị cấu hình:

| Giá trị | Lấy ở đâu trong Supabase Dashboard |
|---|---|
| `VITE_SUPABASE_URL` | **Project Settings** (icon bánh răng) → **Data API** → **Project URL** (dạng `https://xxxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | **Project Settings** → **API Keys** → key **`anon` / `public`** |

> ⚠️ **Tuyệt đối KHÔNG dùng key `service_role` / `secret` ở bất cứ đâu** — key đó bỏ qua mọi lớp bảo mật.

### Bước 2: Tạo bảng database (chạy 1 lần)

SQL được chia thành các file migration có đánh version trong thư mục [`supabase/migrations/`](supabase/migrations/) (xem chi tiết quy ước ở [`supabase/README.md`](supabase/README.md)).

1. Trong Supabase Dashboard → **SQL Editor** (sidebar trái) → **New query**.
2. Mở file [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) trong repo này, copy **toàn bộ** nội dung, paste vào và bấm **Run**. Nếu sau này có thêm file migration mới (`0002_…`, `0003_…`), chạy lần lượt theo thứ tự version, mỗi file 1 lần.
3. Xong! Toàn bộ bảng, index và chính sách bảo mật RLS đã được tạo. Kiểm tra version database bằng: `select * from public.schema_migrations;`

### Bước 3: Tạo tài khoản đăng nhập của bạn và khóa đăng ký

1. **Tạo tài khoản**: **Authentication** → tab **Users** → **Add user** → **Create new user**:
   - Nhập email + mật khẩu của bạn (đây là tài khoản để đăng nhập vào app).
   - Tick ✅ **Auto Confirm User** → **Create user**.
2. **Khóa đăng ký công khai** (rất quan trọng): **Authentication** → **Sign In / Providers** → mục **Email** → **tắt** "Allow new users to sign up" → Save. Từ giờ không ai tạo được tài khoản mới.
3. (Khuyến nghị) **Authentication** → **Attack Protection** → bật **Leaked password protection**.

### Bước 4: Chạy thử trên máy (local)

```bash
# 1. Cài dependencies
npm install

# 2. Tạo file cấu hình từ mẫu
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux

# 3. Mở file .env, điền 2 giá trị lấy ở Bước 1

# 4. Chạy
npm run dev
```

Mở `http://localhost:5173` → đăng nhập bằng email/mật khẩu tạo ở Bước 3.

> File `.env` đã nằm trong `.gitignore` nên **không bao giờ** bị đẩy lên GitHub.

### Bước 5: Deploy lên GitHub Pages

1. **Thêm 2 secrets** (để GitHub Actions build mà không lộ cấu hình trong code):
   - Vào repo trên GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
   - Tạo 2 secret với tên **chính xác** như sau:

| Tên secret | Giá trị |
|---|---|
| `VITE_SUPABASE_URL` | Project URL lấy ở Bước 1 |
| `VITE_SUPABASE_ANON_KEY` | anon key lấy ở Bước 1 |

2. **Bật GitHub Pages**: repo → **Settings** → **Pages** → mục **Build and deployment** → **Source** chọn **GitHub Actions**.
3. **Push code** lên nhánh `main`:

```bash
git add .
git commit -m "Karaoke songs app"
git push origin main
```

4. Vào tab **Actions** của repo xem workflow chạy → sau ~1-2 phút, app có tại:
   `https://<username>.github.io/karaoke-songs/`

> 📌 Nếu tên repo của bạn KHÔNG phải `karaoke-songs`, hãy sửa dòng `base: '/karaoke-songs/'` trong [`vite.config.ts`](vite.config.ts) thành `/<tên-repo>/`.

### Bước 6 (khuyến nghị): Cấu hình URL trong Supabase

Vào **Authentication** → **URL Configuration**:

- **Site URL**: `https://<username>.github.io/karaoke-songs/`
- **Redirect URLs**: thêm `http://localhost:5173` để dev local vẫn hoạt động.

---

## Tóm tắt: giá trị nào lấy ở đâu, điền vào đâu

| Giá trị | Lấy ở đâu | Điền vào đâu |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → Data API → Project URL | File `.env` (local) và GitHub Secret cùng tên |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → key `anon`/`public` | File `.env` (local) và GitHub Secret cùng tên |
| Email + mật khẩu đăng nhập | Tự tạo ở Supabase → Authentication → Users → Add user | Màn hình đăng nhập của app |
| Tên repo GitHub | — | `base` trong `vite.config.ts` |

## Các lớp bảo mật đã áp dụng

1. **Supabase Auth**: bắt buộc đăng nhập email/mật khẩu trước khi vào app, session tự lưu và tự refresh token.
2. **Tắt đăng ký công khai**: chỉ tài khoản của bạn tồn tại.
3. **Row Level Security** trên mọi bảng: policy `auth.uid() = user_id` cho mọi thao tác đọc/ghi.
4. **Chặn hoàn toàn role `anon`**: chưa đăng nhập thì không truy vấn được bất kỳ bảng nào.
5. **Chỉ dùng anon key** ở client, không bao giờ nhúng service role key.
6. **Route guard**: chưa có session thì mọi trang đều chuyển về trang đăng nhập.
7. **Cấu hình qua `.env` + GitHub Secrets**: repo không chứa thông tin cấu hình.
8. **`noindex, nofollow`**: chặn công cụ tìm kiếm index trang.

## Lệnh hay dùng

```bash
npm run dev       # chạy dev server tại http://localhost:5173
npm run build     # build production vào thư mục dist/
npm run preview   # xem thử bản build
```
