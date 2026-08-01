import { useState, useEffect } from 'react';
import { Search, Edit2, Shield, Info, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types/database';
import { createClient } from '@supabase/supabase-js';

const AVAILABLE_MODULES = [
  'Dashboard', 'Yayasan', 'Sekolah', 'Divisi', 'Jabatan', 'Pegawai', 
  'Absensi', 'Gaji', 'Cuti', 'Daftar Akun', 'Jurnal Umum', 'Buku Besar', 
  'Laba Rugi', 'Neraca', 'Pengguna'
];

export default function Pengguna() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'admin',
    permissions: [] as string[],
  });

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('app_users').select('*');
      if (error) throw error;
      setUsers(data as any || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        // Edit mode
        const { error } = await supabase.from('app_users').update({
          name: formData.name,
          role: formData.role,
          permissions: formData.permissions
        }).eq('id', editingUser.id);
        if (error) throw error;
      } else {
        // Tambah pengguna baru tanpa melogout admin (gunakan client sementara tanpa sesi)
        const authClient = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY,
          { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
        );

        const { data, error } = await authClient.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          // Tunggu trigger Postgres membuat user di tabel app_users
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update data nama dan role-nya
          await supabase.from('app_users').update({
            name: formData.name,
            role: formData.role,
            permissions: formData.permissions
          }).eq('id', data.user.id);
        }
      }
      setShowForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan saat menyimpan data.');
      console.error('Error saving user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      password: '', // Kosongkan password saat edit
      name: user.name || '',
      role: user.role || 'admin',
      permissions: user.permissions || [],
    });
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'hrd',
      permissions: [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akses untuk pengguna ${name}? (Data ini akan terhapus dari aplikasi)`)) {
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.from('app_users').delete().eq('id', id);
      if (error) throw error;
      fetchUsers();
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan saat menghapus pengguna.');
      console.error('Error deleting user:', error);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-slate-500 mt-1">Kelola hak akses, peran, dan tambah staf baru</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Informasi Pembuatan Akun Baru</p>
          <p>Jika pengguna yang baru didaftarkan tidak dapat login, pastikan Anda telah menonaktifkan fitur <strong>"Confirm email"</strong> di menu Authentication {'->'} Providers {'->'} Email di pengaturan Supabase Dashboard, atau minta pengguna tersebut untuk memverifikasi email mereka.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-full max-w-xs">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Nama</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Email</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Peran</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Belum ada pengguna terdaftar</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{user.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'hrd' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Hak Akses"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name || user.email || '')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Pengguna"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                {editingUser ? 'Atur Hak Akses Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Pengguna</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 ${editingUser ? 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed' : 'border-slate-300'}`}
                  placeholder="email@contoh.com"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Masukkan nama pengguna"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Peran (Role)</label>
                <input
                  type="text"
                  required
                  list="role-suggestions"
                  value={formData.role}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    let newPermissions = formData.permissions;
                    
                    const existingUser = users.find(
                      u => u.role?.toLowerCase() === newRole.toLowerCase() && u.permissions && u.permissions.length > 0
                    );
                    
                    if (existingUser && existingUser.permissions) {
                      newPermissions = existingUser.permissions;
                    }
                    
                    setFormData({ ...formData, role: newRole, permissions: newPermissions });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ketik peran (mis. admin, hrd)"
                />
                <datalist id="role-suggestions">
                  {Array.from(new Set(users.map(u => u.role).filter(Boolean))).map(role => (
                    <option key={role} value={role} />
                  ))}
                </datalist>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">Hak Akses Modul</label>
                
                {formData.role?.toLowerCase() === 'admin' ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-2">
                    <p className="text-sm text-emerald-800 font-medium">Peran Admin memiliki akses penuh ke seluruh modul.</p>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                  {AVAILABLE_MODULES.map(module => {
                    const isAdmin = formData.role?.toLowerCase() === 'admin';
                    return (
                      <label key={module} className={`flex items-center gap-2 text-sm ${isAdmin ? 'text-slate-400 cursor-not-allowed' : 'text-slate-600'}`}>
                        <input
                          type="checkbox"
                          disabled={isAdmin}
                          checked={isAdmin ? true : formData.permissions.includes(module)}
                          onChange={(e) => {
                            if (isAdmin) return;
                            if (e.target.checked) {
                              setFormData({ ...formData, permissions: [...formData.permissions, module] });
                            } else {
                              setFormData({ ...formData, permissions: formData.permissions.filter(m => m !== module) });
                            }
                          }}
                          className={`rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 ${isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
                        />
                        {module}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
