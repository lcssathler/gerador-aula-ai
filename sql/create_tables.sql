create extension if not exists pgcrypto;

create table if not exists lesson_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  tema text not null,
  serie text not null,
  disciplina text not null,
  duracao integer not null,
  nivel_dificuldade text not null,
  introducao text,
  objetivo_bncc text,
  passo_a_passo jsonb,
  rubrica jsonb,
  criado_em timestamp with time zone default now()
);

create index if not exists idx_lesson_plans_user on lesson_plans(user_id);
