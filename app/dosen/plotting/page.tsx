'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';  
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';

interface Dosen {
  id: string;
  nama: string;
  nip: string;
  bidangKeahlian: string;
  kuota: number;
  terisi: number;
  noTelp?: string;
}

export default function PlottingDosenPage() {
  const router = useRouter();
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // eslint-disable-next-line react-hooks/immutability
    fetchDosenList();
  }, [router]);

  const fetchDosenList = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDosenList();
      // Response dari API biasanya berbentuk { success: true, data: [...] }
      const dosenData = response.data || response;
      setDosenList(dosenData);
      setError('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to fetch dosen:', err);
      setError('Gagal mengambil data dosen');
    } finally {
      setIsLoading(false);
    }
  };

  const getKuotaStatus = (terisi: number, kuota: number) => {
    if (terisi >= kuota) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-green-100 text-green-800';
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
                <p className="text-gray-600 mt-4">Memuat data dosen...</p>
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
                <h1 className="text-2xl font-bold text-gray-600">Plotting Dosen Pembimbing</h1>
                <p className="text-gray-600 mt-1">Kelola dosen pembimbing mahasiswa</p>
              </div>
              <Button variant="primary" onClick={() => router.push('/dosen/tambah')}>
                + Tambah Dosen
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
                    <th className="text-left p-3 text-gray-600 font-medium">Nama Dosen</th>
                    <th className="text-left p-3 text-gray-600 font-medium">NIP</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Bidang Keahlian</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Kuota</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dosenList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-gray-600">
                        Belum ada data dosen. Silakan tambah dosen terlebih dahulu.
                      </td>
                    </tr>
                  ) : (
                    dosenList.map((dosen) => (
                      <tr key={dosen.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                        <td className="p-3 font-medium text-gray-600">{dosen.nama}</td>
                        <td className="p-3 text-gray-600">{dosen.nip}</td>
                        <td className="p-3 text-gray-600">{dosen.bidangKeahlian}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getKuotaStatus(dosen.terisi, dosen.kuota)}`}>
                            {dosen.terisi}/{dosen.kuota}
                          </span>
                        </td>
                        <td className="p-3">
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => router.push(`/dosen/${dosen.id}/bimbingan`)}
                          >
                            Atur Bimbingan
                          </Button>
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