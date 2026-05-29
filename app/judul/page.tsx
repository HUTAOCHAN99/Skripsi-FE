'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';

interface Mahasiswa {
  id: string;
  nama: string;
  nim: string;
  angkatan: number;
}

interface DosenPembimbing {
  id: string;
  nama: string;
  nip: string;
  kuota: number;  // ✅ Tambahkan field kuota
  terisi: number; // ✅ Tambahkan field terisi
}

interface PengajuanJudul {
  id: string;
  judul: string;
  abstrak?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  catatan?: string;
  tglAjukan: string;
  tglApproved?: string;
  mahasiswa: Mahasiswa;
  dosenPembimbing?: DosenPembimbing;
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

export default function PengajuanJudulPage() {
  const router = useRouter();
  const [pengajuanList, setPengajuanList] = useState<PengajuanJudul[]>([]);
  const [dosenList, setDosenList] = useState<DosenPembimbing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedDosen, setSelectedDosen] = useState<Record<string, string>>({});

  // ✅ Pindahkan fetchData ke atas sebelum useEffect
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [pengajuanResponse, dosenResponse] = await Promise.all([
        api.getPengajuanList(),
        api.getDosenList()
      ]);
      
      const pengajuanData = Array.isArray(pengajuanResponse) ? pengajuanResponse : pengajuanResponse?.data || [];
      const dosenData = Array.isArray(dosenResponse) ? dosenResponse : dosenResponse?.data || [];
      
      setPengajuanList(pengajuanData);
      setDosenList(dosenData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    // ✅ HANYA ADMIN yang bisa akses halaman ini!
    if (role !== 'ADMIN') {
      alert('Halaman ini khusus untuk Admin. Dosen tidak memiliki akses approval judul.');
      router.push('/dashboard');
      return;
    }
    
    // ✅ Set state tanpa warning
    if (role) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserRole(role);
    }
    fetchData();
  }, [router, fetchData]);

  const handleApprove = async (id: string) => {
    const dosenId = selectedDosen[id];
    
    if (!dosenId) {
      alert('Silakan pilih dosen pembimbing terlebih dahulu!');
      return;
    }
    
    const dosen = dosenList.find(d => d.id === dosenId);
    const confirmMsg = `Apakah Anda yakin ingin menyetujui judul ini?\n\nDosen Pembimbing: ${dosen?.nama}\nKuota tersedia: ${dosen?.kuota ? (dosen.kuota - (dosen.terisi || 0)) : '?'}\n\nMahasiswa akan langsung dapat melanjutkan ke tahap bimbingan.`;
    
    if (!confirm(confirmMsg)) return;
    
    try {
      await api.approvePengajuan(id, dosenId);
      alert('✅ Pengajuan berhasil disetujui!');
      fetchData();
    } catch (err: unknown) {
      const error = err as ApiError;
      alert('❌ Gagal approve: ' + (error.message || 'Terjadi kesalahan'));
    }
  };

  const handleReject = async (id: string) => {
    const catatan = prompt('Masukkan alasan penolakan (wajib):\n\nBerikan masukan yang jelas agar mahasiswa bisa merevisi judulnya.');
    
    if (!catatan) {
      alert('Alasan penolakan harus diisi!');
      return;
    }
    
    if (catatan.length < 10) {
      alert('Alasan penolakan minimal 10 karakter untuk memberikan masukan yang jelas.');
      return;
    }
    
    try {
      await api.rejectPengajuan(id, catatan);
      alert('❌ Pengajuan ditolak!');
      fetchData();
    } catch (err: unknown) {
      const error = err as ApiError;
      alert('❌ Gagal reject: ' + (error.message || 'Terjadi kesalahan'));
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

  const pendingCount = pengajuanList.filter(p => p.status === 'PENDING').length;

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
                  Approval Pengajuan Judul TA
                </h1>
                <p className="text-gray-500 mt-1">
                  Menyetujui atau menolak judul dari mahasiswa dan menetapkan dosen pembimbing
                </p>
              </div>
              <div className="flex gap-3">
                <div className="bg-yellow-100 px-4 py-2 rounded-lg">
                  <span className="text-yellow-800 font-semibold">
                    Menunggu: {pendingCount}
                  </span>
                </div>
                <Button variant="secondary" onClick={fetchData}>
                  🔄 Refresh
                </Button>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 text-xl">ℹ️</div>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Informasi untuk Admin:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Hanya judul dengan status <strong>Menunggu</strong> yang dapat disetujui/ditolak</li>
                    <li>Penolakan harus disertai alasan yang jelas untuk revisi mahasiswa</li>
                    <li>Persetujuan harus memilih <strong>Dosen Pembimbing</strong> yang akan membimbing mahasiswa</li>
                    <li>Pastikan kuota dosen masih tersedia sebelum menyetujui</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Memuat data pengajuan...</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && pengajuanList.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-semibold text-gray-700">Belum ada pengajuan judul</h3>
                <p className="text-gray-500 mt-1">Mahasiswa belum mengajukan judul TA</p>
              </div>
            )}

            {/* List Pengajuan */}
            {!isLoading && pengajuanList.length > 0 && (
              <div className="space-y-4">
                {pengajuanList.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-5 transition-all ${
                      item.status === 'PENDING'
                        ? 'border-yellow-200 bg-yellow-50/30 hover:shadow-md'
                        : item.status === 'APPROVED'
                        ? 'border-green-200 bg-green-50/30'
                        : 'border-red-200 bg-red-50/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Header with status */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <h3 className="font-semibold text-lg text-gray-800">
                            {item.mahasiswa?.nama || 'Unknown'}
                          </h3>
                          <span className="text-sm text-gray-500">
                            NIM: {item.mahasiswa?.nim || '-'}
                          </span>
                          {getStatusBadge(item.status)}
                        </div>

                        {/* Judul */}
                        <div className="mb-3">
                          <p className="text-sm text-gray-500 mb-1">📝 Judul TA:</p>
                          <p className="font-medium text-gray-800">{item.judul}</p>
                        </div>

                        {/* Abstrak (collapsible) */}
                        {item.abstrak && (
                          <div className="mb-3">
                            <button
                              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              {expandedId === item.id ? '📖 Sembunyikan Abstrak' : '📖 Lihat Abstrak'}
                              <svg className={`w-4 h-4 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {expandedId === item.id && (
                              <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{item.abstrak}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tanggal & Dosen Pembimbing */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>📅 Diajukan: {new Date(item.tglAjukan).toLocaleDateString('id-ID')}</span>
                          {item.dosenPembimbing && (
                            <span>👨‍🏫 Dosen Pembimbing: {item.dosenPembimbing.nama}</span>
                          )}
                          {item.tglApproved && (
                            <span>✅ Diproses: {new Date(item.tglApproved).toLocaleDateString('id-ID')}</span>
                          )}
                        </div>

                        {/* Catatan Penolakan */}
                        {item.status === 'REJECTED' && item.catatan && (
                          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-lg">
                            <p className="text-sm font-semibold text-red-800 mb-1">📋 Alasan Penolakan:</p>
                            <p className="text-sm text-red-700">{item.catatan}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - ONLY for PENDING and ADMIN */}
                      {item.status === 'PENDING' && (
                        <div className="flex flex-col gap-2 ml-4 w-64">
                          {/* Pilih Dosen Pembimbing */}
                          <select
                            className="px-3 py-2 border rounded-lg text-sm text-gray-600 bg-white"
                            value={selectedDosen[item.id] || ''}
                            onChange={(e) => setSelectedDosen(prev => ({ ...prev, [item.id]: e.target.value }))}
                          >
                            <option value="">-- Pilih Dosen Pembimbing --</option>
                            {dosenList.map(dosen => {
                              const kuotaTersedia = dosen.kuota - (dosen.terisi || 0);
                              return (
                                <option key={dosen.id} value={dosen.id}>
                                  {dosen.nama} (Kuota: {kuotaTersedia}/{dosen.kuota})
                                </option>
                              );
                            })}
                          </select>
                          <div className="flex gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApprove(item.id)}
                              className="flex-1 whitespace-nowrap"
                            >
                              ✅ Setujui
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleReject(item.id)}
                              className="flex-1 whitespace-nowrap"
                            >
                              ❌ Tolak
                            </Button>
                          </div>
                        </div>
                      )}
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