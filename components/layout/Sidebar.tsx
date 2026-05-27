// components/layout/Sidebar.tsx
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
} from 'lucide-react';

// Menu untuk Admin
const adminMenuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Plotting Dosen', path: '/dosen/plotting', icon: Users },
  { name: 'Approval Berkas', path: '/berkas', icon: FileCheck },
  { name: 'Jadwal Sidang', path: '/jadwal', icon: Calendar },
  { name: 'Pengajuan Judul', path: '/judul', icon: BookOpen },
  { name: 'Log Bimbingan', path: '/bimbingan', icon: MessageSquare },
  { name: 'Pengaturan', path: '/settings', icon: Settings },
];

// Menu untuk Dosen (lebih sedikit)
const dosenMenuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Pengajuan Judul', path: '/judul', icon: BookOpen },
  { name: 'Log Bimbingan', path: '/bimbingan', icon: MessageSquare },
  { name: 'Pengaturan', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Ambil role dari localStorage (disimpan saat login)
    const role = localStorage.getItem('userRole');
    if (role) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserRole(role);
    } else {
      // Fallback: ambil dari user object
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserRole(user?.role || null);
        } catch (e) {
          console.error('Failed to parse user', e);
        }
      }
    }
  }, []);

  // Tentukan menu berdasarkan role
  const menuItems = userRole === 'ADMIN' ? adminMenuItems : dosenMenuItems;

  // Warna berdasarkan role
  const activeColor = userRole === 'ADMIN' ? 'bg-blue-600' : 'bg-green-600';
  const hoverColor = userRole === 'ADMIN' ? 'hover:bg-blue-700' : 'hover:bg-green-700';

  return (
    <aside className="w-64 bg-gray-900 min-h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-white text-xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          {userRole === 'ADMIN' ? 'Admin TA' : 'Dosen Panel'}
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          {userRole === 'ADMIN' ? 'Manajemen Tugas Akhir' : 'Bimbingan Mahasiswa'}
        </p>
      </div>
      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition duration-200 ${
                isActive
                  ? `${activeColor} text-white`
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}