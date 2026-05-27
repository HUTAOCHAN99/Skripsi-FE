'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';

interface PengajuanJudul {
  id: string;
  mahasiswa_nama: string;
  mahasiswa_nim: string;
  judul: string;
  dosen_pembimbing?: string;
  tgl_ajukan: string;
  status: 'pending' | 'approved' | 'rejected';
  catatan?: string;
}

export default function PengajuanJudulPage() {
  const [pengajuanList, setPengajuanList] = useState<PengajuanJudul[]>([
    {
      id: '1',
      mahasiswa_nama: 'Budi Santoso',
      mahasiswa_nim: '202101001',
      judul: 'Implementasi Deep Learning untuk Klasifikasi Citra Medis',
      tgl_ajukan: '2026-05-01',
      status: 'pending',
    },
    {
      id: '2',
      mahasiswa_nama: 'Ani Wijaya',
      mahasiswa_nim: '202101002',
      judul: 'Analisis Sentimen di Twitter Menggunakan BERT',
      tgl_ajukan: '2026-05-02',
      status: 'pending',
    },
    {
      id: '3',
      mahasiswa_nama: 'Citra Dewi',
      mahasiswa_nim: '202101003',
      judul: 'Pengembangan Sistem Rekomendasi E-Commerce',
      dosen_pembimbing: 'Dr. Ahmad Rizki, M.Kom',
      tgl_ajukan: '2026-04-28',
      status: 'approved',
    },
  ]);

  const [dosenList] = useState([
    'Dr. Ahmad Rizki, M.Kom',
    'Prof. Siti Aminah, M.Sc',
    'Dr. Budi Santoso, M.T',
  ]);

  const handleApprove = (id: string, dosen: string) => {
    setPengajuanList(pengajuanList.map(p => 
      p.id === id ? { ...p, status: 'approved', dosen_pembimbing: dosen } : p
    ));
  };

  const handleReject = (id: string) => {
    const catatan = prompt('Masukkan alasan penolakan:');
    if (catatan) {
      setPengajuanList(pengajuanList.map(p => 
        p.id === id ? { ...p, status: 'rejected', catatan } : p
      ));
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config[status as keyof typeof config]}`}>
      {status.toUpperCase()}
    </span>;
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-600 mb-6">Pengajuan Judul TA</h1>
            
            <div className="space-y-4">
              {pengajuanList.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-600">{item.mahasiswa_nama}</h3>
                        <span className="text-sm text-gray-600">NIM: {item.mahasiswa_nim}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-gray-600 mb-2">{item.judul}</p>
                      <p className="text-sm text-gray-600">Tanggal: {item.tgl_ajukan}</p>
                      {item.dosen_pembimbing && (
                        <p className="text-sm text-green-600 mt-1">
                          Dosen Pembimbing: {item.dosen_pembimbing}
                        </p>
                      )}
                      {item.catatan && (
                        <p className="text-sm text-red-600 mt-1">Catatan: {item.catatan}</p>
                      )}
                    </div>
                    {item.status === 'pending' && (
                      <div className="flex gap-2">
                        <select 
                          className="px-3 py-1 border rounded-lg text-sm text-gray-600"
                          defaultValue=""
                          onChange={(e) => handleApprove(item.id, e.target.value)}
                        >
                          <option value="" className="text-gray-600">Pilih Dosen</option>
                          {dosenList.map(d => (
                            <option key={d} value={d} className="text-gray-600">{d}</option>
                          ))}
                        </select>
                        <Button variant="danger" size="sm" onClick={() => handleReject(item.id)}>
                          Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}