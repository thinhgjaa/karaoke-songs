-- =====================================================================
-- MIGRATION 0003: Chuyển "Ca sĩ" thành bảng riêng (giống Thể loại/Tâm trạng)
--   - Tạo bảng artists + bảng nối song_artists (1 bài hát nhiều ca sĩ)
--   - Tự động chuyển dữ liệu từ cột text songs.artist cũ sang bảng mới
--   - Xóa cột songs.artist cũ
-- Cách dùng: Supabase Dashboard -> SQL Editor -> New query
--            -> paste toàn bộ file này -> Run (chạy 1 lần duy nhất,
--            sau khi đã chạy 0002_add_is_duet.sql)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. BẢNG MỚI
-- ---------------------------------------------------------------------
create table public.artists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name       text not null check (char_length(name) between 1 and 300),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.song_artists (
  song_id   uuid not null references public.songs (id) on delete cascade,
  artist_id uuid not null references public.artists (id) on delete cascade,
  user_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  primary key (song_id, artist_id)
);

-- ---------------------------------------------------------------------
-- 2. INDEX
-- ---------------------------------------------------------------------
create index artists_user_id_idx        on public.artists (user_id);
create index song_artists_user_id_idx   on public.song_artists (user_id);
create index song_artists_artist_id_idx on public.song_artists (artist_id);

-- ---------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.artists      enable row level security;
alter table public.song_artists enable row level security;

-- artists
create policy "artists_select" on public.artists for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "artists_insert" on public.artists for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "artists_update" on public.artists for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "artists_delete" on public.artists for delete to authenticated
  using ((select auth.uid()) = user_id);

-- song_artists
create policy "song_artists_select" on public.song_artists for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "song_artists_insert" on public.song_artists for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "song_artists_delete" on public.song_artists for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Chặn role anon với bảng mới (0001 chỉ revoke các bảng có tại thời điểm đó)
revoke all on public.artists, public.song_artists from anon;

-- ---------------------------------------------------------------------
-- 4. CHUYỂN DỮ LIỆU TỪ CỘT songs.artist CŨ SANG BẢNG MỚI
-- ---------------------------------------------------------------------
insert into public.artists (user_id, name)
select distinct user_id, trim(artist)
from public.songs
where trim(artist) <> ''
on conflict (user_id, name) do nothing;

insert into public.song_artists (song_id, artist_id, user_id)
select s.id, a.id, s.user_id
from public.songs s
join public.artists a
  on a.user_id = s.user_id and a.name = trim(s.artist)
where trim(s.artist) <> ''
on conflict (song_id, artist_id) do nothing;

-- ---------------------------------------------------------------------
-- 5. XÓA CỘT CŨ
-- ---------------------------------------------------------------------
alter table public.songs drop column artist;

-- ---------------------------------------------------------------------
-- 6. GHI NHẬN VERSION ĐÃ CHẠY
-- ---------------------------------------------------------------------
insert into public.schema_migrations (version, name)
values ('0003', 'artists_table');
