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
  dosenPembimbingId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  catatan?: string;
  tglAjukan: string;
  tglApproved?: string;
  mahasiswa?: {
    nama: string;
    nim: string;
  };
}

interface BerkasItem {
  id: string;
  mahasiswa: string;
  mahasiswaId: string;
  nim: string;
  jenis: string;
  judul: string;
  status: 'pending' | 'approved' | 'rejected';
  tglUpload: string;
}

export default function ApprovalBerkasPage() {
  const router = useRouter();
  const [berkasList, setBerkasList] = useState<BerkasItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // eslint-disable-next-line react-hooks/immutability
    fetchPengajuan();
  }, [router]);

  const fetchPengajuan = async () => {
    try {
      setIsLoading(true);
      const response = await api.getPengajuanList();
      const pengajuanData = response.data || response;
      
      // Transform data pengajuan ke format BerkasItem
      const formattedData: BerkasItem[] = pengajuanData.map((item: PengajuanJudul) => ({
        id: item.id,
        mahasiswa: item.mahasiswa?.nama || 'Unknown',
        mahasiswaId: item.mahasiswaId,
        nim: item.mahasiswa?.nim || '-',
        jenis: 'Pengajuan Judul',
        judul: item.judul,
        status: item.status.toLowerCase() as 'pending' | 'approved' | 'rejected',
        tglUpload: new Date(item.tglAjukan).toLocaleDateString('id-ID'),
      }));
      
      setBerkasList(formattedData);
      setError('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to fetch pengajuan:', err);
      setError('Gagal mengambil data pengajuan');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const dosenList = await api.getDosenList();
      const dosenData = dosenList.data || dosenList;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dosenOptions = dosenData.map((d: any) => d.nama);
      
      const dosenPembimbing = prompt('Pilih Dosen Pembimbing:\n' + dosenOptions.join('\n'));
      if (!dosenPembimbing) return;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dosen = dosenData.find((d: any) => d.nama === dosenPembimbing);
      if (!dosen) {
        alert('Dosen tidak ditemukan');
        return;
      }
      
      await api.approvePengajuan(id, dosen.id);
      alert('Pengajuan berhasil disetujui!');
      fetchPengajuan();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert('Gagal approve: ' + err.message);
    }
  };

  const handleReject = async (id: string) => {
    const catatan = prompt('Masukkan alasan penolakan:');
    if (catatan) {
      try {
        await api.rejectPengajuan(id, catatan);
        alert('Pengajuan ditolak!');
        fetchPengajuan();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        alert('Gagal reject: ' + err.message);
      }
    }
  };

  const handleView = (item: BerkasItem) => {
    alert(`Detail Pengajuan:\n\nJudul: ${item.judul}\nMahasiswa: ${item.mahasiswa}\nNIM: ${item.nim}\nTanggal: ${item.tglUpload}\nStatus: ${item.status.toUpperCase()}`);
  };

  if (isLoading) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Memuat data pengajuan...</p>
              </div>
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
                <h1 className="text-2xl font-bold text-gray-600">Approval Pengajuan Judul TA</h1>
                <p className="text-gray-600 mt-1">Review dan approve pengajuan judul dari mahasiswa</p>
              </div>
              <Button variant="primary" onClick={() => fetchPengajuan()}>
                🔄 Refresh
              </Button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-gray-600 font-medium">Mahasiswa</th>
                    <th className="text-left p-3 text-gray-600 font-medium">NIM</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Judul</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Tgl Pengajuan</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {berkasList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-gray-600">
                        Belum ada pengajuan judul
                      </td>
                    </tr>
                  ) : (
                    berkasList.map((item) => (
                      <tr key={item.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                        <td className="p-3 font-medium text-gray-600">{item.mahasiswa}</td>
                        <td className="p-3 text-gray-600">{item.nim}</td>
                        <td className="p-3 text-gray-600 max-w-md truncate">{item.judul}</td>
                        <td className="p-3 text-gray-600">{item.tglUpload}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {item.status === 'pending' && (
                              <>
                                <Button 
                                  variant="success" 
                                  size="sm"
                                  onClick={() => handleApprove(item.id)}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="danger" 
                                  size="sm"
                                  onClick={() => handleReject(item.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleView(item)}
                            >
                              Detail
                            </Button>
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