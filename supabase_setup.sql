-- Habilita a extensão UUID se necessário
create extension if not exists "uuid-ossp";

-- 1. TABELA DE CONFIGURAÇÕES DA ARENA
create table if not exists settings (
  id text primary key default 'default',
  name text not null default 'Gestão Arenas',
  address text default 'Av. das Flores, 1230 - Centro',
  phone text default '(11) 98888-7777',
  open_time text default '08:00',
  close_time text default '23:00',
  pix_key text default 'financeiro@gestaoarenas.com',
  bank_name text default 'Banco Cora',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insere a configuração padrão inicial
insert into settings (id, name) values ('default', 'Gestão Arenas') on conflict (id) do nothing;

-- 2. TABELA DE CAMPOS / QUADRAS
create table if not exists fields (
  id text primary key,
  name text not null,
  sport text not null,
  price_per_hour numeric not null,
  status text default 'active',
  color text default 'blue',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TABELA DE CLIENTES
create table if not exists customers (
  id text primary key,
  name text not null,
  phone text,
  email text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABELA DE AGENDAMENTOS (DIARISTAS)
create table if not exists bookings (
  id text primary key,
  customer_name text not null,
  customer_phone text,
  field_id text references fields(id) on delete cascade,
  field_name text not null,
  sport text not null,
  date text not null,
  time_slot text not null,
  price numeric not null,
  paid boolean default false,
  payment_method text default 'Pix',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TABELA DE BLOQUEIOS DE HORÁRIOS
create table if not exists blocked_slots (
  id text primary key,
  field_id text references fields(id) on delete cascade,
  date text not null,
  time_slot text not null,
  type text default 'single',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. TABELA DE MENSALISTAS
create table if not exists mensalistas (
  id text primary key,
  customer_name text not null,
  customer_phone text,
  field_id text references fields(id) on delete cascade,
  field_name text not null,
  sport text not null,
  day_of_week integer not null,
  time_slot text not null,
  price numeric not null,
  active boolean default true,
  recurrence text default 'weekly',
  payment_method text default 'Pix',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. TABELA DE EVENTOS
create table if not exists eventos (
  id text primary key,
  title text not null,
  description text,
  date text not null,
  start_time text not null,
  end_time text not null,
  price numeric not null,
  field_id text references fields(id) on delete cascade,
  field_name text not null,
  recurrence text default 'once',
  payment_method text default 'Pix',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. TABELA DE CONTAS A PAGAR
create table if not exists accounts_payable (
  id text primary key,
  description text not null,
  amount numeric not null,
  due_date text not null,
  category text not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. TABELA DE PRODUTOS (ESTOQUE)
create table if not exists products (
  id text primary key,
  name text not null,
  category text not null,
  quantity integer not null default 0,
  min_quantity integer default 0,
  cost_price numeric default 0,
  sale_price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. TABELA DE VENDAS
create table if not exists sales (
  id text primary key,
  product_id text references products(id) on delete set null,
  product_name text not null,
  quantity integer not null,
  total numeric not null,
  payment_method text default 'Pix',
  customer_name text default 'Consumidor Final',
  date text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. TABELA DE TRANSAÇÕES FINANCEIRAS (FLUXO DE CAIXA)
create table if not exists transactions (
  id text primary key,
  description text not null,
  amount numeric not null,
  type text not null, -- 'income' ou 'expense'
  category text not null,
  date text not null,
  payment_method text default 'Pix',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);