-- SPEC 06: real Asteroids leaderboard.
-- games lists only the playable games; scores is written only through submit_score.

create table public.games (
  id         text primary key,          -- same id as lib/games.ts
  title      text not null,
  max_score  integer not null check (max_score > 0),
  created_at timestamptz not null default now()
);

create table public.scores (
  id         bigint generated always as identity primary key,
  game_id    text not null references public.games(id),
  name       text not null check (char_length(name) between 1 and 10),
  score      integer not null check (score >= 0),
  created_at timestamptz not null default now()
);
create index scores_game_score_idx on public.scores (game_id, score desc);

-- RLS: public read on both tables; no insert/update/delete policies.
alter table public.games  enable row level security;
alter table public.scores enable row level security;

create policy "games are readable by everyone"
  on public.games for select to anon, authenticated using (true);
create policy "scores are readable by everyone"
  on public.scores for select to anon, authenticated using (true);

revoke insert, update, delete, truncate on public.games, public.scores from anon, authenticated;

-- Best mark per (game_id, name), with the date it was first reached.
create view public.leaderboard
with (security_invoker = true) as
select distinct on (s.game_id, s.name)
  s.game_id,
  s.name,
  s.score,
  s.created_at
from public.scores s
order by s.game_id, s.name, s.score desc, s.created_at asc;

-- Validates and stores a score; returns the name's 1-based rank by best mark
-- (ties broken by who reached it first, same order as the leaderboard read).
create function public.submit_score(p_game text, p_name text, p_score integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_max  integer;
  v_name text := btrim(coalesce(p_name, ''));
  v_rank integer;
begin
  select g.max_score into v_max from public.games g where g.id = p_game;
  if v_max is null then
    raise exception 'unknown game' using errcode = '22023';
  end if;
  if char_length(v_name) not between 1 and 10 then
    raise exception 'invalid name' using errcode = '22023';
  end if;
  if p_score is null or p_score < 0 or p_score > v_max then
    raise exception 'invalid score' using errcode = '22023';
  end if;

  insert into public.scores (game_id, name, score) values (p_game, v_name, p_score);

  select r.rank into v_rank
  from (
    select b.name,
           row_number() over (order by b.score desc, b.created_at asc, b.name asc)::integer as rank
    from (
      select distinct on (s.name) s.name, s.score, s.created_at
      from public.scores s
      where s.game_id = p_game
      order by s.name, s.score desc, s.created_at asc
    ) b
  ) r
  where r.name = v_name;

  return v_rank;
end;
$$;

revoke execute on function public.submit_score(text, text, integer) from public, anon, authenticated;
grant execute on function public.submit_score(text, text, integer) to anon, authenticated;

insert into public.games (id, title, max_score) values ('asteroides', 'ASTEROIDES', 1000000);
