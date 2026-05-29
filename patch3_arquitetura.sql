-- ============================================================
-- PLATAFORMA HOLOS — Patch 3: Arquitetura Completa
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Novas tabelas conforme planta arquitetônica

create table if not exists public.clube_holos (
  id uuid default uuid_generate_v4() primary key,
  livro text not null,
  tipo_livro text not null default 'secular' check (tipo_livro in ('secular','biblico')),
  mes text,
  data_prevista date,
  link_grupo_whatsapp text,
  status text default 'ativo' check (status in ('ativo','encerrado')),
  is_test boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.store_itens (
  id uuid default uuid_generate_v4() primary key,
  nome text not null,
  categoria text not null,
  foto_url text,
  link_afiliado text,
  ativo boolean default true,
  is_test boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.indicacoes (
  id uuid default uuid_generate_v4() primary key,
  profissional_indicador_id text references public.profissionais(id),
  profissional_indicado_email text not null,
  status text default 'pendente' check (status in ('pendente','confirmada','rejeitada')),
  data_confirmacao timestamptz,
  is_test boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.suporte_chamados (
  id uuid default uuid_generate_v4() primary key,
  usuario_id uuid references auth.users(id),
  profissional_id text,
  tipo text default 'geral',
  mensagem text not null,
  status text default 'aberto' check (status in ('aberto','em_andamento','concluido')),
  is_test boolean default false,
  data_criacao timestamptz default now()
);

create table if not exists public.comunicacoes (
  id uuid default uuid_generate_v4() primary key,
  titulo text not null,
  mensagem text not null,
  publico text default 'todos' check (publico in ('todos','usuarios','profissionais')),
  status text default 'enviado',
  is_test boolean default false,
  created_at timestamptz default now()
);

-- Adiciona campo is_test nas tabelas principais se não existir
alter table public.perfis add column if not exists is_test boolean default false;
alter table public.profissionais add column if not exists is_test boolean default false;
alter table public.conteudos add column if not exists is_test boolean default false;
alter table public.matches add column if not exists is_test boolean default false;
alter table public.checkins add column if not exists is_test boolean default false;
alter table public.rodas_holos add column if not exists is_test boolean default false;

-- RLS nas novas tabelas
alter table public.clube_holos enable row level security;
alter table public.store_itens enable row level security;
alter table public.indicacoes enable row level security;
alter table public.suporte_chamados enable row level security;
alter table public.comunicacoes enable row level security;

-- Políticas clube_holos
create policy "todos_leem_clube" on public.clube_holos for select using (auth.uid() is not null);
create policy "admin_gerencia_clube" on public.clube_holos for all using (exists (select 1 from public.perfis p where p.id = auth.uid() and p.perfil = 'Admin'));

-- Políticas store_itens
create policy "todos_leem_store" on public.store_itens for select using (auth.uid() is not null and ativo = true);
create policy "admin_gerencia_store" on public.store_itens for all using (exists (select 1 from public.perfis p where p.id = auth.uid() and p.perfil = 'Admin'));

-- Políticas indicacoes
create policy "profissional_ve_suas_indicacoes" on public.indicacoes for select using (
  profissional_indicador_id in (select id from public.profissionais where user_id = auth.uid())
);
create policy "profissional_cria_indicacao" on public.indicacoes for insert with check (auth.uid() is not null);
create policy "admin_gerencia_indicacoes" on public.indicacoes for all using (exists (select 1 from public.perfis p where p.id = auth.uid() and p.perfil = 'Admin'));

-- Políticas suporte
create policy "usuario_ve_seus_chamados" on public.suporte_chamados for select using (usuario_id = auth.uid());
create policy "usuario_cria_chamado" on public.suporte_chamados for insert with check (usuario_id = auth.uid());
create policy "admin_gerencia_suporte" on public.suporte_chamados for all using (exists (select 1 from public.perfis p where p.id = auth.uid() and p.perfil = 'Admin'));

-- Políticas comunicacoes
create policy "todos_leem_comunicacoes" on public.comunicacoes for select using (auth.uid() is not null);
create policy "admin_gerencia_comunicacoes" on public.comunicacoes for all using (exists (select 1 from public.perfis p where p.id = auth.uid() and p.perfil = 'Admin'));

-- ============================================================
-- 2. SEED DE DADOS DE TESTE
-- Todos com is_test = true e prefixo TESTE
-- ============================================================

-- Conteúdos de teste
insert into public.conteudos (titulo, dor, instancia, formato, plano, status, profissional_origem, descricao, is_test)
values
  ('TESTE Áudio Ansiedade — Respiração', 'Ansiedade', 'Mente', 'Áudio', 'Gratuito', 'Aprovado', 'profissional.free.teste@holos.test', 'Técnica de respiração para momentos de ansiedade.', true),
  ('TESTE Texto Burnout — Limites', 'Burnout', 'Mente', 'Texto', 'Gratuito', 'Aprovado', 'profissional.free.teste@holos.test', 'Como estabelecer limites saudáveis no trabalho.', true),
  ('TESTE Áudio Corpo — Movimento', 'Ansiedade', 'Corpo', 'Áudio', 'Premium', 'Aprovado', 'profissional.premium.teste@holos.test', 'Exercício de movimento consciente para o corpo.', true),
  ('TESTE Meditação Consciência', 'Solidão', 'Consciencia', 'Áudio', 'Premium', 'Aprovado', 'profissional.premium.teste@holos.test', 'Meditação guiada para conexão interior.', true)
on conflict do nothing;

-- Roda de teste
insert into public.rodas_holos (tema, data, hora, status, plano, link_grupo_whatsapp, is_test)
values ('TESTE Roda da Ansiedade', current_date + 7, '20:00', 'Agendada', 'Premium', 'https://chat.whatsapp.com/teste', true)
on conflict do nothing;

-- Clube de teste
insert into public.clube_holos (livro, tipo_livro, mes, data_prevista, status, is_test)
values ('TESTE — O Poder do Agora', 'secular', 'Junho 2025', current_date + 14, 'ativo', true)
on conflict do nothing;

-- Store de teste
insert into public.store_itens (nome, categoria, link_afiliado, ativo, is_test)
values
  ('TESTE Journal Holos', 'Journals', 'https://example.com/journal-teste', true, true),
  ('TESTE Livro Autoconhecimento', 'Livros', 'https://example.com/livro-teste', true, true),
  ('TESTE Caneca Holos', 'Canecas', 'https://example.com/caneca-teste', true, true)
on conflict do nothing;

-- ============================================================
-- USUÁRIOS DE TESTE
-- Criar manualmente em Authentication > Users no Supabase
-- Depois rode os UPDATEs abaixo com os IDs gerados
-- ============================================================

-- Após criar os usuários no Auth, execute:
-- UPDATE public.perfis SET nome='TESTE Usuário Premium', plano='Premium', is_test=true WHERE email='usuario.premium.teste@holos.test';
-- UPDATE public.perfis SET nome='TESTE Usuário Free', plano='Gratuito', is_test=true WHERE email='usuario.free.teste@holos.test';
-- UPDATE public.perfis SET nome='TESTE Admin', perfil='Admin', is_test=true WHERE email='admin.teste@holos.test';

-- ============================================================
-- FIM DO PATCH 3
-- ============================================================

-- Tabela gratidao (diário de gratidão)
create table if not exists public.gratidao (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  data date not null,
  item1 text,
  item2 text,
  item3 text,
  created_at timestamptz default now(),
  unique(user_id, data)
);

alter table public.gratidao enable row level security;
create policy "usuario_ve_propria_gratidao" on public.gratidao for all using (user_id = auth.uid());

-- Tabela curtidas ("Isso me ajudou")
create table if not exists public.curtidas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  conteudo_id uuid references public.conteudos(id) on delete cascade,
  dimensao text,
  created_at timestamptz default now(),
  unique(user_id, conteudo_id)
);
alter table public.curtidas enable row level security;
create policy "usuario_gerencia_curtidas" on public.curtidas for all using (user_id = auth.uid());

-- Profissionais de TESTE (sem dados reais)
insert into public.profissionais (nome, email_contato, especialidades, bio, status, plano, is_test)
values
  ('TESTE Helena', 'helena.teste@holos.test', 'Psicanálise • Ansiedade • Autoestima', 'Perfil fictício para teste da Plataforma Holos. Psicanalista com foco em autoconhecimento e desenvolvimento pessoal.', 'Ativo', 'Premium', true),
  ('TESTE Rafael', 'rafael.teste@holos.test', 'Psicologia • Burnout • Propósito', 'Perfil fictício para teste da Plataforma Holos. Psicólogo com experiência em saúde mental no trabalho.', 'Ativo', 'Gratuito', true),
  ('TESTE Miriam', 'miriam.teste@holos.test', 'Terapia Integrativa • Relacionamentos • Luto', 'Perfil fictício para teste da Plataforma Holos. Terapeuta integrativa especializada em transições de vida.', 'Ativo', 'Gratuito', true)
on conflict do nothing;

-- Campos de consentimento no perfil
alter table public.perfis add column if not exists aceite_diario boolean default false;
alter table public.perfis add column if not exists aceite_gratidao boolean default false;
