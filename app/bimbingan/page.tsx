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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'pending' | 'approved' | 'rejected';
}

interface MahasiswaBinaan {
  id: string;
  nama: string;
  nim: string;
}

// ──────────────────────────────────────────────
//  Komponen Badge Status
// ──────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    pending:  { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu Approval' },
    approved: { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Disetujui' },
    rejected: { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Ditolak' },
  };
  const c = cfg[s] ?? { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

// ──────────────────────────────────────────────
//  Stat Cards Row (shared)
// ──────────────────────────────────────────────
function StatCards({ total, approved, pending }: { total: number; approved: number; pending: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">Total Bimbingan</p>
          <p className="text-2xl font-bold text-gray-700">{total}</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-full">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">Telah Disetujui</p>
          <p className="text-2xl font-bold text-green-600">{approved}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">Menunggu Approval</p>
          <p className="text-2xl font-bold text-yellow-600">{pending}</p>
        </div>
        <div className="bg-yellow-100 p-3 rounded-full">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
//  PAGE UTAMA
// ──────────────────────────────────────────────
export default function LogBimbinganPage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [userData, setUserData] = useState<{ nama?: string; id?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bimbinganList, setBimbinganList] = useState<LogBimbingan[]>([]);
  const [mahasiswaBinaan, setMahasiswaBinaan] = useState<MahasiswaBinaan[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogBimbingan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ mahasiswaId: '', topik: '', catatan: '', tanggal: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── Fetch data bimbingan berdasarkan role ──
  const fetchBimbingan = useCallback(async (role: string) => {
    try {
      setIsLoading(true);
      let data: LogBimbingan[] = [];

      if (role === 'ADMIN') {
        // Admin: ambil semua log dari seluruh mahasiswa
        const res = await api.getLogBimbinganAll();
        data = (res || []).map((b: Record<string, unknown>) => ({
          id: b.id as string,
          mahasiswaId: b.mahasiswaId as string,
          mahasiswa_nama: (b.mahasiswa as Record<string, unknown>)?.nama as string || (b.mahasiswa_nama as string) || 'Unknown',
          mahasiswa_nim:  (b.mahasiswa as Record<string, unknown>)?.nim  as string || (b.mahasiswa_nim  as string) || '-',
          dosen_nama:     (b.dosen    as Record<string, unknown>)?.nama  as string || (b.dosen_nama    as string) || '-',
          pertemuan_ke:   b.pertemuanKe as number || b.pertemuan_ke as number || 0,
          tanggal:        b.tanggal as string || '',
          topik:          b.topik   as string || '',
          catatan:        b.catatan as string || '',
          status:         b.status  as string || 'PENDING',
        }));
      } else if (role === 'DOSEN') {
        // Dosen: ambil hanya bimbingan mahasiswa binaannya
        const res = await api.getLogBimbinganByDosen();
        data = (res || []).map((b: Record<string, unknown>) => ({
          id: b.id as string,
          mahasiswaId: b.mahasiswaId as string,
          mahasiswa_nama: (b.mahasiswa as Record<string, unknown>)?.nama as string || (b.mahasiswa_nama as string) || 'Unknown',
          mahasiswa_nim:  (b.mahasiswa as Record<string, unknown>)?.nim  as string || (b.mahasiswa_nim  as string) || '-',
          dosen_nama:     (b.dosen    as Record<string, unknown>)?.nama  as string || (b.dosen_nama    as string) || '-',
          pertemuan_ke:   b.pertemuanKe as number || b.pertemuan_ke as number || 0,
          tanggal:        b.tanggal as string || '',
          topik:          b.topik   as string || '',
          catatan:        b.catatan as string || '',
          status:         b.status  as string || 'PENDING',
        }));
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

  // ── Fetch mahasiswa binaan (Dosen) dari hasil assign pengajuan judul ──
  const fetchMahasiswaBinaan = useCallback(async () => {
    try {
      const res = await api.getPengajuanList();
      const list = res || [];
      const seen = new Set<string>();
      const unique: MahasiswaBinaan[] = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      list.filter((p: any) => p.status === 'APPROVED' || p.status === 'approved').forEach((p: any) => {
        const id = p.mahasiswaId || p.mahasiswa?.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          unique.push({
            id,
            nama: p.mahasiswa?.nama || 'Unknown',
            nim:  p.mahasiswa?.nim  || '-',
          });
        }
      });

      setMahasiswaBinaan(unique);
    } catch {
      setMahasiswaBinaan([]);
    }
  }, []);

  // ── Init: cek auth + role ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    const init = async () => {
      try {
        const me = await api.getMe();
        const role  = me.data?.user?.role || '';
        const nama  = me.data?.profile?.nama || '';
        const id    = me.data?.user?.id || '';

        setUserRole(role);
        setUserData({ nama, id });
        await fetchBimbingan(role);
        if (role === 'DOSEN') await fetchMahasiswaBinaan();
      } catch {
        router.push('/login');
      }
    };
    init();
  }, [router, fetchBimbingan, fetchMahasiswaBinaan]);

  // ── Filter ──
  const filtered = bimbinganList.filter((b) => {
    const statusMatch = filterStatus === 'all' || b.status.toLowerCase() === filterStatus;
    const searchMatch =
      searchQuery === '' ||
      b.mahasiswa_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.mahasiswa_nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.topik.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const stats = {
    total:    bimbinganList.length,
    approved: bimbinganList.filter(b => b.status.toLowerCase() === 'approved').length,
    pending:  bimbinganList.filter(b => b.status.toLowerCase() === 'pending').length,
  };

  // ── Actions (Dosen only) ──
  const handleApprove = async (id: string) => {
    try {
      await api.approveLogBimbingan(id);
      setBimbinganList(prev => prev.map(b => b.id === id ? { ...b, status: 'APPROVED' } : b));
      if (selectedLog?.id === id) setSelectedLog(prev => prev ? { ...prev, status: 'APPROVED' } : null);
    } catch (err) {
      alert('Gagal approve: ' + (err as Error).message);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectLogBimbingan(id);
      setBimbinganList(prev => prev.map(b => b.id === id ? { ...b, status: 'REJECTED' } : b));
      if (selectedLog?.id === id) setSelectedLog(prev => prev ? { ...prev, status: 'REJECTED' } : null);
    } catch (err) {
      alert('Gagal reject: ' + (err as Error).message);
    }
  };

  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createLogBimbingan({
        mahasiswaId: formData.mahasiswaId,
        topik:       formData.topik,
        catatan:     formData.catatan,
        tanggal:     formData.tanggal,
      });
      setIsModalOpen(false);
      setFormData({ mahasiswaId: '', topik: '', catatan: '', tanggal: '' });
      await fetchBimbingan('DOSEN');
    } catch (err) {
      alert('Gagal tambah log: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading skeleton ──
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
  //  TAMPILAN ADMIN  (read-only, semua mahasiswa)
  // ──────────────────────────────────────────────
  if (userRole === 'ADMIN') {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header />
          <main className="p-6">
            {/* Banner Info */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-5 mb-6 text-white flex items-center gap-3">
              <svg className="w-8 h-8 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <div>
                <h2 className="text-lg font-bold">Monitor Bimbingan — Semua Mahasiswa</h2>
                <p className="text-blue-100 text-sm">Tampilan read-only. Approve/Reject dilakukan oleh masing-masing Dosen Pembimbing.</p>
              </div>
            </div>

            <StatCards {...stats} />

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">{error}</div>}

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-700">Log Bimbingan Seluruh Mahasiswa</h1>
                  <p className="text-gray-500 mt-1">Pantau progres bimbingan — tidak bisa diubah dari sini</p>
                </div>
                <Button variant="secondary" onClick={() => fetchBimbingan('ADMIN')}>🔄 Refresh</Button>
              </div>

              {/* Filter */}
              <div className="flex gap-3 mb-6">
                <select className="px-3 py-2 border rounded-lg text-gray-600" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="all">Semua Status</option>
                  <option value="pending">Menunggu Approval</option>
                  <option value="approved">Disetujui</option>
                  <option value="rejected">Ditolak</option>
                </select>
                <input type="text" placeholder="Cari mahasiswa / topik..." className="flex-1 px-3 py-2 border rounded-lg text-gray-600 placeholder-gray-400" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 text-gray-600 font-medium">Mahasiswa</th>
                      <th className="text-left p-3 text-gray-600 font-medium">Dosen</th>
                      <th className="text-left p-3 text-gray-600 font-medium">Ke-</th>
                      <th className="text-left p-3 text-gray-600 font-medium">Tanggal</th>
                      <th className="text-left p-3 text-gray-600 font-medium">Topik</th>
                      <th className="text-left p-3 text-gray-600 font-medium">Status</th>
                      <th className="text-left p-3 text-gray-600 font-medium">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(log => (
                      <tr key={log.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                        <td className="p-3">
                          <p className="font-medium text-gray-700">{log.mahasiswa_nama}</p>
                          <p className="text-xs text-gray-500">{log.mahasiswa_nim}</p>
                        </td>
                        <td className="p-3 text-gray-600 text-sm">{log.dosen_nama}</td>
                        <td className="p-3 text-center text-gray-600">{log.pertemuan_ke}</td>
                        <td className="p-3 text-gray-600 text-sm">{log.tanggal}</td>
                        <td className="p-3 text-gray-600 max-w-xs truncate text-sm">{log.topik}</td>
                        <td className="p-3"><StatusBadge status={log.status} /></td>
                        <td className="p-3">
                          <Button variant="secondary" size="sm" onClick={() => setSelectedLog(log)}>Lihat</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-gray-500">Tidak ada data bimbingan yang sesuai filter</div>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Modal Detail (read-only untuk Admin) */}
        <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Detail Log Bimbingan">
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Mahasiswa</p>
                  <p className="font-medium text-gray-700">{selectedLog.mahasiswa_nama}</p>
                  <p className="text-sm text-gray-500">{selectedLog.mahasiswa_nim}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dosen Pembimbing</p>
                  <p className="font-medium text-gray-700">{selectedLog.dosen_nama}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Pertemuan Ke-</p>
                  <p className="font-medium text-gray-700">{selectedLog.pertemuan_ke}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal</p>
                  <p className="font-medium text-gray-700">{selectedLog.tanggal}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Topik</p>
                <div className="bg-gray-50 p-3 rounded-lg mt-1"><p className="text-gray-700">{selectedLog.topik}</p></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Catatan</p>
                <div className="bg-gray-50 p-3 rounded-lg mt-1"><p className="whitespace-pre-wrap text-gray-700">{selectedLog.catatan}</p></div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1"><StatusBadge status={selectedLog.status} /></div>
              </div>
              <div className="pt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">ℹ️ Sebagai Admin, Anda hanya dapat memantau bimbingan. Approve/Reject dilakukan oleh Dosen Pembimbing.</p>
              </div>
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>Tutup</Button>
            </div>
          )}
        </Modal>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  //  TAMPILAN DOSEN  (bimbingan mahasiswanya + CRUD)
  // ──────────────────────────────────────────────
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          {/* Banner Dosen */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-5 mb-6 text-white">
            <h2 className="text-lg font-bold">Log Bimbingan Mahasiswa Binaan</h2>
            <p className="text-green-100 text-sm">Hanya menampilkan mahasiswa yang judulnya sudah Anda approve. Anda dapat menambah log dan approve/reject log bimbingan.</p>
          </div>

          <StatCards {...stats} />

          {error && <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg">{error}</div>}

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-700">Log Bimbingan</h1>
                <p className="text-gray-500 mt-1">Selamat datang, {userData?.nama || 'Dosen'}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => fetchBimbingan('DOSEN')}>🔄 Refresh</Button>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Tambah Log</Button>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-3 mb-6">
              <select className="px-3 py-2 border rounded-lg text-gray-600" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu Approval</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
              </select>
              <input type="text" placeholder="Cari mahasiswa / topik..." className="flex-1 px-3 py-2 border rounded-lg text-gray-600 placeholder-gray-400" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-gray-600 font-medium">Mahasiswa</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Ke-</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Tanggal</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Topik</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(log => (
                    <tr key={log.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                      <td className="p-3">
                        <p className="font-medium text-gray-700">{log.mahasiswa_nama}</p>
                        <p className="text-xs text-gray-500">{log.mahasiswa_nim}</p>
                      </td>
                      <td className="p-3 text-center text-gray-600">{log.pertemuan_ke}</td>
                      <td className="p-3 text-gray-600 text-sm">{log.tanggal}</td>
                      <td className="p-3 text-gray-600 max-w-xs truncate text-sm">{log.topik}</td>
                      <td className="p-3"><StatusBadge status={log.status} /></td>
                      <td className="p-3">
                        <div className="flex gap-2 flex-wrap">
                          <Button variant="secondary" size="sm" onClick={() => setSelectedLog(log)}>Detail</Button>
                          {log.status.toLowerCase() === 'pending' && (
                            <>
                              <Button variant="success" size="sm" onClick={() => handleApprove(log.id)}>Approve</Button>
                              <Button variant="danger"  size="sm" onClick={() => handleReject(log.id)}>Reject</Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {bimbinganList.length === 0 ? 'Belum ada log bimbingan. Klik "+ Tambah Log" untuk mulai mencatat.' : 'Tidak ada data yang sesuai filter.'}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Detail (Dosen — bisa approve/reject) */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Detail Log Bimbingan">
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Mahasiswa</p>
                <p className="font-medium text-gray-700">{selectedLog.mahasiswa_nama}</p>
                <p className="text-sm text-gray-500">{selectedLog.mahasiswa_nim}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pertemuan Ke-</p>
                <p className="font-medium text-gray-700">{selectedLog.pertemuan_ke}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="font-medium text-gray-700">{selectedLog.tanggal}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Topik</p>
              <div className="bg-gray-50 p-3 rounded-lg mt-1"><p className="text-gray-700">{selectedLog.topik}</p></div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Catatan / Revisi</p>
              <div className="bg-gray-50 p-3 rounded-lg mt-1"><p className="whitespace-pre-wrap text-gray-700">{selectedLog.catatan}</p></div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <div className="mt-1"><StatusBadge status={selectedLog.status} /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>Tutup</Button>
              {selectedLog.status.toLowerCase() === 'pending' && (
                <>
                  <Button variant="success" onClick={() => { handleApprove(selectedLog.id); setSelectedLog(null); }}>Approve</Button>
                  <Button variant="danger"  onClick={() => { handleReject(selectedLog.id);  setSelectedLog(null); }}>Reject</Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Tambah Log (Dosen only) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Log Bimbingan">
        <form onSubmit={handleSubmitLog} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Mahasiswa Binaan</label>
            <select className="w-full px-3 py-2 border rounded-lg text-gray-600" value={formData.mahasiswaId} onChange={e => setFormData({ ...formData, mahasiswaId: e.target.value })} required>
              <option value="">Pilih Mahasiswa</option>
              {mahasiswaBinaan.map(m => (
                <option key={m.id} value={m.id}>{m.nama} — {m.nim}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Tanggal Bimbingan</label>
            <input type="date" className="w-full px-3 py-2 border rounded-lg text-gray-600" value={formData.tanggal} onChange={e => setFormData({ ...formData, tanggal: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Topik Bimbingan</label>
            <input type="text" className="w-full px-3 py-2 border rounded-lg text-gray-600 placeholder-gray-400" placeholder="Contoh: Pembahasan Bab 3 Metodologi" value={formData.topik} onChange={e => setFormData({ ...formData, topik: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Catatan / Revisi</label>
            <textarea rows={4} className="w-full px-3 py-2 border rounded-lg text-gray-600 placeholder-gray-400" placeholder="Tulis catatan bimbingan..." value={formData.catatan} onChange={e => setFormData({ ...formData, catatan: e.target.value })} required />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Menyimpan...' : 'Simpan Log'}</Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
