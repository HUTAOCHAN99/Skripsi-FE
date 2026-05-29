'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Calendar,
  BookOpen,
  MessageSquare,
  Settings,
  GraduationCap,
  ClipboardList,
  UserCog,
  BarChart3
} from 'lucide-react';

// ============ MENU UNTUK ADMIN ============
// Admin: Manajemen sistem, tidak punya akses approve judul
const adminMenuItems = [
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: LayoutDashboard,
    description: 'Ringkasan sistem'
  },
  { 
    name: 'Kelola Dosen', 
    path: '/dosen/plotting', 
    icon: Users,
    description: 'Tambah/edit/hapus dosen'
  },
  { 
    name: 'Kelola Mahasiswa', 
    path: '/mahasiswa', 
    icon: GraduationCap,
    description: 'Tambah/edit/hapus mahasiswa'
  },
  { 
    name: 'Verifikasi Berkas', 
    path: '/berkas', 
    icon: FileCheck,
    description: 'Verifikasi kelengkapan berkas mahasiswa'
  },
  { 
    name: 'Jadwal Sidang', 
    path: '/jadwal', 
    icon: Calendar,
    description: 'Buat dan kelola jadwal sidang'
  },
  { 
    name: 'Monitoring Bimbingan', 
    path: '/bimbingan', 
    icon: MessageSquare,
    description: 'Pantau bimbingan (read-only)'
  },
  { 
    name: 'Laporan', 
    path: '/laporan', 
    icon: ClipboardList,
    description: 'Statistik dan rekap data'
  },
  { 
    name: 'Pengaturan', 
    path: '/settings', 
    icon: Settings,
    description: 'Pengaturan sistem'
  },
];

// ============ MENU UNTUK DOSEN ============
// Dosen: Akademik & bimbingan, TIDAK bisa kelola user
const dosenMenuItems = [
  { 
    name: 'Dashboard', 
    path: '/dashboard', 
    icon: LayoutDashboard,
    description: 'Ringkasan bimbingan'
  },
  { 
    name: 'Approval Judul', 
    path: '/judul', 
    icon: BookOpen,
    description: 'Setujui/tolak judul mahasiswa bimbingan'
  },
  { 
    name: 'Log Bimbingan', 
    path: '/bimbingan', 
    icon: MessageSquare,
    description: 'Kelola log bimbingan mahasiswa'
  },
  { 
    name: 'Jadwal Sidang', 
    path: '/jadwal', 
    icon: Calendar,
    description: 'Lihat jadwal sidang (read-only)'
  },
  { 
    name: 'Pengaturan', 
    path: '/settings', 
    icon: Settings,
    description: 'Ubah password & profil'
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Ambil role dari localStorage
    const role = localStorage.getItem('userRole');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserRole(role);
    
    // Ambil nama user dari localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user?.profile?.nama || user?.email || 'User');
      } catch (e) {
        console.error('Failed to parse user', e);
      }
    }
  }, []);

  // Pilih menu berdasarkan role
  const menuItems = userRole === 'ADMIN' ? adminMenuItems : dosenMenuItems;
  const activeColor = userRole === 'ADMIN' ? 'bg-blue-600' : 'bg-green-600';
  const headerBg = userRole === 'ADMIN' ? 'from-blue-600 to-blue-800' : 'from-green-600 to-green-800';
  const roleLabel = userRole === 'ADMIN' ? 'Administrator' : 'Dosen Pembimbing';

  // Jika role belum diketahui, tampilkan loading
  if (!userRole) {
    return (
      <aside className="w-64 bg-gray-900 min-h-screen fixed left-0 top-0 overflow-y-auto">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-gray-900 min-h-screen fixed left-0 top-0 overflow-y-auto">
      {/* Header Sidebar */}
      <div className={`p-4 bg-gradient-to-r ${headerBg}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            {userRole === 'ADMIN' ? '🎛️' : '📚'}
          </div>
          <div>
            <h1 className="text-white text-lg font-bold">
              {userRole === 'ADMIN' ? 'Admin Panel' : 'Dosen Panel'}
            </h1>
            <p className="text-xs text-white/70">{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-800">
        <p className="text-sm text-gray-300 truncate">{userName}</p>
        <p className="text-xs text-gray-500 mt-1">
          {userRole === 'ADMIN' ? 'Manajemen Sistem TA' : 'Bimbingan Tugas Akhir'}
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 group ${
                isActive
                  ? `${activeColor} text-white shadow-lg`
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              title={item.description}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              <span className="text-sm">{item.name}</span>
              {!isActive && (
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 text-center">
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} Sistem TA
        </p>
        <p className="text-xs text-gray-700 mt-1">
          v1.0.0
        </p>
      </div>
    </aside>
  );
}