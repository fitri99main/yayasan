-- 1. App Users (Roles and Permissions)
CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  role text DEFAULT 'admin',
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auto-sync auth.users to app_users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.app_users (id, email, name, role, permissions)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'admin'),
    COALESCE(new.raw_user_meta_data->>'permissions', '[]')::jsonb
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Akuntansi Tables
CREATE TABLE IF NOT EXISTS public.daftar_akun (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yayasan_id uuid NOT NULL REFERENCES public.yayasan(id) ON DELETE CASCADE,
  kode text NOT NULL,
  nama text NOT NULL,
  kategori text NOT NULL, -- Aktiva, Pasiva, Modal, Pendapatan, Beban
  saldo_normal text NOT NULL, -- Debit, Kredit
  keterangan text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jurnal_umum (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yayasan_id uuid NOT NULL REFERENCES public.yayasan(id) ON DELETE CASCADE,
  tanggal date NOT NULL,
  nomor_bukti text NOT NULL,
  keterangan text NOT NULL,
  total_debit numeric NOT NULL DEFAULT 0,
  total_kredit numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES public.app_users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jurnal_detail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurnal_id uuid NOT NULL REFERENCES public.jurnal_umum(id) ON DELETE CASCADE,
  akun_id uuid NOT NULL REFERENCES public.daftar_akun(id) ON DELETE RESTRICT,
  debit numeric NOT NULL DEFAULT 0,
  kredit numeric NOT NULL DEFAULT 0,
  keterangan text
);

-- RLS
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daftar_akun ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_umum ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurnal_detail ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_users_select_all" ON public.app_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "app_users_update_all" ON public.app_users FOR UPDATE TO authenticated USING (true);
CREATE POLICY "app_users_insert_all" ON public.app_users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "app_users_delete_all" ON public.app_users FOR DELETE TO authenticated USING (true);

CREATE POLICY "akun_select_all" ON public.daftar_akun FOR SELECT TO authenticated USING (true);
CREATE POLICY "akun_insert_all" ON public.daftar_akun FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "akun_update_all" ON public.daftar_akun FOR UPDATE TO authenticated USING (true);
CREATE POLICY "akun_delete_all" ON public.daftar_akun FOR DELETE TO authenticated USING (true);

CREATE POLICY "jurnal_select_all" ON public.jurnal_umum FOR SELECT TO authenticated USING (true);
CREATE POLICY "jurnal_insert_all" ON public.jurnal_umum FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "jurnal_update_all" ON public.jurnal_umum FOR UPDATE TO authenticated USING (true);
CREATE POLICY "jurnal_delete_all" ON public.jurnal_umum FOR DELETE TO authenticated USING (true);

CREATE POLICY "jurnal_detail_select_all" ON public.jurnal_detail FOR SELECT TO authenticated USING (true);
CREATE POLICY "jurnal_detail_insert_all" ON public.jurnal_detail FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "jurnal_detail_update_all" ON public.jurnal_detail FOR UPDATE TO authenticated USING (true);
CREATE POLICY "jurnal_detail_delete_all" ON public.jurnal_detail FOR DELETE TO authenticated USING (true);
