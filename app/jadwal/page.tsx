'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface JadwalSidang {
  id: string;
  mahasiswaId: string;
  mahasiswa_nama: string;
  mahasiswa_nim: string;
  judul_ta: string;
  dosenPembimbingId: string;
  dosen_pembimbing: string;
  dosenPengujiId: string;
  dosen_penguji: string;
  tanggal: string;
  jam: string;
  ruang: string;
  status: string;
}

interface MahasiswaOption {
  id: string;
  nama: string;
  nim: string;
  judul?: string;
  dosenPembimbingId?: string;
}

interface DosenOption {
  id: string;
  nama: string;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  const map: Record<string, { bg: string; text: string; label: string }> = {
    scheduled: { bg: 'bg-blue-100',   text: 'text-blue-800',   label: 'Terjadwal' },
    completed: { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Selesai' },
    cancelled: { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Dibatalkan' },
  };
  const c = map[s] ?? { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

export default function JadwalSidangPage() {
  const router = useRouter();
  const [isLoading, setIsLoading]   = useState(true);
  const [isSaving, setIsSaving]     = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<JadwalSidang | null>(null);
  const [jadwalList, setJadwalList] = useState<JadwalSidang[]>([]);
  const [mahasiswaOptions, setMahasiswaOptions] = useState<MahasiswaOption[]>([]);
  const [dosenOptions, setDosenOptions] = useState<DosenOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    mahasiswaId: '',
    dosenPembimbingId: '',
    dosenPengujiId: '',
    tanggal: '',
    jam: '',
    ruang: '',
  });

  // ── Fetch semua data dari API ──
  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch jadwal sidang dari BE
      const jadwalRes = await api.getJadwalSidangAll();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const jadwal: JadwalSidang[] = (jadwalRes || []).map((j: any) => ({
        id:               j.id,
        mahasiswaId:      j.mahasiswaId,
        mahasiswa_nama:   j.mahasiswa?.nama       || j.mahasiswa_nama  || '-',
        mahasiswa_nim:    j.mahasiswa?.nim        || j.mahasiswa_nim   || '-',
        judul_ta:         j.judul                 || '-',
        dosenPembimbingId: j.dosenPembimbingId,
        dosen_pembimbing: j.dosenPembimbing?.nama  || j.dosen_pembimbing || '-',
        dosenPengujiId:   j.dosenPengujiId,
        dosen_penguji:    j.dosenPenguji?.nama     || j.dosen_penguji    || '-',
        tanggal:          j.tanggal               || '-',
        jam:              j.jam                   || '-',
        ruang:            j.ruang                 || '-',
        status:           j.status                || 'scheduled',
      }));
      setJadwalList(jadwal);

      // Fetch dosen dari BE (Admin only endpoint)
      const dosenRes = await api.getDosenList();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDosenOptions((dosenRes || []).map((d: any) => ({ id: d.id, nama: d.nama })));

      // ✅ Mahasiswa dari pengajuan yang sudah APPROVED (karena /mahasiswa tidak ada di BE)
      const pengajuanRes = await api.getPengajuanList();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const approvedPengajuan = (pengajuanRes || []).filter((p: any) => p.status === 'APPROVED' || p.status === 'approved');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mhsMap = new Map<string, MahasiswaOption>();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      approvedPengajuan.forEach((p: any) => {
        const mhsId = p.mahasiswaId;
        if (mhsId && !mhsMap.has(mhsId)) {
          mhsMap.set(mhsId, {
            id:    mhsId,
            nama:  p.mahasiswa?.nama || '-',
            nim:   p.mahasiswa?.nim  || '-',
            judul: p.judul,
            dosenPembimbingId: p.dosenPembimbingId,
          });
        }
      });
      setMahasiswaOptions(Array.from(mhsMap.values()));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data. Pastikan server backend aktif.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Route Guard + init ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    const init = async () => {
      try {
        const me = await api.getMe();
        const role = me.data?.user?.role;
        if (role !== 'ADMIN') { router.push('/dashboard'); return; }
        await fetchAll();
      } catch {
        router.push('/login');
      }
    };
    init();
  }, [router, fetchAll]);

  // ── Filter ──
  const filtered = jadwalList.filter(j => {
    const statusOK = filterStatus === 'all' || j.status.toLowerCase() === filterStatus;
    const searchOK = searchQuery === '' ||
      j.mahasiswa_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.mahasiswa_nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.judul_ta.toLowerCase().includes(searchQuery.toLowerCase());
    return statusOK && searchOK;
  });

  // ── Buka modal tambah ──
  const handleOpenCreate = () => {
    setEditingJadwal(null);
    setFormData({ mahasiswaId: '', dosenPembimbingId: '', dosenPengujiId: '', tanggal: '', jam: '', ruang: '' });
    setIsModalOpen(true);
  };

  // ── Buka modal edit ──
  const handleEdit = (jadwal: JadwalSidang) => {
    setEditingJadwal(jadwal);
    setFormData({
      mahasiswaId:       jadwal.mahasiswaId,
      dosenPembimbingId: jadwal.dosenPembimbingId,
      dosenPengujiId:    jadwal.dosenPengujiId,
      tanggal:           jadwal.tanggal,
      jam:               jadwal.jam,
      ruang:             jadwal.ruang,
    });
    setIsModalOpen(true);
  };

  // ── Simpan (create / edit) → panggil API ──
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.dosenPembimbingId === formData.dosenPengujiId) {
      alert('Dosen Pembimbing dan Dosen Penguji tidak boleh sama.');
      return;
    }
    setIsSaving(true);
    try {
      if (editingJadwal) {
        await api.updateJadwalSidang(editingJadwal.id, {
          tanggal: formData.tanggal,
          jam:     formData.jam,
          ruang:   formData.ruang,
        });
      } else {
        await api.createJadwalSidang({
          mahasiswaId:       formData.mahasiswaId,
          dosenPembimbingId: formData.dosenPembimbingId,
          dosenPengujiId:    formData.dosenPengujiId,
          tanggal:           formData.tanggal,
          jam:               formData.jam,
          ruang:             formData.ruang,
        });
      }
      setIsModalOpen(false);
      await fetchAll();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Cancel jadwal → panggil API ──
  const handleCancel = async (id: string) => {
    if (!confirm('Batalkan jadwal sidang ini?')) return;
    try {
      await api.cancelJadwalSidang(id);
      await fetchAll();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      alert('Gagal membatalkan jadwal: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
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
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex justify-between">
              <span>{error}</span>
              <button onClick={fetchAll} className="font-medium underline">Coba lagi</button>
            </div>
          )}

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-600">Jadwal Sidang Skripsi</h1>
                <p className="text-gray-600 mt-1">Kelola jadwal sidang mahasiswa</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={fetchAll}>🔄 Refresh</Button>
                <Button variant="primary" onClick={handleOpenCreate}>+ Buat Jadwal</Button>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-3 mb-6">
              <select
                className="px-3 py-2 border rounded-lg text-gray-600"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="all">Semua Status</option>
                <option value="scheduled">Terjadwal</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
              <input
                type="text"
                placeholder="Cari mahasiswa / NIM / judul..."
                className="flex-1 px-3 py-2 border rounded-lg text-gray-600 placeholder-gray-400"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-gray-600 font-medium">Mahasiswa</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Judul TA</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Dosen Pembimbing</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Dosen Penguji</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Tanggal & Waktu</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Ruang</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Status</th>
                    <th className="text-left p-3 text-gray-600 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(jadwal => (
                    <tr key={jadwal.id} className="border-t border-gray-200 hover:bg-gray-50 transition">
                      <td className="p-3">
                        <p className="font-medium text-gray-700">{jadwal.mahasiswa_nama}</p>
                        <p className="text-xs text-gray-500">{jadwal.mahasiswa_nim}</p>
                      </td>
                      <td className="p-3 text-gray-600 max-w-xs truncate text-sm">{jadwal.judul_ta}</td>
                      <td className="p-3 text-gray-600 text-sm">{jadwal.dosen_pembimbing}</td>
                      <td className="p-3 text-gray-600 text-sm">{jadwal.dosen_penguji}</td>
                      <td className="p-3 text-gray-600 text-sm">
                        <p>{jadwal.tanggal}</p>
                        <p className="text-xs text-gray-500">{jadwal.jam}</p>
                      </td>
                      <td className="p-3 text-gray-600 text-sm">{jadwal.ruang}</td>
                      <td className="p-3"><StatusBadge status={jadwal.status} /></td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {jadwal.status.toLowerCase() !== 'cancelled' && (
                            <>
                              <Button variant="secondary" size="sm" onClick={() => handleEdit(jadwal)}>Edit</Button>
                              {jadwal.status.toLowerCase() === 'scheduled' && (
                                <Button variant="danger" size="sm" onClick={() => handleCancel(jadwal.id)}>Batalkan</Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center p-10 text-gray-500">
                        {jadwalList.length === 0 ? 'Belum ada jadwal sidang. Klik "+ Buat Jadwal" untuk menambah.' : 'Tidak ada jadwal yang sesuai filter.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Buat / Edit Jadwal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJadwal ? 'Edit Jadwal Sidang' : 'Buat Jadwal Sidang Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Mahasiswa (hanya saat create) */}
          {!editingJadwal && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Mahasiswa</label>
              <select
                className="w-full px-3 py-2 border rounded-lg text-gray-600"
                value={formData.mahasiswaId}
                onChange={e => {
                  const selected = mahasiswaOptions.find(m => m.id === e.target.value);
                  setFormData({
                    ...formData,
                    mahasiswaId: e.target.value,
                    dosenPembimbingId: selected?.dosenPembimbingId || '',
                  });
                }}
                required
              >
                <option value="">-- Pilih Mahasiswa (judul sudah disetujui) --</option>
                {mahasiswaOptions.map(m => (
                  <option key={m.id} value={m.id}>{m.nama} — {m.nim}{m.judul ? ` — ${m.judul}` : ''}</option>
                ))}
              </select>
              {mahasiswaOptions.length === 0 && (
                <p className="text-xs text-yellow-600 mt-1">⚠ Tidak ada mahasiswa dengan pengajuan judul yang sudah diapprove.</p>
              )}
            </div>
          )}

          {/* Dosen Pembimbing (hanya saat create) */}
          {!editingJadwal && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Dosen Pembimbing</label>
              <select
                className="w-full px-3 py-2 border rounded-lg text-gray-600"
                value={formData.dosenPembimbingId}
                onChange={e => setFormData({ ...formData, dosenPembimbingId: e.target.value })}
                required
              >
                <option value="">-- Dosen pembimbing otomatis dari pengajuan --</option>
                {dosenOptions
                  .filter(d => d.id !== formData.dosenPengujiId)
                  .map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
          )}

          {/* Dosen Penguji (hanya saat create) */}
          {!editingJadwal && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Dosen Penguji</label>
              <select
                className="w-full px-3 py-2 border rounded-lg text-gray-600"
                value={formData.dosenPengujiId}
                onChange={e => setFormData({ ...formData, dosenPengujiId: e.target.value })}
                required
              >
                <option value="">-- Pilih Dosen Penguji --</option>
                {dosenOptions
                  .filter(d => d.id !== formData.dosenPembimbingId)
                  .map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg text-gray-600"
              value={formData.tanggal}
              onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Jam</label>
            <input
              type="time"
              className="w-full px-3 py-2 border rounded-lg text-gray-600"
              value={formData.jam}
              onChange={e => setFormData({ ...formData, jam: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Ruang</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-lg text-gray-600 placeholder-gray-400"
              placeholder="Contoh: Ruang Sidang A"
              value={formData.ruang}
              onChange={e => setFormData({ ...formData, ruang: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : (editingJadwal ? 'Simpan Perubahan' : 'Buat Jadwal')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
