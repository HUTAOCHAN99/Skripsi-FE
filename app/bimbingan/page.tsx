'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface Mahasiswa {
  id: string;
  nama: string;
  nim: string;
  angkatan: number;
}

interface Dosen {
  id: string;
  nama: string;
  nip: string;
}

interface LogBimbingan {
  id: string;
  pertemuanKe: number;
  tanggal: string;
  topik: string;
  catatan: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  mahasiswa: Mahasiswa;
  dosen: Dosen;
}

export default function BimbinganPage() {
  const router = useRouter();
  const [bimbinganList, setBimbinganList] = useState<LogBimbingan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogBimbingan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserRole(role);
    // eslint-disable-next-line react-hooks/immutability
    fetchBimbingan();
  }, [router]);

  const fetchBimbingan = async () => {
    try {
      setIsLoading(true);
      const response = await api.getLogBimbinganAll();
      const data = Array.isArray(response) ? response : response?.data || [];
      setBimbinganList(data);
    } catch (error) {
      console.error('Failed to fetch bimbingan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Setujui log bimbingan ini?')) return;
    try {
      await api.approveLogBimbingan(id);
      alert('✅ Log bimbingan disetujui');
      fetchBimbingan();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert('❌ Gagal approve: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Tolak log bimbingan ini?')) return;
    try {
      await api.rejectLogBimbingan(id);
      alert('❌ Log bimbingan ditolak');
      fetchBimbingan();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert('❌ Gagal reject: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">⏳ Menunggu</span>;
      case 'APPROVED':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">✅ Disetujui</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">❌ Ditolak</span>;
      default:
        return null;
    }
  };

  const filteredBimbingan = bimbinganList.filter(log => {
    if (filterStatus === 'all') return true;
    return log.status === filterStatus;
  });

  const isAdmin = userRole === 'ADMIN';
  const isDosen = userRole === 'DOSEN';

  const stats = {
    total: bimbinganList.length,
    pending: bimbinganList.filter(l => l.status === 'PENDING').length,
    approved: bimbinganList.filter(l => l.status === 'APPROVED').length,
    rejected: bimbinganList.filter(l => l.status === 'REJECTED').length,
  };

  if (!userRole) return null;

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
                  {isAdmin ? '📊 Monitoring Bimbingan' : '📝 Log Bimbingan'}
                </h1>
                <p className="text-gray-500 mt-1">
                  {isAdmin 
                    ? 'Pantau semua aktivitas bimbingan mahasiswa (Read-only)' 
                    : 'Kelola dan approve log bimbingan mahasiswa bimbingan Anda'}
                </p>
              </div>
              <Button variant="secondary" onClick={fetchBimbingan}>
                🔄 Refresh
              </Button>
            </div>

            {/* Statistik Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Bimbingan</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-600">Menunggu Approval</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600">Disetujui</p>
                <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-600">Ditolak</p>
                <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-3 mb-6">
              <select
                className="px-3 py-2 border rounded-lg text-gray-600 focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="PENDING">Menunggu</option>
                <option value="APPROVED">Disetujui</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Memuat data bimbingan...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredBimbingan.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-700">Belum ada log bimbingan</h3>
                <p className="text-gray-500 mt-1">
                  {isAdmin ? 'Belum ada aktivitas bimbingan' : 'Belum ada log bimbingan dari mahasiswa Anda'}
                </p>
              </div>
            )}

            {/* List Bimbingan */}
            {!isLoading && filteredBimbingan.length > 0 && (
              <div className="space-y-4">
                {filteredBimbingan.map((log) => (
                  <div
                    key={log.id}
                    className={`border rounded-lg p-5 transition-all ${
                      log.status === 'PENDING'
                        ? 'border-yellow-200 bg-yellow-50/30'
                        : log.status === 'APPROVED'
                        ? 'border-green-200 bg-green-50/30'
                        : 'border-red-200 bg-red-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="font-semibold text-lg text-gray-800">
                            {log.mahasiswa?.nama || 'Unknown'}
                          </h3>
                          <span className="text-sm text-gray-500">
                            NIM: {log.mahasiswa?.nim || '-'}
                          </span>
                          {getStatusBadge(log.status)}
                        </div>

                        {/* Info Bimbingan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-sm text-gray-500">👨‍🏫 Dosen Pembimbing</p>
                            <p className="font-medium text-gray-800">{log.dosen?.nama || '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">📅 Tanggal Bimbingan</p>
                            <p className="font-medium text-gray-800">
                              {new Date(log.tanggal).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">🔢 Pertemuan Ke-</p>
                            <p className="font-medium text-gray-800">{log.pertemuanKe}</p>
                          </div>
                        </div>

                        {/* Topik */}
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-1">📖 Topik Bimbingan</p>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-800">{log.topik}</p>
                          </div>
                        </div>

                        {/* Catatan */}
                        <div>
                          <p className="text-sm text-gray-500 mb-1">📝 Catatan / Revisi</p>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-gray-700 whitespace-pre-wrap">{log.catatan}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - ONLY for DOSEN and PENDING */}
                      {isDosen && log.status === 'PENDING' && (
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprove(log.id)}
                            className="whitespace-nowrap"
                          >
                            ✅ Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(log.id)}
                            className="whitespace-nowrap"
                          >
                            ❌ Reject
                          </Button>
                        </div>
                      )}

                      {/* Detail Button for Admin */}
                      {isAdmin && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedLog(log);
                            setIsModalOpen(true);
                          }}
                          className="ml-4"
                        >
                          📋 Detail
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Detail (Khusus Admin untuk melihat detail) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detail Log Bimbingan">
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500">Mahasiswa</label>
                <p className="font-medium text-gray-800">{selectedLog.mahasiswa?.nama}</p>
                <p className="text-sm text-gray-500">{selectedLog.mahasiswa?.nim}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Dosen Pembimbing</label>
                <p className="font-medium text-gray-800">{selectedLog.dosen?.nama}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Pertemuan Ke-</label>
              <p className="font-medium text-gray-800">{selectedLog.pertemuanKe}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Tanggal</label>
              <p className="font-medium text-gray-800">
                {new Date(selectedLog.tanggal).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Topik Bimbingan</label>
              <div className="bg-gray-50 p-3 rounded-lg mt-1">
                <p className="text-gray-800">{selectedLog.topik}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Catatan / Revisi</label>
              <div className="bg-gray-50 p-3 rounded-lg mt-1">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedLog.catatan}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}