import { useState, useEffect } from 'react';
import { Search, Edit2, Shield, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types/database';

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
  const [formData, setFormData] = useState({
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
    try {
      if (editingUser) {
        const { error } = await supabase.from('app_users').update({
          name: formData.name,
          role: formData.role,
          permissions: formData.permissions
        }).eq('id', editingUser.id);
        if (error) throw error;
      }
      setShowForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan saat menyimpan data.');
      console.error('Error saving user:', error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      role: user.role || 'admin',
      permissions: user.permissions || [],
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Pengguna</h1>
          <p className="text-slate-500 mt-1">Kelola hak akses dan peran staf (Tambah user melalui Supabase Dashboard)</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Informasi Pembuatan Akun Baru</p>
          <p>Karena alasan keamanan, pembuatan akun baru tidak dapat dilakukan langsung dari aplikasi. Silakan undang pengguna baru melalui <strong>Supabase Dashboard (Authentication {'>'} Users {'>'} Invite)</strong>. Setelah pengguna menerima undangan dan login, akun mereka akan otomatis muncul di daftar ini untuk Anda atur perannya.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-64">
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
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Hak Akses"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Atur Hak Akses Pengguna
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Pengguna</label>
                <input
                  type="email"
                  disabled
                  value={editingUser.email}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg outline-none cursor-not-allowed"
                />
              </div>

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

              {formData.role?.toLowerCase() !== 'admin' && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hak Akses Modul</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                    {AVAILABLE_MODULES.map(module => (
                      <label key={module} className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(module)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, permissions: [...formData.permissions, module] });
                            } else {
                              setFormData({ ...formData, permissions: formData.permissions.filter(m => m !== module) });
                            }
                          }}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        {module}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
