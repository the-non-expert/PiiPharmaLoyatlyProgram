-- ─────────────────────────────────────────────────────────────────────────
-- QR Batch tables (issue #23)
-- qr_batches: one row per print run
-- qr_serials: one row per physical sticker
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists qr_batches (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references products(id) on delete restrict,
  batch_label      text not null,
  serial_prefix    text not null,
  quantity         int  not null check (quantity >= 1),
  serial_start     text not null,
  serial_end       text not null,
  serial_start_num int  not null,
  created_at       timestamptz default now()
);

create index if not exists qr_batches_product_id_idx on qr_batches(product_id);
create index if not exists qr_batches_prefix_idx     on qr_batches(serial_prefix);

create table if not exists qr_serials (
  id         uuid primary key default gen_random_uuid(),
  batch_id   uuid not null references qr_batches(id) on delete cascade,
  serial     text unique not null,
  hmac       text not null,
  created_at timestamptz default now()
);

create index if not exists qr_serials_batch_id_idx on qr_serials(batch_id);
-- text_pattern_ops enables LIKE 'PREFIX-%' queries to use the index
create index if not exists qr_serials_serial_prefix_idx on qr_serials(serial text_pattern_ops);
