// app/mahasiswa-bimbingan/page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { api } from '@/lib/api';
import { GraduationCap, BookOpen, MessageSquare, Search, Calendar } from 'lucide-react';

interface Mahasiswa {
  id: string;
  nama: string;
  nim: string;
  angkatan?: number;
  judul?: string;
  totalBimbingan: number;
  lastBimbingan: string;
  statusJudul: string;
}

export default function MahasiswaBimbinganPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dosenNama, setDosenNama] = useState('');
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const me = await api.getMe();
      const role = me.data?.user?.role;

      if (role !== 'DOSEN') {
        router.push('/dashboard');
        return;
      }

      setDosenNama(me.data?.profile?.nama || 'Dosen');

      const [pengajuanRes, bimbinganRes] = await Promise.all([
        api.getPengajuanList(),       // BE filter otomatis: hanya mahasiswa yang di-assign ke dosen login
        api.getLogBimbinganByDosen(), // log milik dosen login
      ]);

      const pengajuanList = pengajuanRes || [];
      const bimbinganList = bimbinganRes || [];
      const mahasiswaMap = new Map<string, Mahasiswa>();

      // Daftar utama hanya berasal dari judul yang sudah APPROVED oleh dosen.
      // Judul yang masih PENDING ditampilkan di menu Review Judul, belum masuk mahasiswa bimbingan aktif.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pengajuanList.filter((p: any) => p.status === 'APPROVED' || p.status === 'approved').forEach((p: any) => {
        const mhsId = p.mahasiswaId || p.mahasiswa?.id;
        if (!mhsId) return;
        mahasiswaMap.set(mhsId, {
          id: mhsId,
          nama: p.mahasiswa?.nama || 'Unknown',
          nim: p.mahasiswa?.nim || '-',
          angkatan: p.mahasiswa?.angkatan,
          judul: p.judul,
          statusJudul: p.status || 'APPROVED',
          totalBimbingan: 0,
          lastBimbingan: '',
        });
      });

      // Enrich jumlah pertemuan dari log bimbingan.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bimbinganList.forEach((b: any) => {
        const mhsId = b.mahasiswaId || b.mahasiswa_id || b.mahasiswa?.id;
        if (!mhsId || !mahasiswaMap.has(mhsId)) return;
        const mhs = mahasiswaMap.get(mhsId)!;
        mhs.totalBimbingan += 1;
        if (!mhs.lastBimbingan || b.tanggal > mhs.lastBimbingan) {
          mhs.lastBimbingan = b.tanggal;
        }
      });

      setMahasiswaList(Array.from(mahasiswaMap.values()));
      setError('');
    } catch (err) {
      console.error('Gagal fetch data:', err);
      setError('Gagal memuat data. Coba refresh halaman.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    const timer = setTimeout(() => {
      void fetchData();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, fetchData]);

  const filtered = mahasiswaList.filter(m =>
    searchQuery === '' ||
    m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.nim.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusJudulBadge = (status?: string) => {
    if (!status) return null;
    const cfg: Record<string, { bg: string; text: string; label: string }> = {
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Judul Disetujui' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Judul Pending' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Judul Ditolak' },
    };
    const c = cfg[status] ?? { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
            <p className="mt-4 text-gray-600">Memuat daftar mahasiswa...</p>
          </div>
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
          <div className="bg-linear-to-r from-green-600 to-teal-600 rounded-xl p-6 mb-6 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-7 h-7" />
              Mahasiswa Bimbingan Saya
            </h1>
            <p className="text-green-100 mt-1">Dosen: {dosenNama} — {mahasiswaList.length} mahasiswa terdaftar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full"><GraduationCap className="w-6 h-6 text-green-600" /></div>
              <div><p className="text-gray-500 text-sm">Total Mahasiswa</p><p className="text-2xl font-bold text-gray-700">{mahasiswaList.length}</p></div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full"><MessageSquare className="w-6 h-6 text-blue-600" /></div>
              <div><p className="text-gray-500 text-sm">Total Pertemuan</p><p className="text-2xl font-bold text-gray-700">{mahasiswaList.reduce((s, m) => s + m.totalBimbingan, 0)}</p></div>
            </div>
            <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full"><BookOpen className="w-6 h-6 text-yellow-600" /></div>
              <div><p className="text-gray-500 text-sm">Judul Disetujui</p><p className="text-2xl font-bold text-gray-700">{mahasiswaList.filter(m => m.statusJudul === 'APPROVED').length}</p></div>
            </div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">{error}</div>}

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-700">Daftar Mahasiswa</h2>
              <button onClick={fetchData} className="text-sm text-green-600 hover:text-green-700 font-medium">🔄 Refresh</button>
            </div>

            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIM mahasiswa..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-gray-600 placeholder-gray-400"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">{mahasiswaList.length === 0 ? 'Belum ada mahasiswa bimbingan aktif.' : 'Tidak ada mahasiswa yang sesuai pencarian.'}</p>
                {mahasiswaList.length === 0 && <p className="text-gray-400 text-sm mt-2">Mahasiswa akan muncul setelah Admin mengassign judul dan Anda menyetujui judul tersebut.</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(mhs => (
                  <div key={mhs.id} className="border rounded-xl p-4 hover:shadow-md transition bg-gray-50 hover:bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center font-bold text-green-700 text-sm shrink-0">
                            {mhs.nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-700">{mhs.nama}</h3>
                            <p className="text-sm text-gray-500">NIM: {mhs.nim}{mhs.angkatan ? ` · Angkatan ${mhs.angkatan}` : ''}</p>
                          </div>
                        </div>
                        {mhs.judul && (
                          <p className="text-sm text-gray-600 flex items-start gap-1 mt-1 ml-13">
                            <BookOpen className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                            <span className="italic">{mhs.judul}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {getStatusJudulBadge(mhs.statusJudul)}
                        <div className="flex items-center gap-1 text-sm text-gray-500"><MessageSquare className="w-4 h-4" /><span>{mhs.totalBimbingan} pertemuan</span></div>
                        {mhs.lastBimbingan && <div className="flex items-center gap-1 text-xs text-gray-400"><Calendar className="w-3 h-3" /><span>Terakhir: {mhs.lastBimbingan}</span></div>}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                      <button onClick={() => router.push(`/bimbingan?mahasiswa=${mhs.id}`)} className="text-sm text-green-600 hover:text-green-700 font-medium">Lihat Log Bimbingan →</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
