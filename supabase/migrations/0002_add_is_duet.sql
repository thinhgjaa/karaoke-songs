-- =====================================================================
-- MIGRATION 0002: Thêm cột "hát cặp" (song ca) cho bảng songs
-- Cách dùng: Supabase Dashboard -> SQL Editor -> New query
--            -> paste toàn bộ file này -> Run (chạy 1 lần duy nhất,
--            sau khi đã chạy 0001_init.sql)
-- =====================================================================

alter table public.songs
  add column is_duet boolean not null default false;

comment on column public.songs.is_duet is 'Bài này có thể hát cặp (song ca) hay không';

-- ---------------------------------------------------------------------
-- GHI NHẬN VERSION ĐÃ CHẠY
-- ---------------------------------------------------------------------
insert into public.schema_migrations (version, name)
values ('0002', 'add_is_duet');
