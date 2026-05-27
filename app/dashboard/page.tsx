// app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Users, FileCheck, Calendar, BookOpen, Activity, Clock, MessageSquare, TrendingUp, UserCog, GraduationCap } from 'lucide-react';
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
  const [stats, setStats] = useState({
    totalMahasiswa: 0,
    totalDosen: 0,
    pengajuanPending: 0,
    jadwalBulanIni: 0,
    bimbinganPending: 0,
    totalBimbingan: 0,
    mahasiswaBimbingan: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const me = await api.getMe();
        const role = me.data?.user?.role;
        
        // 🔒 Cegah akses Mahasiswa (mereka pakai mobile app)
        if (role === 'MAHASISWA') {
          alert('Akses ditolak! Silakan gunakan aplikasi mobile untuk mahasiswa.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        
        setUserData(me.data);
        setUserRole(role);

        if (role === 'ADMIN') {
          // Data untuk Admin
          const dosenList = await api.getDosenList();
          const pengajuanList = await api.getPengajuanList();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pendingPengajuan = pengajuanList?.filter((p: any) => p.status === 'PENDING') || [];
          const jadwalList = await api.getJadwalSidangAll();
          const bimbinganList = await api.getLogBimbinganAll();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pendingBimbingan = bimbinganList?.filter((b: any) => b.status === 'PENDING') || [];

          setStats({
            totalMahasiswa: 0, // TODO: tambah endpoint nanti
            totalDosen: dosenList?.length || 0,
            pengajuanPending: pendingPengajuan.length,
            jadwalBulanIni: jadwalList?.length || 0,
            bimbinganPending: pendingBimbingan.length,
            totalBimbingan: 0,
            mahasiswaBimbingan: 0,
          });
        } 
        else if (role === 'DOSEN') {
          // Data untuk Dosen
          const bimbinganList = await api.getLogBimbinganAll();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const myBimbingan = bimbinganList?.filter((b: any) => b.dosen_nama === me.data?.profile?.nama) || [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pendingBimbingan = myBimbingan.filter((b: any) => b.status === 'PENDING');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const uniqueMahasiswa = new Set(myBimbingan.map((b: any) => b.mahasiswa_id));
          
          const pengajuanList = await api.getPengajuanList();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pendingPengajuan = pengajuanList?.filter((p: any) => p.status === 'PENDING') || [];

          setStats({
            totalMahasiswa: 0,
            totalDosen: 0,
            pengajuanPending: pendingPengajuan.length,
            jadwalBulanIni: 0,
            bimbinganPending: pendingBimbingan.length,
            totalBimbingan: myBimbingan.length,
            mahasiswaBimbingan: uniqueMahasiswa.size,
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ==================== TAMPILAN ADMIN ====================
  if (userRole === 'ADMIN') {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header user={userData?.user} profile={userData?.profile} />
          <main className="p-6">
            {/* Welcome Section Admin */}
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl p-6 mb-6 text-white">
              <h1 className="text-2xl font-bold">Dashboard Admin</h1>
              <p className="text-blue-100 mt-1">Kelola seluruh sistem Manajemen Tugas Akhir</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Mahasiswa" value={stats.totalMahasiswa} icon={GraduationCap} color="bg-blue-500" />
              <StatCard title="Total Dosen" value={stats.totalDosen} icon={Users} color="bg-green-500" />
              <StatCard title="Pengajuan Pending" value={stats.pengajuanPending} icon={FileCheck} color="bg-yellow-500" />
              <StatCard title="Bimbingan Pending" value={stats.bimbinganPending} icon={Activity} color="bg-orange-500" />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-500">Aksi Cepat Admin</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => router.push('/dosen/plotting')} className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-left">
                    <Users className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="font-medium text-gray-500">Plotting Dosen</p>
                    <p className="text-xs text-gray-500">Atur dosen pembimbing</p>
                  </button>
                  <button onClick={() => router.push('/jadwal')} className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-left">
                    <Calendar className="w-6 h-6 text-green-600 mb-2" />
                    <p className="font-medium text-gray-500">Jadwal Sidang</p>
                    <p className="text-xs text-gray-500">Buat jadwal sidang</p>
                  </button>
                  <button onClick={() => router.push('/judul')} className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-left">
                    <FileCheck className="w-6 h-6 text-yellow-600 mb-2" />
                    <p className="font-medium text-gray-500">Approval Judul</p>
                    <p className="text-xs text-gray-500">Review pengajuan judul</p>
                  </button>
                  <button onClick={() => router.push('/bimbingan')} className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-left">
                    <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
                    <p className="font-medium text-gray-500">Log Bimbingan</p>
                    <p className="text-xs text-gray-500">Pantau bimbingan</p>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-500">Info Sistem</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Sistem aktif: {new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">📊 {stats.pengajuanPending} pengajuan menunggu approval</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">📝 {stats.bimbinganPending} log bimbingan pending</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ==================== TAMPILAN DOSEN ====================
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header user={userData?.user} profile={userData?.profile} />
        <main className="p-6">
          {/* Welcome Section Dosen */}
          <div className="bg-linear-to-r from-green-600 to-teal-600 rounded-xl p-6 mb-6 text-white">
            <h1 className="text-2xl font-bold">Selamat Datang, {userData?.profile?.nama || 'Dosen'}</h1>
            <p className="text-green-100 mt-1">Kelola bimbingan dan pengajuan judul mahasiswa</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Total Bimbingan</p>
                  <p className="text-3xl font-bold text-gray-400">{stats.totalBimbingan}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Menunggu Approval</p>
                  <p className="text-3xl font-bold text-yellow-600 ">{stats.bimbinganPending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Mahasiswa Bimbingan</p>
                  <p className="text-3xl font-bold text-gray-400">{stats.mahasiswaBimbingan}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm">Pengajuan Judul</p>
                  <p className="text-3xl font-bold text-gray-400">{stats.pengajuanPending}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-400">Aksi Cepat</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => router.push('/bimbingan')} className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-left">
                  <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-medium text-gray-400">Log Bimbingan</p>
                  <p className="text-xs text-gray-500">Approve/reject bimbingan</p>
                </button>
                <button onClick={() => router.push('/judul')} className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-left">
                  <FileCheck className="w-6 h-6 text-yellow-600 mb-2" />
                  <p className="font-medium text-gray-400">Approval Judul</p>
                  <p className="text-xs text-gray-500">Review judul TA</p>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-400">Statistik Bimbingan</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Approval Rate</span>
                    <span>{stats.totalBimbingan > 0 ? Math.round((stats.totalBimbingan - stats.bimbinganPending) / stats.totalBimbingan * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${stats.totalBimbingan > 0 ? (stats.totalBimbingan - stats.bimbinganPending) / stats.totalBimbingan * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Total {stats.totalBimbingan} pertemuan bimbingan tercatat</span>
                </div>
                <div className="pt-3 border-t">
                  <button 
                    onClick={() => router.push('/bimbingan')}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Lihat semua bimbingan →
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