'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface LogBimbingan {
  id: string;
  mahasiswaId?: string;
  mahasiswa_nama: string;
  mahasiswa_nim: string;
  dosen_nama: string;
  pertemuan_ke: number;
  tanggal: string;
  topik: string;
  catatan: string;
  status: string;
}

interface MahasiswaBinaan {
  id: string;
  nama: string;
  nim: string;
}

type ApiRecord = Record<string, unknown>;

const getArrayData = (response: unknown): ApiRecord[] => {
  if (Array.isArray(response)) {
    return response as ApiRecord[];
  }

  if (response && typeof response === 'object') {
    const res = response as {
      data?: unknown;
    };

    if (Array.isArray(res.data)) {
      return res.data as ApiRecord[];
    }

    if (
      res.data &&
      typeof res.data === 'object' &&
      Array.isArray((res.data as { data?: unknown }).data)
    ) {
      return (res.data as { data: ApiRecord[] }).data;
    }
  }

  return [];
};

const getNestedRecord = (value: unknown): ApiRecord | null => {
  if (value && typeof value === 'object') {
    return value as ApiRecord;
  }

  return null;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

// ──────────────────────────────────────────────
//  Badge Status Log
// ──────────────────────────────────────────────
function StatusBadge() {
  return (
    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
      Tercatat
    </span>
  );
}

// ──────────────────────────────────────────────
//  Stat Cards Row
// ──────────────────────────────────────────────
function StatCards({
  total,
  mahasiswaCount,
  tercatat,
}: {
  total: number;
  mahasiswaCount: number;
  tercatat: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">Total Bimbingan</p>
          <p className="text-2xl font-bold text-gray-700">{total}</p>
        </div>

        <div className="bg-blue-100 p-3 rounded-full">
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">Mahasiswa Dibimbing</p>
          <p className="text-2xl font-bold text-green-600">
            {mahasiswaCount}
          </p>
        </div>

        <div className="bg-green-100 p-3 rounded-full">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">Bimbingan Tercatat</p>
          <p className="text-2xl font-bold text-teal-600">{tercatat}</p>
        </div>

        <div className="bg-teal-100 p-3 rounded-full">
          <svg
            className="w-6 h-6 text-teal-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7 20h10a2 2 0 002-2V7a2 2 0 00-2-2h-3l-2-2H7a2 2 0 00-2 2v13a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  Page Utama
// ──────────────────────────────────────────────
export default function LogBimbinganPage() {
  const router = useRouter();

  const [userRole, setUserRole] = useState<string>('');
  const [userData, setUserData] = useState<{ nama?: string } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [bimbinganList, setBimbinganList] = useState<LogBimbingan[]>([]);
  const [mahasiswaBinaan, setMahasiswaBinaan] = useState<MahasiswaBinaan[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogBimbingan | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    mahasiswaId: '',
    topik: '',
    catatan: '',
    tanggal: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ──────────────────────────────────────────────
  //  Mapping data log dari API
  // ──────────────────────────────────────────────
  const mapLogData = (list: ApiRecord[]): LogBimbingan[] => {
    return list.map((b) => {
      const mahasiswa = getNestedRecord(b.mahasiswa);
      const dosen = getNestedRecord(b.dosen);

      return {
        id: String(b.id || ''),
        mahasiswaId: String(b.mahasiswaId || b.mahasiswa_id || mahasiswa?.id || ''),
        mahasiswa_nama: String(
          mahasiswa?.nama || b.mahasiswa_nama || 'Unknown'
        ),
        mahasiswa_nim: String(mahasiswa?.nim || b.mahasiswa_nim || '-'),
        dosen_nama: String(dosen?.nama || b.dosen_nama || '-'),
        pertemuan_ke: Number(b.pertemuanKe || b.pertemuan_ke || 0),
        tanggal: String(b.tanggal || ''),
        topik: String(b.topik || ''),
        catatan: String(b.catatan || ''),
        status: String(b.status || 'APPROVED'),
      };
    });
  };

  // ──────────────────────────────────────────────
  //  Fetch data bimbingan berdasarkan role
  // ──────────────────────────────────────────────
  const fetchBimbingan = useCallback(async (role: string) => {
    try {
      setIsLoading(true);

      let data: LogBimbingan[] = [];

      if (role === 'ADMIN') {
        const res = await api.getLogBimbinganAll();
        data = mapLogData(getArrayData(res));
      }

      if (role === 'DOSEN') {
        const res = await api.getLogBimbinganByDosen();
        data = mapLogData(getArrayData(res));
      }

      setBimbinganList(data);
      setError('');
    } catch (err) {
      console.error('Gagal fetch bimbingan:', err);
      setError('Gagal memuat data bimbingan. Coba refresh halaman.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ──────────────────────────────────────────────
  //  Fetch mahasiswa binaan dosen
  // ──────────────────────────────────────────────
  const fetchMahasiswaBinaan = useCallback(async () => {
    try {
      const res = await api.getPengajuanList();
      const list = getArrayData(res);

      const seen = new Set<string>();
      const unique: MahasiswaBinaan[] = [];

      list
        .filter((p) => {
          const status = String(p.status || '').toUpperCase();
          return status === 'APPROVED';
        })
        .forEach((p) => {
          const mahasiswa = getNestedRecord(p.mahasiswa);
          const id = String(p.mahasiswaId || mahasiswa?.id || '');

          if (!id || seen.has(id)) return;

          seen.add(id);
          unique.push({
            id,
            nama: String(mahasiswa?.nama || 'Unknown'),
            nim: String(mahasiswa?.nim || '-'),
          });
        });

      setMahasiswaBinaan(unique);
    } catch (err) {
      console.error('Gagal fetch mahasiswa binaan:', err);
      setMahasiswaBinaan([]);
    }
  }, []);

  // ──────────────────────────────────────────────
  //  Init auth + role
  // ──────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    const timer = setTimeout(() => {
      const init = async () => {
        try {
          const me = await api.getMe();
          const role = me.data?.user?.role || '';
          const nama = me.data?.profile?.nama || me.data?.user?.email || '';

          if (role !== 'ADMIN' && role !== 'DOSEN') {
            router.push('/login');
            return;
          }

          setUserRole(role);
          setUserData({ nama });

          await fetchBimbingan(role);

          if (role === 'DOSEN') {
            await fetchMahasiswaBinaan();
          }
        } catch (err) {
          console.error('Gagal inisialisasi halaman bimbingan:', err);
          router.push('/login');
        }
      };

      void init();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, fetchBimbingan, fetchMahasiswaBinaan]);

  // ──────────────────────────────────────────────
  //  Filter search
  // ──────────────────────────────────────────────
  const filtered = bimbinganList.filter((b) => {
    const query = searchQuery.toLowerCase();

    return (
      query === '' ||
      b.mahasiswa_nama.toLowerCase().includes(query) ||
      b.mahasiswa_nim.toLowerCase().includes(query) ||
      b.topik.toLowerCase().includes(query) ||
      b.dosen_nama.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: bimbinganList.length,
    mahasiswaCount: new Set(
      bimbinganList.map((b) => b.mahasiswaId || b.mahasiswa_nim)
    ).size,
    tercatat: bimbinganList.length,
  };

  // ──────────────────────────────────────────────
  //  Submit tambah log
  // ──────────────────────────────────────────────
  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      await api.createLogBimbingan({
        mahasiswaId: formData.mahasiswaId,
        topik: formData.topik,
        catatan: formData.catatan,
        tanggal: formData.tanggal,
      });

      setIsModalOpen(false);
      setFormData({
        mahasiswaId: '',
        topik: '',
        catatan: '',
        tanggal: '',
      });

      await fetchBimbingan('DOSEN');
    } catch (err) {
      alert('Gagal tambah log: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ──────────────────────────────────────────────
  //  Loading
  // ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />

        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Memuat data bimbingan...</p>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  //  Tampilan Admin
  // ──────────────────────────────────────────────
  if (userRole === 'ADMIN') {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />

        <div className="flex-1 ml-64">
          <Header />

          <main className="p-6">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl p-5 mb-6 text-white flex items-center gap-3">
              <svg
                className="w-8 h-8 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>

              <div>
                <h2 className="text-lg font-bold">
                  Monitor Bimbingan — Semua Mahasiswa
                </h2>
                <p className="text-blue-100 text-sm">
                  Tampilan read-only untuk memantau seluruh riwayat bimbingan mahasiswa.
                </p>
              </div>
            </div>

            <StatCards {...stats} />

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-700">
                    Log Bimbingan Seluruh Mahasiswa
                  </h1>
                  <p className="text-gray-500 mt-1">
                    Admin hanya dapat memantau progres bimbingan.
                  </p>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => fetchBimbingan('ADMIN')}
                >
                  🔄 Refresh
                </Button>
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Cari mahasiswa, dosen, atau topik..."
                  className="w-full px-3 py-2 border rounded-lg text-gray-700 placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-gray-600 font-medium">
                        Mahasiswa
                      </th>
                      <th className="text-left p-3 text-gray-600 font-medium">
                        Dosen
                      </th>
                      <th className="text-left p-3 text-gray-600 font-medium">
                        Ke-
                      </th>
                      <th className="text-left p-3 text-gray-600 font-medium">
                        Tanggal
                      </th>
                      <th className="text-left p-3 text-gray-600 font-medium">
                        Topik
                      </th>
                      <th className="text-left p-3 text-gray-600 font-medium">
                        Status
                      </th>
                      <th className="text-left p-3 text-gray-600 font-medium">
                        Detail
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((log) => (
                      <tr
                        key={log.id}
                        className="border-t border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="p-3">
                          <p className="font-medium text-gray-700">
                            {log.mahasiswa_nama}
                          </p>
                          <p className="text-xs text-gray-500">
                            {log.mahasiswa_nim}
                          </p>
                        </td>

                        <td className="p-3 text-gray-600 text-sm">
                          {log.dosen_nama}
                        </td>

                        <td className="p-3 text-center text-gray-600">
                          {log.pertemuan_ke}
                        </td>

                        <td className="p-3 text-gray-600 text-sm">
                          {formatDate(log.tanggal)}
                        </td>

                        <td className="p-3 text-gray-600 max-w-xs truncate text-sm">
                          {log.topik}
                        </td>

                        <td className="p-3">
                          <StatusBadge />
                        </td>

                        <td className="p-3">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            Lihat
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Tidak ada data bimbingan yang sesuai pencarian.
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Detail Log Bimbingan"
        >
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mahasiswa</p>
                  <p className="font-medium text-gray-700">
                    {selectedLog.mahasiswa_nama}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedLog.mahasiswa_nim}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Dosen Pembimbing</p>
                  <p className="font-medium text-gray-700">
                    {selectedLog.dosen_nama}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Pertemuan Ke-</p>
                  <p className="font-medium text-gray-700">
                    {selectedLog.pertemuan_ke}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-medium text-gray-700">
                    {formatDate(selectedLog.tanggal)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Topik</p>
                <div className="bg-gray-50 p-3 rounded-lg mt-1">
                  <p className="text-gray-700">{selectedLog.topik}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Catatan</p>
                <div className="bg-gray-50 p-3 rounded-lg mt-1">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {selectedLog.catatan}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">
                  <StatusBadge />
                </div>
              </div>

              <div className="pt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  ℹ️ Sebagai Admin, Anda hanya memantau riwayat bimbingan.
                </p>
              </div>

              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                Tutup
              </Button>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  //  Tampilan Dosen
  // ──────────────────────────────────────────────
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Header />

        <main className="p-6">
          <div className="bg-linear-to-r from-green-600 to-teal-600 rounded-xl p-5 mb-6 text-white">
            <h2 className="text-lg font-bold">
              Log Bimbingan Mahasiswa Binaan
            </h2>
            <p className="text-green-100 text-sm">
              Hanya menampilkan mahasiswa yang judulnya sudah Anda approve. Log bimbingan digunakan untuk mencatat hasil bimbingan yang sudah dilakukan.
            </p>
          </div>

          <StatCards {...stats} />

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-700">
                  Log Bimbingan
                </h1>
                <p className="text-gray-500 mt-1">
                  Selamat datang, {userData?.nama || 'Dosen'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => fetchBimbingan('DOSEN')}
                >
                  🔄 Refresh
                </Button>

                <Button
                  variant="primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  + Tambah Log
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Cari mahasiswa atau topik..."
                className="w-full px-3 py-2 border rounded-lg text-gray-700 placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-gray-600 font-medium">
                      Mahasiswa
                    </th>
                    <th className="text-left p-3 text-gray-600 font-medium">
                      Ke-
                    </th>
                    <th className="text-left p-3 text-gray-600 font-medium">
                      Tanggal
                    </th>
                    <th className="text-left p-3 text-gray-600 font-medium">
                      Topik
                    </th>
                    <th className="text-left p-3 text-gray-600 font-medium">
                      Status
                    </th>
                    <th className="text-left p-3 text-gray-600 font-medium">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="p-3">
                        <p className="font-medium text-gray-700">
                          {log.mahasiswa_nama}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.mahasiswa_nim}
                        </p>
                      </td>

                      <td className="p-3 text-center text-gray-600">
                        {log.pertemuan_ke}
                      </td>

                      <td className="p-3 text-gray-600 text-sm">
                        {formatDate(log.tanggal)}
                      </td>

                      <td className="p-3 text-gray-600 max-w-xs truncate text-sm">
                        {log.topik}
                      </td>

                      <td className="p-3">
                        <StatusBadge />
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            Detail
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {bimbinganList.length === 0
                    ? 'Belum ada log bimbingan. Klik "+ Tambah Log" untuk mulai mencatat.'
                    : 'Tidak ada data yang sesuai pencarian.'}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Detail Log Bimbingan"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mahasiswa</p>
                <p className="font-medium text-gray-700">
                  {selectedLog.mahasiswa_nama}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedLog.mahasiswa_nim}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Pertemuan Ke-</p>
                <p className="font-medium text-gray-700">
                  {selectedLog.pertemuan_ke}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="font-medium text-gray-700">
                {formatDate(selectedLog.tanggal)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Topik</p>
              <div className="bg-gray-50 p-3 rounded-lg mt-1">
                <p className="text-gray-700">{selectedLog.topik}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Catatan / Revisi</p>
              <div className="bg-gray-50 p-3 rounded-lg mt-1">
                <p className="whitespace-pre-wrap text-gray-700">
                  {selectedLog.catatan}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="mt-1">
                <StatusBadge />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Log Bimbingan"
      >
        <form onSubmit={handleSubmitLog} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Mahasiswa Binaan
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-gray-700"
              value={formData.mahasiswaId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mahasiswaId: e.target.value,
                })
              }
              required
            >
              <option value="">Pilih Mahasiswa</option>
              {mahasiswaBinaan.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nama} — {m.nim}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Tanggal Bimbingan
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg text-gray-700"
              value={formData.tanggal}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tanggal: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Topik Bimbingan
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg text-gray-700 placeholder:text-gray-400"
              placeholder="Contoh: Pembahasan Bab 3 Metodologi"
              value={formData.topik}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  topik: e.target.value,
                })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Catatan / Revisi
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border rounded-lg text-gray-700 placeholder:text-gray-400"
              placeholder="Tulis catatan bimbingan..."
              value={formData.catatan}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  catatan: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Log'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}