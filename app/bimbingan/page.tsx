'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

// UPDATE interface LogBimbingan - tambahkan mahasiswa_id
interface LogBimbingan {
  id: string;
  mahasiswa_id?: string;
  mahasiswa_nama: string;
  mahasiswa_nim: string;
  dosen_nama: string;
  pertemuan_ke: number;
  tanggal: string;
  topik: string;
  catatan: string;
  status: 'pending' | 'approved' | 'rejected';
  file_terlampir?: string;
}

export default function LogBimbinganPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogBimbingan | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDosen, setFilterDosen] = useState('all');

  const [bimbinganList, setBimbinganList] = useState<LogBimbingan[]>([
    {
      id: '1',
      mahasiswa_id: '1',
      mahasiswa_nama: 'Budi Santoso',
      mahasiswa_nim: '202101001',
      dosen_nama: 'Dr. Ahmad Rizki, M.Kom',
      pertemuan_ke: 1,
      tanggal: '2026-04-01',
      topik: 'Pembahasan Bab 1 - Pendahuluan',
      catatan: 'Mahasiswa sudah memahami latar belakang masalah. Lanjut ke bab 2 minggu depan.',
      status: 'approved',
    },
    {
      id: '2',
      mahasiswa_id: '1',
      mahasiswa_nama: 'Budi Santoso',
      mahasiswa_nim: '202101001',
      dosen_nama: 'Dr. Ahmad Rizki, M.Kom',
      pertemuan_ke: 2,
      tanggal: '2026-04-08',
      topik: 'Review Bab 2 - Tinjauan Pustaka',
      catatan: 'Tambahkan referensi jurnal internasional minimal 10 tahun terakhir.',
      status: 'approved',
    },
    {
      id: '3',
      mahasiswa_id: '2',
      mahasiswa_nama: 'Ani Wijaya',
      mahasiswa_nim: '202101002',
      dosen_nama: 'Prof. Siti Aminah, M.Sc',
      pertemuan_ke: 1,
      tanggal: '2026-04-03',
      topik: 'Konsultasi Metodologi Penelitian',
      catatan: 'Metode yang digunakan sudah tepat. Siapkan kuesioner untuk uji coba.',
      status: 'pending',
    },
    {
      id: '4',
      mahasiswa_id: '3',
      mahasiswa_nama: 'Citra Dewi',
      mahasiswa_nim: '202101003',
      dosen_nama: 'Dr. Budi Santoso, M.T',
      pertemuan_ke: 3,
      tanggal: '2026-04-10',
      topik: 'Uji Coba Aplikasi',
      catatan: 'Aplikasi berjalan baik. Perbaiki beberapa bug di halaman login.',
      status: 'approved',
    },
  ]);

  const [formData, setFormData] = useState({
    mahasiswa_id: '',
    dosen_id: '',
    topik: '',
    catatan: '',
    tanggal: '',
  });

  const [mahasiswaList] = useState([
    { id: '1', nama: 'Budi Santoso', nim: '202101001', dosen_id: '1' },
    { id: '2', nama: 'Ani Wijaya', nim: '202101002', dosen_id: '2' },
    { id: '3', nama: 'Citra Dewi', nim: '202101003', dosen_id: '3' },
  ]);

  const [dosenList] = useState([
    { id: '1', nama: 'Dr. Ahmad Rizki, M.Kom' },
    { id: '2', nama: 'Prof. Siti Aminah, M.Sc' },
    { id: '3', nama: 'Dr. Budi Santoso, M.T' },
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu Approval' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Disetujui' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mahasiswa = mahasiswaList.find(m => m.id === formData.mahasiswa_id);
    const dosen = dosenList.find(d => d.id === formData.dosen_id);
    const pertemuanCount = bimbinganList.filter(b => b.mahasiswa_id === formData.mahasiswa_id).length + 1;
    
    const newLog: LogBimbingan = {
      id: (bimbinganList.length + 1).toString(),
      mahasiswa_id: formData.mahasiswa_id,
      mahasiswa_nama: mahasiswa?.nama || '',
      mahasiswa_nim: mahasiswa?.nim || '',
      dosen_nama: dosen?.nama || '',
      pertemuan_ke: pertemuanCount,
      tanggal: formData.tanggal,
      topik: formData.topik,
      catatan: formData.catatan,
      status: 'pending',
    };
    setBimbinganList([...bimbinganList, newLog]);
    setIsModalOpen(false);
    setFormData({ mahasiswa_id: '', dosen_id: '', topik: '', catatan: '', tanggal: '' });
  };

  const handleApprove = (id: string) => {
    setBimbinganList(bimbinganList.map(log => 
      log.id === id ? { ...log, status: 'approved' as const } : log
    ));
  };

  const handleReject = (id: string) => {
    setBimbinganList(bimbinganList.map(log => 
      log.id === id ? { ...log, status: 'rejected' as const } : log
    ));
  };

  const filteredBimbingan = bimbinganList.filter(log => {
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (filterDosen !== 'all' && log.dosen_nama !== filterDosen) return false;
    return true;
  });

  const getStatistik = () => {
    const total = bimbinganList.length;
    const approved = bimbinganList.filter(l => l.status === 'approved').length;
    const pending = bimbinganList.filter(l => l.status === 'pending').length;
    return { total, approved, pending };
  };

  const stats = getStatistik();

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          {/* Statistik Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Bimbingan</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.total}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Telah Disetujui</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Menunggu Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-600">Log Bimbingan Mahasiswa</h1>
                <p className="text-gray-600 mt-1">Pantau dan approve log bimbingan</p>
              </div>
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                + Tambah Log Bimbingan
              </Button>
            </div>

            {/* Filter */}
            <div className="flex gap-3 mb-6">
              <select 
                className="px-3 py-2 border rounded-lg text-gray-600"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all" className="text-gray-600">Semua Status</option>
                <option value="pending" className="text-gray-600">Menunggu Approval</option>
                <option value="approved" className="text-gray-600">Disetujui</option>
                <option value="rejected" className="text-gray-600">Ditolak</option>
              </select>
              <select 
                className="px-3 py-2 border rounded-lg text-gray-600"
                value={filterDosen}
                onChange={(e) => setFilterDosen(e.target.value)}
              >
                <option value="all" className="text-gray-600">Semua Dosen</option>
                {dosenList.map(d => (
                  <option key={d.id} value={d.nama} className="text-gray-600">{d.nama}</option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Cari mahasiswa..." 
                className="flex-1 px-3 py-2 border rounded-lg text-gray-600 placeholder-gray-400"
              />
            </div>

            {/* Tabel Log Bimbingan */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-gray-600 font-medium">Mahasiswa</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Dosen</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Pertemuan Ke-</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Tanggal</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Topik</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBimbingan.map((log) => (
                    <tr key={log.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-gray-600">{log.mahasiswa_nama}</p>
                          <p className="text-xs text-gray-600">{log.mahasiswa_nim}</p>
                        </div>
                       </td>
                      <td className="p-3 text-gray-600">{log.dosen_nama}</td>
                      <td className="p-3 text-center text-gray-600">{log.pertemuan_ke}</td>
                      <td className="p-3 text-gray-600">{log.tanggal}</td>
                      <td className="p-3">
                        <p className="max-w-xs truncate text-gray-600">{log.topik}</p>
                       </td>
                      <td className="p-3">{getStatusBadge(log.status)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            Detail
                          </Button>
                          {log.status === 'pending' && (
                            <>
                              <Button 
                                variant="success" 
                                size="sm"
                                onClick={() => handleApprove(log.id)}
                              >
                                Approve
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleReject(log.id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredBimbingan.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600">Tidak ada data bimbingan</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Detail Log Bimbingan */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Detail Log Bimbingan">
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Mahasiswa</label>
                <p className="font-medium text-gray-600">{selectedLog.mahasiswa_nama}</p>
                <p className="text-sm text-gray-600">{selectedLog.mahasiswa_nim}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Dosen Pembimbing</label>
                <p className="font-medium text-gray-600">{selectedLog.dosen_nama}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Pertemuan Ke-</label>
              <p className="font-medium text-gray-600">{selectedLog.pertemuan_ke}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Tanggal</label>
              <p className="font-medium text-gray-600">{selectedLog.tanggal}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Topik Bimbingan</label>
              <div className="bg-gray-50 p-3 rounded-lg mt-1">
                <p className="text-gray-600">{selectedLog.topik}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Catatan / Revisi</label>
              <div className="bg-gray-50 p-3 rounded-lg mt-1">
                <p className="whitespace-pre-wrap text-gray-600">{selectedLog.catatan}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>Tutup</Button>
              {selectedLog.status === 'pending' && (
                <>
                  <Button variant="success" onClick={() => {
                    handleApprove(selectedLog.id);
                    setSelectedLog(null);
                  }}>Approve</Button>
                  <Button variant="danger" onClick={() => {
                    handleReject(selectedLog.id);
                    setSelectedLog(null);
                  }}>Reject</Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Tambah Log Bimbingan */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Log Bimbingan">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Mahasiswa</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-gray-600"
              value={formData.mahasiswa_id}
              onChange={(e) => {
                const mhs = mahasiswaList.find(m => m.id === e.target.value);
                setFormData({ 
                  ...formData, 
                  mahasiswa_id: e.target.value,
                  dosen_id: mhs?.dosen_id || ''
                });
              }}
              required
            >
              <option value="" className="text-gray-600">Pilih Mahasiswa</option>
              {mahasiswaList.map(m => (
                <option key={m.id} value={m.id} className="text-gray-600">{m.nama} - {m.nim}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Dosen Pembimbing</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
              value={dosenList.find(d => d.id === formData.dosen_id)?.nama || ''}
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Tanggal Bimbingan</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg text-gray-600"
              value={formData.tanggal}
              onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Topik Bimbingan</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg text-gray-600 placeholder-gray-400"
              placeholder="Contoh: Pembahasan Bab 3 Metodologi"
              value={formData.topik}
              onChange={(e) => setFormData({ ...formData, topik: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Catatan / Revisi</label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border rounded-lg text-gray-600 placeholder-gray-400"
              placeholder="Tulis catatan bimbingan..."
              value={formData.catatan}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary">Simpan Log</Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}