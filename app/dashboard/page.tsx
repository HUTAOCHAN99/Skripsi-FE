// app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, FileCheck, Calendar, Activity, Clock,
  MessageSquare, TrendingUp, GraduationCap, CheckCircle,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import { api } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');

  // ─── Admin stats ───
  const [adminStats, setAdminStats] = useState({
    totalDosen: 0,
    pengajuanPending: 0,
    jadwalBulanIni: 0,
    bimbinganPending: 0,
  });

  // ─── Dosen stats (hanya bimbingan mahasiswanya) ───
  const [dosenStats, setDosenStats] = useState({
    mahasiswaBimbingan: 0,
    totalBimbingan: 0,
    pertemuanBulanIni: 0,
    approvalRate: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }

    const fetchData = async () => {
      try {
        const me = await api.getMe();
        const role = me.data?.user?.role;

        if (role === 'MAHASISWA') {
          alert('Akses ditolak! Gunakan aplikasi mobile untuk mahasiswa.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }

        setUserData(me.data);
        setUserRole(role);

        if (role === 'ADMIN') {
          const [dosenList, pengajuanList, jadwalList, bimbinganList] = await Promise.all([
            api.getDosenList(),
            api.getPengajuanList(),
            api.getJadwalSidangAll(),
            api.getLogBimbinganAll(),
          ]);

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pendingPengajuan = (pengajuanList || []).filter((p: any) => p.status === 'PENDING');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pendingBimbingan = (bimbinganList || []).filter((b: any) => b.status === 'PENDING');

          setAdminStats({
            totalDosen: (dosenList || []).length,
            pengajuanPending: pendingPengajuan.length,
            jadwalBulanIni: (jadwalList || []).length,
            bimbinganPending: pendingBimbingan.length,
          });

        } else if (role === 'DOSEN') {
          // Dosen: mahasiswa bimbingan dihitung dari pengajuan yang sudah APPROVED.
          // Judul yang masih PENDING berada di menu Review Judul.
          const [pengajuanList, bimbinganList] = await Promise.all([
            api.getPengajuanList(),
            api.getLogBimbinganByDosen(),
          ]);
          const list = bimbinganList || [];

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const approvedPengajuan = (pengajuanList || []).filter((p: any) => p.status === 'APPROVED' || p.status === 'approved');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const uniqueMahasiswa = new Set(approvedPengajuan.map((p: any) => p.mahasiswaId || p.mahasiswa?.id).filter(Boolean));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const approved = list.filter((b: any) => b.status === 'APPROVED' || b.status === 'approved').length;

          const now = new Date();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const bulanIni = list.filter((b: any) => {
            const d = new Date(b.tanggal);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          });

          setDosenStats({
            mahasiswaBimbingan: uniqueMahasiswa.size,
            totalBimbingan: list.length,
            pertemuanBulanIni: bulanIni.length,
            approvalRate: list.length > 0 ? Math.round((approved / list.length) * 100) : 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════
  //  TAMPILAN ADMIN
  // ══════════════════════════════════
  if (userRole === 'ADMIN') {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header user={userData?.user} profile={userData?.profile} />
          <main className="p-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 mb-6 text-white">
              <h1 className="text-2xl font-bold">Dashboard Admin</h1>
              <p className="text-blue-100 mt-1">Kelola seluruh sistem Manajemen Tugas Akhir</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Dosen" value={adminStats.totalDosen} icon={Users} color="bg-green-500" />
              <StatCard title="Pengajuan Pending" value={adminStats.pengajuanPending} icon={FileCheck} color="bg-yellow-500" />
              <StatCard title="Jadwal Sidang" value={adminStats.jadwalBulanIni} icon={Calendar} color="bg-blue-500" />
              <StatCard title="Bimbingan Pending" value={adminStats.bimbinganPending} icon={Activity} color="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-600">Aksi Cepat Admin</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => router.push('/dosen/plotting')} className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-left">
                    <Users className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="font-medium text-gray-600">Plotting Dosen</p>
                    <p className="text-xs text-gray-500">Atur dosen pembimbing</p>
                  </button>
                  <button onClick={() => router.push('/jadwal')} className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-left">
                    <Calendar className="w-6 h-6 text-green-600 mb-2" />
                    <p className="font-medium text-gray-600">Jadwal Sidang</p>
                    <p className="text-xs text-gray-500">Buat jadwal sidang</p>
                  </button>
                  <button onClick={() => router.push('/berkas')} className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-left">
                    <FileCheck className="w-6 h-6 text-yellow-600 mb-2" />
                    <p className="font-medium text-gray-600">Pengajuan Judul</p>
                    <p className="text-xs text-gray-500">Assign dosen pembimbing</p>
                  </button>
                  <button onClick={() => router.push('/bimbingan')} className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-left">
                    <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
                    <p className="font-medium text-gray-600">Monitor Bimbingan</p>
                    <p className="text-xs text-gray-500">Pantau bimbingan</p>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-600">Info Sistem</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Sistem aktif: {new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">📝 {adminStats.pengajuanPending} pengajuan judul menunggu assign/review</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">⏳ {adminStats.bimbinganPending} log bimbingan menunggu approve dosen</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">📅 {adminStats.jadwalBulanIni} jadwal sidang terdaftar</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════
  //  TAMPILAN DOSEN
  // ══════════════════════════════════
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header user={userData?.user} profile={userData?.profile} />
        <main className="p-6">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 mb-6 text-white">
            <h1 className="text-2xl font-bold">Selamat Datang, {userData?.profile?.nama || 'Dosen'}</h1>
            <p className="text-green-100 mt-1">Kelola bimbingan dan jadwal sidang mahasiswa Anda</p>
          </div>

          {/* Stats khusus Dosen — tidak ada pengajuan pending (itu urusan Admin) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Mahasiswa Bimbingan</p>
                  <p className="text-3xl font-bold text-gray-700">{dosenStats.mahasiswaBimbingan}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total Pertemuan</p>
                  <p className="text-3xl font-bold text-gray-700">{dosenStats.totalBimbingan}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Pertemuan Bulan Ini</p>
                  <p className="text-3xl font-bold text-gray-700">{dosenStats.pertemuanBulanIni}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Approval Rate</p>
                  <p className="text-3xl font-bold text-green-600">{dosenStats.approvalRate}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-600">Aksi Cepat</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => router.push('/judul')} className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-left">
                  <FileCheck className="w-6 h-6 text-yellow-600 mb-2" />
                  <p className="font-medium text-gray-600">Review Judul</p>
                  <p className="text-xs text-gray-500">Approve/reject judul</p>
                </button>
                <button onClick={() => router.push('/mahasiswa-bimbingan')} className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-left">
                  <GraduationCap className="w-6 h-6 text-green-600 mb-2" />
                  <p className="font-medium text-gray-600">Mahasiswa Bimbingan</p>
                  <p className="text-xs text-gray-500">Lihat daftar mahasiswa</p>
                </button>
                <button onClick={() => router.push('/bimbingan')} className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-left">
                  <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-medium text-gray-600">Log Bimbingan</p>
                  <p className="text-xs text-gray-500">Tambah & approve log</p>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-600">Statistik Bimbingan</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Approval Rate</span>
                    <span className="font-medium">{dosenStats.approvalRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${dosenStats.approvalRate}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>{dosenStats.pertemuanBulanIni} pertemuan bimbingan bulan ini</span>
                </div>
                <div className="pt-3 border-t">
                  <button onClick={() => router.push('/bimbingan')} className="text-green-600 hover:text-green-700 text-sm font-medium">
                    Lihat semua log bimbingan →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
