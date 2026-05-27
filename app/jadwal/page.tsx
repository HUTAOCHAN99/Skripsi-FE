'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

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
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function JadwalSidangPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<JadwalSidang | null>(null);
  const [jadwalList, setJadwalList] = useState<JadwalSidang[]>([
    {
      id: '1',
      mahasiswa_nama: 'Budi Santoso',
      mahasiswa_nim: '202101001',
      judul_ta: 'Implementasi AI untuk Deteksi Dini Penyakit',
      dosen_pembimbing: 'Dr. Ahmad Rizki, M.Kom',
      dosen_penguji: 'Prof. Siti Aminah, M.Sc',
      tanggal: '2026-05-20',
      jam: '09:00',
      ruang: 'Ruang Sidang A',
      status: 'scheduled',
    },
    {
      id: '2',
      mahasiswa_nama: 'Ani Wijaya',
      mahasiswa_nim: '202101002',
      judul_ta: 'Analisis Sentimen Media Sosial dengan NLP',
      dosen_pembimbing: 'Prof. Siti Aminah, M.Sc',
      dosen_penguji: 'Dr. Budi Santoso, M.T',
      tanggal: '2026-05-21',
      jam: '13:00',
      ruang: 'Ruang Sidang B',
      status: 'scheduled',
    },
    {
      id: '3',
      mahasiswa_nama: 'Citra Dewi',
      mahasiswa_nim: '202101003',
      judul_ta: 'Pengembangan Aplikasi E-Learning Berbasis Mobile',
      dosen_pembimbing: 'Dr. Budi Santoso, M.T',
      dosen_penguji: 'Dr. Ahmad Rizki, M.Kom',
      tanggal: '2026-05-18',
      jam: '10:00',
      ruang: 'Ruang Sidang A',
      status: 'completed',
    },
  ]);

  const [formData, setFormData] = useState({
    mahasiswa_id: '',
    dosen_pembimbing_id: '',
    dosen_penguji_id: '',
    tanggal: '',
    jam: '',
    ruang: '',
  });

  const [mahasiswaList] = useState([
    { id: '1', nama: 'Budi Santoso', nim: '202101001' },
    { id: '2', nama: 'Ani Wijaya', nim: '202101002' },
    { id: '3', nama: 'Citra Dewi', nim: '202101003' },
    { id: '4', nama: 'Dedi Firmansyah', nim: '202101004' },
  ]);

  const [dosenList] = useState([
    { id: '1', nama: 'Dr. Ahmad Rizki, M.Kom' },
    { id: '2', nama: 'Prof. Siti Aminah, M.Sc' },
    { id: '3', nama: 'Dr. Budi Santoso, M.T' },
  ]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terjadwal' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Dibatalkan' },
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
    if (editingJadwal) {
      setJadwalList(jadwalList.map(j => 
        j.id === editingJadwal.id 
          ? {
              ...j,
              dosen_pembimbing: dosenList.find(d => d.id === formData.dosen_pembimbing_id)?.nama || '',
              dosen_penguji: dosenList.find(d => d.id === formData.dosen_penguji_id)?.nama || '',
              tanggal: formData.tanggal,
              jam: formData.jam,
              ruang: formData.ruang,
            }
          : j
      ));
      setEditingJadwal(null);
    } else {
      const newJadwal: JadwalSidang = {
        id: (jadwalList.length + 1).toString(),
        mahasiswa_nama: mahasiswaList.find(m => m.id === formData.mahasiswa_id)?.nama || '',
        mahasiswa_nim: mahasiswaList.find(m => m.id === formData.mahasiswa_id)?.nim || '',
        judul_ta: 'Judul TA akan diisi otomatis',
        dosen_pembimbing: dosenList.find(d => d.id === formData.dosen_pembimbing_id)?.nama || '',
        dosen_penguji: dosenList.find(d => d.id === formData.dosen_penguji_id)?.nama || '',
        tanggal: formData.tanggal,
        jam: formData.jam,
        ruang: formData.ruang,
        status: 'scheduled',
      };
      setJadwalList([...jadwalList, newJadwal]);
    }
    setIsModalOpen(false);
    setFormData({ mahasiswa_id: '', dosen_pembimbing_id: '', dosen_penguji_id: '', tanggal: '', jam: '', ruang: '' });
  };

  const handleCancel = (id: string) => {
    setJadwalList(jadwalList.map(j => 
      j.id === id ? { ...j, status: 'cancelled' as const } : j
    ));
  };

  const handleEdit = (jadwal: JadwalSidang) => {
    setEditingJadwal(jadwal);
    setFormData({
      mahasiswa_id: '',
      dosen_pembimbing_id: dosenList.find(d => d.nama === jadwal.dosen_pembimbing)?.id || '',
      dosen_penguji_id: dosenList.find(d => d.nama === jadwal.dosen_penguji)?.id || '',
      tanggal: jadwal.tanggal,
      jam: jadwal.jam,
      ruang: jadwal.ruang,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-600">Jadwal Sidang Skripsi</h1>
                <p className="text-gray-600 mt-1">Kelola jadwal sidang mahasiswa</p>
              </div>
              <Button variant="primary" onClick={() => {
                setEditingJadwal(null);
                setFormData({ mahasiswa_id: '', dosen_pembimbing_id: '', dosen_penguji_id: '', tanggal: '', jam: '', ruang: '' });
                setIsModalOpen(true);
              }}>
                + Buat Jadwal Baru
              </Button>
            </div>

            {/* Filter */}
            <div className="flex gap-3 mb-6">
              <select className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-600">
                <option className="text-gray-600">Semua Status</option>
                <option className="text-gray-600">Terjadwal</option>
                <option className="text-gray-600">Selesai</option>
                <option className="text-gray-600">Dibatalkan</option>
              </select>
              <select className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-600">
                <option className="text-gray-600">Semua Ruangan</option>
                <option className="text-gray-600">Ruang Sidang A</option>
                <option className="text-gray-600">Ruang Sidang B</option>
                <option className="text-gray-600">Ruang Sidang C</option>
              </select>
              <input 
                type="text" 
                placeholder="Cari mahasiswa..." 
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-600 placeholder-gray-400"
              />
            </div>

            {/* Daftar Jadwal */}
            <div className="space-y-4">
              {jadwalList.map((jadwal) => (
                <div key={jadwal.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-600">{jadwal.mahasiswa_nama}</h3>
                        <span className="text-sm text-gray-600">NIM: {jadwal.mahasiswa_nim}</span>
                        {getStatusBadge(jadwal.status)}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{jadwal.judul_ta}</p>
                      <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-600">Dosen Pembimbing:</span>
                          <p className="font-medium text-gray-600">{jadwal.dosen_pembimbing}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Dosen Penguji:</span>
                          <p className="font-medium text-gray-600">{jadwal.dosen_penguji}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Tanggal & Jam:</span>
                          <p className="font-medium text-gray-600">{jadwal.tanggal} | {jadwal.jam} WIB</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Ruang:</span>
                          <p className="font-medium text-gray-600">{jadwal.ruang}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {jadwal.status === 'scheduled' && (
                        <>
                          <Button variant="secondary" size="sm" onClick={() => handleEdit(jadwal)}>
                            Edit
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleCancel(jadwal.id)}>
                            Batal
                          </Button>
                        </>
                      )}
                      <Button variant="primary" size="sm">
                        Detail
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Buat/Edit Jadwal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingJadwal ? "Edit Jadwal Sidang" : "Buat Jadwal Sidang"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingJadwal && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Mahasiswa</label>
              <select
                className="w-full px-3 py-2 border rounded-lg text-gray-600"
                value={formData.mahasiswa_id}
                onChange={(e) => setFormData({ ...formData, mahasiswa_id: e.target.value })}
                required
              >
                <option value="" className="text-gray-600">Pilih Mahasiswa</option>
                {mahasiswaList.map(m => (
                  <option key={m.id} value={m.id} className="text-gray-600">{m.nama} - {m.nim}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Dosen Pembimbing</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-gray-600"
              value={formData.dosen_pembimbing_id}
              onChange={(e) => setFormData({ ...formData, dosen_pembimbing_id: e.target.value })}
              required
            >
              <option value="" className="text-gray-600">Pilih Dosen Pembimbing</option>
              {dosenList.map(d => (
                <option key={d.id} value={d.id} className="text-gray-600">{d.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Dosen Penguji</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-gray-600"
              value={formData.dosen_penguji_id}
              onChange={(e) => setFormData({ ...formData, dosen_penguji_id: e.target.value })}
              required
            >
              <option value="" className="text-gray-600">Pilih Dosen Penguji</option>
              {dosenList.map(d => (
                <option key={d.id} value={d.id} className="text-gray-600">{d.nama}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Tanggal</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-lg text-gray-600"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Jam</label>
              <input
                type="time"
                className="w-full px-3 py-2 border rounded-lg text-gray-600"
                value={formData.jam}
                onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Ruang</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-gray-600"
              value={formData.ruang}
              onChange={(e) => setFormData({ ...formData, ruang: e.target.value })}
              required
            >
              <option value="" className="text-gray-600">Pilih Ruang</option>
              <option className="text-gray-600">Ruang Sidang A</option>
              <option className="text-gray-600">Ruang Sidang B</option>
              <option className="text-gray-600">Ruang Sidang C</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="primary">{editingJadwal ? "Update Jadwal" : "Simpan Jadwal"}</Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}