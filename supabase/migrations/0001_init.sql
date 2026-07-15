-- =====================================================================
-- MIGRATION 0001: Khởi tạo database (bảng, index, trigger, RLS)
-- Cách dùng: Supabase Dashboard -> SQL Editor -> New query
--            -> paste toàn bộ file này -> Run (chạy 1 lần duy nhất)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. BẢNG THEO DÕI VERSION MIGRATION
--    Mỗi file migration khi chạy xong sẽ tự ghi version vào đây.
--    Nhờ đó biết được database đang ở version nào, đã chạy file nào.
-- ---------------------------------------------------------------------
create table if not exists public.schema_migrations (
  version    text primary key,
  name       text not null,
  applied_at timestamptz not null default now()
);

alter table public.schema_migrations enable row level security;
revoke all on public.schema_migrations from anon, authenticated;

-- ---------------------------------------------------------------------
-- 1. BẢNG DỮ LIỆU
-- ---------------------------------------------------------------------

-- Bài hát
create table public.songs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 300),
  artist      text not null default '' check (char_length(artist) <= 300),
  youtube_url text not null default '' check (char_length(youtube_url) <= 1000),
  lyrics      text not null default '' check (char_length(lyrics) <= 50000),
  notes       text not null default '' check (char_length(notes) <= 5000),
  rating      smallint not null default 0 check (rating between 0 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Thể loại (nhạc trẻ, bolero, nhạc vàng, remix...)
create table public.genres (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- Tâm trạng (sôi động, trầm lắng, tình cảm...)
create table public.moods (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- Một bài hát thuộc nhiều thể loại
create table public.song_genres (
  song_id  uuid not null references public.songs (id) on delete cascade,
  genre_id uuid not null references public.genres (id) on delete cascade,
  user_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  primary key (song_id, genre_id)
);

-- Một bài hát thuộc nhiều tâm trạng
create table public.song_moods (
  song_id uuid not null references public.songs (id) on delete cascade,
  mood_id uuid not null references public.moods (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  primary key (song_id, mood_id)
);

-- ---------------------------------------------------------------------
-- 2. INDEX
-- ---------------------------------------------------------------------
create index songs_user_id_idx        on public.songs (user_id);
create index songs_created_at_idx     on public.songs (user_id, created_at desc);
create index genres_user_id_idx       on public.genres (user_id);
create index moods_user_id_idx        on public.moods (user_id);
create index song_genres_user_id_idx  on public.song_genres (user_id);
create index song_genres_genre_id_idx on public.song_genres (genre_id);
create index song_moods_user_id_idx   on public.song_moods (user_id);
create index song_moods_mood_id_idx   on public.song_moods (mood_id);

-- ---------------------------------------------------------------------
-- 3. TỰ ĐỘNG CẬP NHẬT updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger songs_set_updated_at
  before update on public.songs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS)
--    Kể cả khi anon key bị lộ (nó vốn công khai trong JS của web tĩnh),
--    không ai đọc/ghi được dữ liệu nếu không đăng nhập đúng tài khoản.
-- ---------------------------------------------------------------------
alter table public.songs       enable row level security;
alter table public.genres      enable row level security;
alter table public.moods       enable row level security;
alter table public.song_genres enable row level security;
alter table public.song_moods  enable row level security;

-- songs
create policy "songs_select" on public.songs for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "songs_insert" on public.songs for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "songs_update" on public.songs for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "songs_delete" on public.songs for delete to authenticated
  using ((select auth.uid()) = user_id);

-- genres
create policy "genres_select" on public.genres for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "genres_insert" on public.genres for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "genres_update" on public.genres for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "genres_delete" on public.genres for delete to authenticated
  using ((select auth.uid()) = user_id);

-- moods
create policy "moods_select" on public.moods for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "moods_insert" on public.moods for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "moods_update" on public.moods for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "moods_delete" on public.moods for delete to authenticated
  using ((select auth.uid()) = user_id);

-- song_genres
create policy "song_genres_select" on public.song_genres for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "song_genres_insert" on public.song_genres for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "song_genres_delete" on public.song_genres for delete to authenticated
  using ((select auth.uid()) = user_id);

-- song_moods
create policy "song_moods_select" on public.song_moods for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "song_moods_insert" on public.song_moods for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "song_moods_delete" on public.song_moods for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------
-- 5. CHẶN HOÀN TOÀN ROLE ANON (chưa đăng nhập thì không làm được gì)
-- ---------------------------------------------------------------------
revoke all on all tables in schema public from anon;

-- ---------------------------------------------------------------------
-- 6. GHI NHẬN VERSION ĐÃ CHẠY
-- ---------------------------------------------------------------------
insert into public.schema_migrations (version, name)
values ('0001', 'init');
