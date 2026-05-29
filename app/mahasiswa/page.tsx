'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface Mahasiswa {
  id: string;
  userId: string;
  nama: string;
  nim: string;
  angkatan: number;
  noTelp?: string;
  alamat?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
  };
}

interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

export default function KelolaMahasiswaPage() {
  const router = useRouter();
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMahasiswa, setEditingMahasiswa] = useState<Mahasiswa | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [angkatanFilter, setAngkatanFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    email: '',
    password: '',
    angkatan: new Date().getFullYear(),
    noTelp: '',
    alamat: '',
  });

  // Cek role saat load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // ✅ HANYA ADMIN yang bisa akses halaman ini!
    if (role !== 'ADMIN') {
      alert('Halaman ini khusus untuk Admin. Anda tidak memiliki akses.');
      router.push('/dashboard');
      return;
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserRole(role);
    // eslint-disable-next-line react-hooks/immutability
    fetchMahasiswa();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchMahasiswa = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.getMahasiswaList();
      const data = Array.isArray(response) ? response : response?.data || [];
      setMahasiswaList(data);
    } catch (error) {
      console.error('Failed to fetch mahasiswa:', error);
      alert('Gagal mengambil data mahasiswa');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMahasiswa) {
        // Update mahasiswa
        await api.updateMahasiswa(editingMahasiswa.id, {
          nama: formData.nama,
          noTelp: formData.noTelp,
          alamat: formData.alamat,
        });
        alert('✅ Data mahasiswa berhasil diupdate!');
      } else {
        // Create mahasiswa baru
        if (!formData.password || formData.password.length < 6) {
          alert('Password minimal 6 karakter!');
          return;
        }
        
        await api.createMahasiswa({
          email: formData.email,
          password: formData.password,
          nama: formData.nama,
          nim: formData.nim,
          angkatan: formData.angkatan,
          noTelp: formData.noTelp,
          alamat: formData.alamat,
        });
        alert('✅ Mahasiswa berhasil ditambahkan!');
      }
      
      setIsModalOpen(false);
      resetForm();
      fetchMahasiswa();
    } catch (err: unknown) {
      const error = err as ApiError;
      alert('❌ Gagal: ' + (error.message || 'Terjadi kesalahan'));
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus mahasiswa "${nama}"?\n\nTindakan ini tidak dapat dibatalkan!`)) {
      return;
    }
    
    try {
      await api.deleteMahasiswa(id);
      alert('✅ Mahasiswa berhasil dihapus!');
      fetchMahasiswa();
    } catch (err: unknown) {
      const error = err as ApiError;
      alert('❌ Gagal hapus: ' + (error.message || 'Terjadi kesalahan'));
    }
  };

  const handleEdit = (mahasiswa: Mahasiswa) => {
    setEditingMahasiswa(mahasiswa);
    setFormData({
      nama: mahasiswa.nama,
      nim: mahasiswa.nim,
      email: mahasiswa.user?.email || '',
      password: '',
      angkatan: mahasiswa.angkatan,
      noTelp: mahasiswa.noTelp || '',
      alamat: mahasiswa.alamat || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingMahasiswa(null);
    setFormData({
      nama: '',
      nim: '',
      email: '',
      password: '',
      angkatan: new Date().getFullYear(),
      noTelp: '',
      alamat: '',
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Filter mahasiswa berdasarkan search dan angkatan
  const filteredMahasiswa = mahasiswaList.filter(m => {
    const matchesSearch = 
      m.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nim.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAngkatan = angkatanFilter === 'all' || m.angkatan.toString() === angkatanFilter;
    return matchesSearch && matchesAngkatan;
  });

  // Get unique angkatan for filter
  const uniqueAngkatan = [...new Set(mahasiswaList.map(m => m.angkatan))].sort((a, b) => b - a);

  // Statistik
  const stats = {
    total: mahasiswaList.length,
    totalAngkatan: uniqueAngkatan.length,
    latestAngkatan: uniqueAngkatan[0] || '-',
  };

  if (userRole !== 'ADMIN') return null;

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  📚 Kelola Mahasiswa
                </h1>
                <p className="text-gray-500 mt-1">
                  Tambah, edit, atau hapus data mahasiswa
                </p>
              </div>
              <Button variant="primary" onClick={openAddModal}>
                + Tambah Mahasiswa
              </Button>
            </div>

            {/* Statistik Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600">Total Mahasiswa</p>
                <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600">Total Angkatan</p>
                <p className="text-2xl font-bold text-green-700">{stats.totalAngkatan}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600">Angkatan Terbaru</p>
                <p className="text-2xl font-bold text-purple-700">{stats.latestAngkatan}</p>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex-1 min-w-50">
                <input
                  type="text"
                  placeholder="🔍 Cari nama atau NIM..."
                  className="w-full px-3 py-2 border rounded-lg text-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500"
                value={angkatanFilter}
                onChange={(e) => setAngkatanFilter(e.target.value)}
              >
                <option value="all">Semua Angkatan</option>
                {uniqueAngkatan.map(angkatan => (
                  <option key={angkatan} value={angkatan}>{angkatan}</option>
                ))}
              </select>
              <Button variant="secondary" onClick={fetchMahasiswa}>
                🔄 Refresh
              </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Memuat data mahasiswa...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredMahasiswa.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-700">Belum ada data mahasiswa</h3>
                <p className="text-gray-500 mt-1">
                  {searchTerm || angkatanFilter !== 'all' 
                    ? 'Tidak ada mahasiswa yang sesuai dengan filter' 
                    : 'Klik tombol "Tambah Mahasiswa" untuk menambahkan'}
                </p>
              </div>
            )}

            {/* Table */}
            {!isLoading && filteredMahasiswa.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-gray-600 font-medium">No</th>
                      <th className="text-left p-3 text-gray-600 font-medium">Nama</th>
                      <th className="text-left p-3 text-gray-600 font-medium">NIM</th>
                      <th className="text-left p-3 text-gray-600 font-medium">Email</th>
                      <th className="text-left p-3 text-gray-600 font-medium">Angkatan</th>
                      <th className="text-left p-3 text-gray-600 font-medium">No. Telp</th>
                      <th className="text-left p-3 text-gray-600 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMahasiswa.map((m, index) => (
                      <tr key={m.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                        <td className="p-3 text-gray-600">{index + 1}</td>
                        <td className="p-3 font-medium text-gray-800">{m.nama}</td>
                        <td className="p-3 text-gray-600">{m.nim}</td>
                        <td className="p-3 text-gray-600">{m.user?.email || '-'}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                            {m.angkatan}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{m.noTelp || '-'}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(m)}
                            >
                              ✏️ Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(m.id, m.nama)}
                            >
                              🗑️ Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Tambah/Edit Mahasiswa */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }} 
        title={editingMahasiswa ? "✏️ Edit Mahasiswa" : "➕ Tambah Mahasiswa"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIM <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                value={formData.nim}
                onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                required
                disabled={!!editingMahasiswa}
              />
              {editingMahasiswa && (
                <p className="text-xs text-gray-400 mt-1">NIM tidak dapat diubah</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Angkatan <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                value={formData.angkatan}
                onChange={(e) => setFormData({ ...formData, angkatan: parseInt(e.target.value) })}
                required
                min={2000}
                max={new Date().getFullYear() + 5}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={!!editingMahasiswa}
            />
            {editingMahasiswa && (
              <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
            )}
          </div>

          {!editingMahasiswa && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Minimal 6 karakter"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Telepon
              </label>
              <input
                type="tel"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
                value={formData.noTelp}
                onChange={(e) => setFormData({ ...formData, noTelp: e.target.value })}
                placeholder="081234567890"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              placeholder="Jl. Contoh No. 123, Kota"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary">
              {editingMahasiswa ? 'Update Data' : 'Simpan Mahasiswa'}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}