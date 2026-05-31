// app/judul/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';

interface PengajuanJudul {
  id: string;
  mahasiswaId: string;
  judul: string;
  abstrak?: string;
  dosenPembimbingId?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  catatan?: string;
  tglAjukan: string;
  tglApproved?: string;
  mahasiswa?: { id: string; nama: string; nim: string; angkatan?: number };
  dosenPembimbing?: { id: string; nama: string; nip: string } | null;
}

interface PengajuanItem {
  id: string;
  mahasiswa: string;
  mahasiswaId: string;
  nim: string;
  angkatan?: number;
  judul: string;
  abstrak?: string;
  status: 'pending' | 'approved' | 'rejected';
  tglAjukan: string;
  catatan?: string;
}

export default function ReviewJudulDosenPage() {
  const router = useRouter();
  const [pengajuanList, setPengajuanList] = useState<PengajuanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    const init = async () => {
      try {
        const me = await api.getMe();
        const role = me.data?.user?.role;
        if (role !== 'DOSEN') {
          router.push('/dashboard');
          return;
        }
        await fetchPengajuan();
      } catch {
        router.push('/login');
      }
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchPengajuan = async () => {
    try {
      setIsLoading(true);
      const data = await api.getPengajuanList();
      const formatted: PengajuanItem[] = (data || []).map((item: PengajuanJudul) => ({
        id: item.id,
        mahasiswa: item.mahasiswa?.nama || 'Unknown',
        mahasiswaId: item.mahasiswaId,
        nim: item.mahasiswa?.nim || '-',
        angkatan: item.mahasiswa?.angkatan,
        judul: item.judul,
        abstrak: item.abstrak,
        status: item.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
        tglAjukan: new Date(item.tglAjukan).toLocaleDateString('id-ID'),
        catatan: item.catatan,
      }));

      setPengajuanList(formatted);
      setError('');
    } catch (err) {
      console.error('Failed to fetch pengajuan:', err);
      setError('Gagal mengambil data pengajuan judul');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = pengajuanList.filter((item) => {
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    const searchMatch = searchQuery === '' ||
      item.mahasiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.judul.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const stats = {
    pending: pengajuanList.filter((item) => item.status === 'pending').length,
    approved: pengajuanList.filter((item) => item.status === 'approved').length,
    rejected: pengajuanList.filter((item) => item.status === 'rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (item: PengajuanItem) => {
    const catatan = prompt(`Catatan approval untuk judul:\n${item.judul}\n\nBoleh dikosongkan jika tidak ada catatan.`) || '';
    try {
      await api.approvePengajuan(item.id, catatan);
      alert('✅ Judul berhasil disetujui. Mahasiswa akan masuk ke daftar Mahasiswa Bimbingan.');
      await fetchPengajuan();
    } catch (err) {
      alert('Gagal approve judul: ' + (err as Error).message);
    }
  };

  const handleReject = async (item: PengajuanItem) => {
    const catatan = prompt(`Masukkan alasan penolakan untuk judul:\n${item.judul}`);
    if (!catatan || !catatan.trim()) return;

    try {
      await api.rejectPengajuan(item.id, catatan.trim());
      alert('Judul berhasil ditolak. Catatan penolakan akan tampil pada status pengajuan mahasiswa.');
      await fetchPengajuan();
    } catch (err) {
      alert('Gagal reject judul: ' + (err as Error).message);
    }
  };

  const handleView = (item: PengajuanItem) => {
    alert(
      `Detail Pengajuan:\n\n` +
      `Mahasiswa: ${item.mahasiswa}\n` +
      `NIM: ${item.nim}\n` +
      `Angkatan: ${item.angkatan || '-'}\n` +
      `Judul: ${item.judul}\n` +
      `Tanggal: ${item.tglAjukan}\n` +
      `Status: ${item.status.toUpperCase()}\n` +
      `Catatan: ${item.catatan || '-'}\n\n` +
      `Abstrak:\n${item.abstrak || '-'}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <div className="bg-white rounded-xl p-6 shadow-sm text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
              <p className="text-gray-600 mt-4">Memuat pengajuan judul...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 mb-6 text-white">
            <h1 className="text-2xl font-bold">Review Pengajuan Judul</h1>
            <p className="text-green-100 mt-1">Dosen menyetujui atau menolak judul yang sudah diassign oleh Admin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-gray-500 text-sm">Menunggu Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-gray-500 text-sm">Judul Disetujui</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <p className="text-gray-500 text-sm">Judul Ditolak</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-700">Daftar Judul yang Diassign ke Saya</h2>
                <p className="text-gray-500 mt-1">Hanya judul yang sudah dipilihkan Admin untuk Anda.</p>
              </div>
              <Button variant="secondary" onClick={fetchPengajuan}>🔄 Refresh</Button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">{error}</div>}

            <div className="flex gap-3 mb-6">
              <select className="px-3 py-2 border rounded-lg text-gray-600" value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}>
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Review</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
              <input
                type="text"
                placeholder="Cari mahasiswa, NIM, atau judul..."
                className="flex-1 px-3 py-2 border rounded-lg text-gray-600 placeholder-gray-400"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-gray-600 font-medium">Mahasiswa</th>
                    <th className="text-left p-3 text-gray-600 font-medium">NIM</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Judul</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Tanggal</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center p-8 text-gray-500">Tidak ada pengajuan sesuai filter.</td></tr>
                  ) : (
                    filtered.map((item) => (
                      <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                        <td className="p-3 font-medium text-gray-700">{item.mahasiswa}</td>
                        <td className="p-3 text-gray-600">{item.nim}</td>
                        <td className="p-3 text-gray-600 max-w-md truncate">{item.judul}</td>
                        <td className="p-3 text-gray-600">{item.tglAjukan}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 flex-wrap">
                            {item.status === 'pending' && (
                              <>
                                <Button variant="success" size="sm" onClick={() => handleApprove(item)}>Approve</Button>
                                <Button variant="danger" size="sm" onClick={() => handleReject(item)}>Reject</Button>
                              </>
                            )}
                            <Button variant="secondary" size="sm" onClick={() => handleView(item)}>Detail</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
