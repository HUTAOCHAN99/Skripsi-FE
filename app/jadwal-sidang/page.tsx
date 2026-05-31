'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { api } from '@/lib/api';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';

interface JadwalSidang {
  id: string;
  mahasiswa_nama: string;
  mahasiswa_nim: string;
  judul_ta: string;
  dosen_pembimbing: string;
  dosen_penguji: string;
  tanggal: string;
  jam: string;
  ruang: string;
  status: string;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    scheduled:  { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Terjadwal' },
    completed:  { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Selesai' },
    cancelled:  { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Dibatalkan' },
  };
  const c = cfg[s] ?? { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

export default function JadwalSidangDosenPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [jadwalList, setJadwalList] = useState<JadwalSidang[]>([]);
  const [error, setError] = useState('');
  const [dosenNama, setDosenNama] = useState('');

  const fetchJadwal = useCallback(async () => {
    try {
      setIsLoading(true);
      const me = await api.getMe();
      const role = me.data?.user?.role;

      // ── Route Guard: hanya DOSEN ──
      if (role !== 'DOSEN') {
        router.push('/dashboard');
        return;
      }

      setDosenNama(me.data?.profile?.nama || 'Dosen');

      // Ambil semua jadwal sidang (view-only)
      const res = await api.getJadwalSidangAll();
      const list = res || [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted: JadwalSidang[] = list.map((j: any) => ({
        id:               j.id,
        mahasiswa_nama:   j.mahasiswa?.nama      || j.mahasiswa_nama  || 'Unknown',
        mahasiswa_nim:    j.mahasiswa?.nim       || j.mahasiswa_nim   || '-',
        judul_ta:         j.judul                || j.judul_ta        || '-',
        dosen_pembimbing: j.dosenPembimbing?.nama || j.dosen_pembimbing || '-',
        dosen_penguji:    j.dosenPenguji?.nama    || j.dosen_penguji   || '-',
        tanggal:          j.tanggal              || '-',
        jam:              j.jam                  || '-',
        ruang:            j.ruang                || '-',
        status:           j.status               || 'scheduled',
      }));

      setJadwalList(formatted);
      setError('');
    } catch (err) {
      console.error('Gagal fetch jadwal:', err);
      setError('Gagal memuat data jadwal sidang.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    fetchJadwal();
  }, [router, fetchJadwal]);

  if (isLoading) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
            <p className="mt-4 text-gray-600">Memuat jadwal sidang...</p>
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
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 mb-6 text-white flex items-center gap-3">
            <Calendar className="w-8 h-8 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold">Jadwal Sidang Skripsi</h1>
              <p className="text-green-100 text-sm mt-1">
                Dosen: {dosenNama} — Jadwal dibuat dan dikelola oleh Admin.
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <div className="text-blue-500 mt-0.5">ℹ️</div>
            <p className="text-sm text-blue-700">
              Halaman ini bersifat <strong>view-only</strong>. Perubahan jadwal sidang hanya dapat dilakukan oleh Admin. Hubungi Admin jika ada perubahan yang perlu dilakukan.
            </p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">{error}</div>}

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-700">Daftar Jadwal</h2>
              <button onClick={fetchJadwal} className="text-sm text-green-600 hover:text-green-700 font-medium">
                🔄 Refresh
              </button>
            </div>

            {jadwalList.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada jadwal sidang yang terdaftar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jadwalList.map(jadwal => (
                  <div key={jadwal.id} className="border rounded-xl p-5 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <h3 className="font-semibold text-gray-700">{jadwal.mahasiswa_nama}</h3>
                          <span className="text-sm text-gray-500">NIM: {jadwal.mahasiswa_nim}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600 italic">{jadwal.judul_ta}</p>
                        </div>
                      </div>
                      <StatusBadge status={jadwal.status} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-100 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Dosen Pembimbing</p>
                        <p className="font-medium text-gray-700">{jadwal.dosen_pembimbing}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Dosen Penguji</p>
                        <p className="font-medium text-gray-700">{jadwal.dosen_penguji}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400 text-xs">Waktu</p>
                          <p className="font-medium text-gray-700">{jadwal.tanggal} · {jadwal.jam}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-gray-400 text-xs">Ruang</p>
                          <p className="font-medium text-gray-700">{jadwal.ruang}</p>
                        </div>
                      </div>
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
