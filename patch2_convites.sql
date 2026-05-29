-- ============================================================
-- PLATAFORMA HOLOS — Patch 2: Convites + Login Simultâneo
-- Execute no SQL Editor do Supabase ANTES de subir o app v3
-- ============================================================

-- 1. Coluna session_token na tabela perfis
--    Guarda o token da sessão ativa mais recente
alter table public.perfis
  add column if not exists session_token text;

-- 2. Tabela de convites
create table if not exists public.convites (
  id uuid default uuid_generate_v4() primary key,
  codigo text not null unique,
  tipo_perfil text not null default 'Usuario' check (tipo_perfil in ('Usuario', 'Profissional')),
  plano text not null default 'Gratuito' check (plano in ('Gratuito', 'Premium')),
  status text not null default 'Disponivel' check (status in ('Disponivel', 'Enviado', 'Usado')),
  email_destinatario text,
  email_usado_por text,
  criado_em timestamptz default now(),
  enviado_em timestamptz,
  usado_em timestamptz,
  gerado_por text default 'Admin',
  observacao text
);

-- 3. RLS na tabela convites
alter table public.convites enable row level security;

-- Apenas Admin gerencia convites
create policy "admin_gerencia_convites"
  on public.convites for all
  using (
    exists (
      select 1 from public.perfis p
      where p.id = auth.uid() and p.perfil = 'Admin'
    )
  );

-- Qualquer um pode verificar se um código é válido (para o cadastro)
create policy "verificar_codigo_convite"
  on public.convites for select
  using (status = 'Disponivel');

-- 4. Função para gerar códigos únicos em lote
create or replace function public.gerar_convites(
  quantidade integer,
  p_tipo_perfil text default 'Usuario',
  p_plano text default 'Gratuito'
)
returns table(codigo text) as $$
declare
  i integer;
  novo_codigo text;
  letras text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  parte1 text;
  parte2 text;
begin
  for i in 1..quantidade loop
    -- Gera código no formato HOLOS-XXXX-XXXX
    parte1 := '';
    parte2 := '';
    for j in 1..4 loop
      parte1 := parte1 || substr(letras, floor(random() * length(letras) + 1)::int, 1);
      parte2 := parte2 || substr(letras, floor(random() * length(letras) + 1)::int, 1);
    end loop;
    novo_codigo := 'HOLOS-' || parte1 || '-' || parte2;

    -- Garante que não existe duplicata
    while exists (select 1 from public.convites c where c.codigo = novo_codigo) loop
      parte1 := '';
      parte2 := '';
      for j in 1..4 loop
        parte1 := parte1 || substr(letras, floor(random() * length(letras) + 1)::int, 1);
        parte2 := parte2 || substr(letras, floor(random() * length(letras) + 1)::int, 1);
      end loop;
      novo_codigo := 'HOLOS-' || parte1 || '-' || parte2;
    end loop;

    insert into public.convites (codigo, tipo_perfil, plano)
    values (novo_codigo, p_tipo_perfil, p_plano);

    return next novo_codigo;
  end loop;
end;
$$ language plpgsql security definer;

-- ============================================================
-- FIM DO PATCH 2
-- ============================================================
