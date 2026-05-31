// app/berkas/page.tsx
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
  judul: string;
  abstrak?: string;
  dosenPembimbingId?: string | null;
  dosenPembimbing?: string;
  status: 'pending' | 'approved' | 'rejected';
  tglAjukan: string;
  catatan?: string;
}

export default function PengajuanJudulAdminPage() {
  const router = useRouter();
  const [pengajuanList, setPengajuanList] = useState<PengajuanItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    const init = async () => {
      try {
        const me = await api.getMe();
        const role = me.data?.user?.role;
        if (role !== 'ADMIN') {
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
        judul: item.judul,
        abstrak: item.abstrak,
        dosenPembimbingId: item.dosenPembimbingId,
        dosenPembimbing: item.dosenPembimbing?.nama,
        status: item.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
        tglAjukan: new Date(item.tglAjukan).toLocaleDateString('id-ID'),
        catatan: item.catatan,
      }));

      setPengajuanList(formatted);
      setError('');
    } catch (err) {
      console.error('Failed to fetch pengajuan:', err);
      setError('Gagal mengambil data pengajuan');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (item: PengajuanItem) => {
    if (item.status === 'approved') {
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">APPROVED</span>;
    }
    if (item.status === 'rejected') {
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">REJECTED</span>;
    }
    if (item.dosenPembimbingId) {
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">MENUNGGU REVIEW DOSEN</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">PERLU ASSIGN DOSEN</span>;
  };

  const handleAssign = async (id: string) => {
    try {
      const dosenData = await api.getDosenList();
      const dosenList = dosenData || [];
      if (dosenList.length === 0) {
        alert('Belum ada data dosen. Tambahkan dosen terlebih dahulu.');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dosenOptions = dosenList.map((d: any) => `${d.nama} (${d.nip}) — sisa kuota: ${Number(d.kuota) - Number(d.terisi)}`).join('\n');
      const pilihan = prompt('Pilih Dosen Pembimbing yang akan di-assign:\n(ketik nama persis)\n\n' + dosenOptions);
      if (!pilihan) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dosen = dosenList.find((d: any) => pilihan.trim().toLowerCase() === String(d.nama).trim().toLowerCase() || pilihan.includes(d.nama));
      if (!dosen) {
        alert('Nama dosen tidak ditemukan. Pastikan nama yang diketik sesuai daftar.');
        return;
      }

      await api.assignDosenPembimbing(id, dosen.id);
      alert(`✅ Dosen pembimbing "${dosen.nama}" berhasil di-assign. Status judul masih PENDING dan menunggu approval/reject dari dosen.`);
      await fetchPengajuan();
    } catch (err) {
      alert('Gagal assign dosen: ' + (err as Error).message);
    }
  };

  const handleView = (item: PengajuanItem) => {
    alert(
      `Detail Pengajuan:\n\n` +
      `Judul: ${item.judul}\n` +
      `Mahasiswa: ${item.mahasiswa}\n` +
      `NIM: ${item.nim}\n` +
      `Tanggal: ${item.tglAjukan}\n` +
      `Status: ${item.status.toUpperCase()}\n` +
      `Dosen Pembimbing: ${item.dosenPembimbing || '-'}\n` +
      `Catatan Dosen/Admin: ${item.catatan || '-'}\n\n` +
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="text-gray-600 mt-4">Memuat data pengajuan...</p>
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
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-700">Pengajuan Judul TA</h1>
                <p className="text-gray-500 mt-1">Admin hanya melakukan assign dosen pembimbing. Approval/reject judul dilakukan oleh dosen yang ditugaskan.</p>
              </div>
              <Button variant="primary" onClick={fetchPengajuan}>🔄 Refresh</Button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">{error}</div>}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-gray-600 font-medium">Mahasiswa</th>
                    <th className="text-left p-3 text-gray-600 font-medium">NIM</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Judul</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Dosen Pembimbing</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Tanggal</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pengajuanList.length === 0 ? (
                    <tr><td colSpan={7} className="text-center p-8 text-gray-500">Belum ada pengajuan judul</td></tr>
                  ) : (
                    pengajuanList.map((item) => (
                      <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                        <td className="p-3 font-medium text-gray-700">{item.mahasiswa}</td>
                        <td className="p-3 text-gray-600">{item.nim}</td>
                        <td className="p-3 text-gray-600 max-w-md truncate">{item.judul}</td>
                        <td className="p-3 text-gray-600">{item.dosenPembimbing || '-'}</td>
                        <td className="p-3 text-gray-600">{item.tglAjukan}</td>
                        <td className="p-3">{getStatusBadge(item)}</td>
                        <td className="p-3">
                          <div className="flex gap-2 flex-wrap">
                            {item.status === 'pending' && (
                              <Button variant="success" size="sm" onClick={() => handleAssign(item.id)}>
                                {item.dosenPembimbingId ? 'Ganti Dosen' : 'Assign Dosen'}
                              </Button>
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
