// app/dashboard/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  FileCheck,
  Calendar,
  Activity,
  Clock,
  MessageSquare,
  TrendingUp,
  GraduationCap,
  CheckCircle,
} from 'lucide-react';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import { api } from '@/lib/api';

interface UserData {
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  profile?: {
    nama?: string;
    nip?: string;
    nim?: string;
  };
}

interface AdminStats {
  totalDosen: number;
  pengajuanPending: number;
  jadwalBulanIni: number;
  totalBimbingan: number;
}

interface DosenStats {
  mahasiswaBimbingan: number;
  totalBimbingan: number;
  pertemuanBulanIni: number;
  logTercatat: number;
}

type ApiRecord = Record<string, unknown>;

const getArrayData = (response: unknown): ApiRecord[] => {
  if (Array.isArray(response)) {
    return response as ApiRecord[];
  }

  if (response && typeof response === 'object') {
    const res = response as { data?: unknown };

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

export default function DashboardPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalDosen: 0,
    pengajuanPending: 0,
    jadwalBulanIni: 0,
    totalBimbingan: 0,
  });

  const [dosenStats, setDosenStats] = useState<DosenStats>({
    mahasiswaBimbingan: 0,
    totalBimbingan: 0,
    pertemuanBulanIni: 0,
    logTercatat: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const me = await api.getMe();
      const role = me.data?.user?.role || '';

      if (role === 'MAHASISWA') {
        alert('Akses ditolak! Gunakan aplikasi mobile untuk mahasiswa.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        router.push('/login');
        return;
      }

      setUserData(me.data);
      setUserRole(role);

      localStorage.setItem('userRole', role);
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...(me.data?.user || {}),
          profile: me.data?.profile || null,
        })
      );

      if (role === 'ADMIN') {
        const [dosenRes, pengajuanRes, jadwalRes, bimbinganRes] =
          await Promise.all([
            api.getDosenList(),
            api.getPengajuanList(),
            api.getJadwalSidangAll(),
            api.getLogBimbinganAll(),
          ]);

        const dosenList = getArrayData(dosenRes);
        const pengajuanList = getArrayData(pengajuanRes);
        const jadwalList = getArrayData(jadwalRes);
        const bimbinganList = getArrayData(bimbinganRes);

        const pendingPengajuan = pengajuanList.filter((p) => {
          const status = String(p.status || '').toUpperCase();
          return status === 'PENDING';
        });

        setAdminStats({
          totalDosen: dosenList.length,
          pengajuanPending: pendingPengajuan.length,
          jadwalBulanIni: jadwalList.length,
          totalBimbingan: bimbinganList.length,
        });
      }

      if (role === 'DOSEN') {
        const [pengajuanRes, bimbinganRes] = await Promise.all([
          api.getPengajuanList(),
          api.getLogBimbinganByDosen(),
        ]);

        const pengajuanList = getArrayData(pengajuanRes);
        const bimbinganList = getArrayData(bimbinganRes);

        const approvedPengajuan = pengajuanList.filter((p) => {
          const status = String(p.status || '').toUpperCase();
          return status === 'APPROVED';
        });

        const uniqueMahasiswa = new Set(
          approvedPengajuan
            .map((p) => {
              const mahasiswa = p.mahasiswa as ApiRecord | undefined;
              return String(p.mahasiswaId || mahasiswa?.id || '');
            })
            .filter(Boolean)
        );

        const now = new Date();

        const pertemuanBulanIni = bimbinganList.filter((b) => {
          const tanggal = String(b.tanggal || '');
          const date = new Date(tanggal);

          if (Number.isNaN(date.getTime())) {
            return false;
          }

          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        });

        setDosenStats({
          mahasiswaBimbingan: uniqueMahasiswa.size,
          totalBimbingan: bimbinganList.length,
          pertemuanBulanIni: pertemuanBulanIni.length,
          logTercatat: bimbinganList.length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    const timer = setTimeout(() => {
      void fetchDashboardData();
    }, 0);

    return () => clearTimeout(timer);
  }, [router, fetchDashboardData]);

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

  if (userRole === 'ADMIN') {
    return (
      <div className="flex bg-gray-100 min-h-screen">
        <Sidebar />

        <div className="flex-1 ml-64">
          <Header user={userData?.user} profile={userData?.profile} />

          <main className="p-6">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl p-6 mb-6 text-white">
              <h1 className="text-2xl font-bold">Dashboard Admin</h1>
              <p className="text-blue-100 mt-1">
                Kelola seluruh sistem Manajemen Tugas Akhir
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Dosen"
                value={adminStats.totalDosen}
                icon={Users}
                color="bg-green-500"
              />

              <StatCard
                title="Pengajuan Pending"
                value={adminStats.pengajuanPending}
                icon={FileCheck}
                color="bg-yellow-500"
              />

              <StatCard
                title="Jadwal Sidang"
                value={adminStats.jadwalBulanIni}
                icon={Calendar}
                color="bg-blue-500"
              />

              <StatCard
                title="Log Bimbingan"
                value={adminStats.totalBimbingan}
                icon={Activity}
                color="bg-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Aksi Cepat Admin
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/dosen/plotting')}
                    className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-left"
                  >
                    <Users className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="font-medium text-gray-700">Plotting Dosen</p>
                    <p className="text-xs text-gray-500">
                      Atur dosen pembimbing
                    </p>
                  </button>

                  <button
                    onClick={() => router.push('/jadwal')}
                    className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-left"
                  >
                    <Calendar className="w-6 h-6 text-green-600 mb-2" />
                    <p className="font-medium text-gray-700">Jadwal Sidang</p>
                    <p className="text-xs text-gray-500">
                      Buat jadwal sidang
                    </p>
                  </button>

                  <button
                    onClick={() => router.push('/berkas')}
                    className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-left"
                  >
                    <FileCheck className="w-6 h-6 text-yellow-600 mb-2" />
                    <p className="font-medium text-gray-700">
                      Pengajuan Judul
                    </p>
                    <p className="text-xs text-gray-500">
                      Assign dosen pembimbing
                    </p>
                  </button>

                  <button
                    onClick={() => router.push('/bimbingan')}
                    className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-left"
                  >
                    <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
                    <p className="font-medium text-gray-700">
                      Monitor Bimbingan
                    </p>
                    <p className="text-xs text-gray-500">
                      Pantau log bimbingan
                    </p>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Info Sistem
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      Sistem aktif:{' '}
                      {new Date().toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      📝 {adminStats.pengajuanPending} pengajuan judul menunggu
                      assign/review
                    </p>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      📘 {adminStats.totalBimbingan} log bimbingan tercatat
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📅 {adminStats.jadwalBulanIni} jadwal sidang terdaftar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Header user={userData?.user} profile={userData?.profile} />

        <main className="p-6">
          <div className="bg-linear-to-r from-green-600 to-teal-600 rounded-xl p-6 mb-6 text-white">
            <h1 className="text-2xl font-bold">
              Selamat Datang, {userData?.profile?.nama || 'Dosen'}
            </h1>
            <p className="text-green-100 mt-1">
              Kelola bimbingan dan jadwal sidang mahasiswa Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium">
                    Mahasiswa Bimbingan
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">
                    {dosenStats.mahasiswaBimbingan}
                  </p>
                </div>

                <GraduationCap className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium">
                    Total Pertemuan
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">
                    {dosenStats.totalBimbingan}
                  </p>
                </div>

                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium">
                    Pertemuan Bulan Ini
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">
                    {dosenStats.pertemuanBulanIni}
                  </p>
                </div>

                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium">
                    Log Tercatat
                  </p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">
                    {dosenStats.logTercatat}
                  </p>
                </div>

                <CheckCircle className="w-8 h-8 text-teal-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Aksi Cepat
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/judul')}
                  className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition text-left"
                >
                  <FileCheck className="w-6 h-6 text-yellow-600 mb-2" />
                  <p className="font-medium text-gray-700">Review Judul</p>
                  <p className="text-xs text-gray-500">
                    Approve/reject judul
                  </p>
                </button>

                <button
                  onClick={() => router.push('/mahasiswa-bimbingan')}
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-left"
                >
                  <GraduationCap className="w-6 h-6 text-green-600 mb-2" />
                  <p className="font-medium text-gray-700">
                    Mahasiswa Bimbingan
                  </p>
                  <p className="text-xs text-gray-500">
                    Lihat daftar mahasiswa
                  </p>
                </button>

                <button
                  onClick={() => router.push('/bimbingan')}
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-left"
                >
                  <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="font-medium text-gray-700">Log Bimbingan</p>
                  <p className="text-xs text-gray-500">
                    Tambah catatan bimbingan
                  </p>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Statistik Bimbingan
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ {dosenStats.logTercatat} log bimbingan sudah tercatat
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    {dosenStats.pertemuanBulanIni} pertemuan bimbingan bulan
                    ini
                  </span>
                </div>

                <div className="pt-3 border-t">
                  <button
                    onClick={() => router.push('/bimbingan')}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
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