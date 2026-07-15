# Database migrations

Toàn bộ SQL của project nằm trong thư mục [`migrations/`](migrations/), được đánh version theo tên file:

```
supabase/migrations/
  0001_init.sql        <- version 0001: tạo bảng, index, trigger, RLS
  0002_<ten-ngan>.sql  <- các thay đổi tiếp theo (khi có)
```

## Quy ước

- Tên file: `<version 4 chữ số>_<tên ngắn gọn>.sql`, ví dụ `0002_add_song_key.sql`.
- **Không sửa lại file migration đã chạy trên database.** Muốn thay đổi schema thì tạo file mới với version tiếp theo.
- Mỗi file migration phải kết thúc bằng lệnh ghi nhận version của chính nó:

```sql
insert into public.schema_migrations (version, name)
values ('0002', 'add_song_key');
```

## Cách chạy

1. Vào Supabase Dashboard → **SQL Editor** → **New query**.
2. Copy toàn bộ nội dung file migration, paste vào và bấm **Run**.
3. Chạy lần lượt theo thứ tự version (0001 → 0002 → …), mỗi file chỉ chạy **1 lần duy nhất**.

## Kiểm tra database đang ở version nào

Chạy trong SQL Editor:

```sql
select * from public.schema_migrations order by version;
```

Kết quả liệt kê các version đã chạy kèm thời điểm chạy (`applied_at`). Version lớn nhất là version hiện tại của database.

> **Lưu ý nếu bạn đã tạo bảng bằng file `schema.sql` cũ** (trước khi có thư mục này): database của bạn đã tương đương version 0001, chỉ cần chạy riêng phần "0. BẢNG THEO DÕI VERSION MIGRATION" và phần "6. GHI NHẬN VERSION ĐÃ CHẠY" trong `0001_init.sql` để bổ sung bảng theo dõi version, **không** chạy lại toàn bộ file (sẽ báo lỗi vì bảng đã tồn tại).
