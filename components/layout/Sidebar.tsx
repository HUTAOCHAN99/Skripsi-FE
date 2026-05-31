'use client';

import {
  LayoutDashboard,
  FileCheck,
  GraduationCap,
  MessageSquare,
  Calendar,
  Settings,
  Users,
  BookOpen,
  ClipboardList,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';

type Role = 'ADMIN' | 'DOSEN' | null;

const subscribe = (callback: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('storage', callback);
  window.addEventListener('role-change', callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('role-change', callback);
  };
};

const getRoleSnapshot = (): Role => {
  if (typeof window === 'undefined') return null;

  const role = localStorage.getItem('userRole');
  if (role === 'ADMIN' || role === 'DOSEN') return role;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    const parsedRole = user?.role || user?.user?.role;
    if (parsedRole === 'ADMIN' || parsedRole === 'DOSEN') return parsedRole;
    return null;
  } catch {
    return null;
  }
};

const getServerSnapshot = (): Role => null;

export default function Sidebar() {
  const pathname = usePathname();
  const userRole = useSyncExternalStore(
    subscribe,
    getRoleSnapshot,
    getServerSnapshot
  );

  const adminMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Pengajuan Judul', path: '/berkas', icon: FileCheck },
    { name: 'Plotting Dosen', path: '/dosen/plotting', icon: Users },
    { name: 'Jadwal Sidang', path: '/jadwal', icon: Calendar },
    { name: 'Monitor Bimbingan', path: '/bimbingan', icon: MessageSquare },
    { name: 'Pengaturan', path: '/settings', icon: Settings },
  ];

  const dosenMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Review Judul', path: '/judul', icon: FileCheck },
    { name: 'Mahasiswa Bimbingan', path: '/mahasiswa-bimbingan', icon: GraduationCap },
    { name: 'Log Bimbingan', path: '/bimbingan', icon: MessageSquare },
    { name: 'Jadwal Sidang', path: '/jadwal-sidang', icon: Calendar },
  ];

  const menuItems = userRole === 'DOSEN' ? dosenMenuItems : adminMenuItems;

  const title = userRole === 'DOSEN' ? 'Dosen Panel' : 'Admin Panel';
  const subtitle =
    userRole === 'DOSEN'
      ? 'Review Judul & Bimbingan'
      : 'Manajemen TA';

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white z-20">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? userRole === 'DOSEN'
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white'
                  : 'text-slate-200 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4" />
          <span>
            {userRole === 'DOSEN'
              ? 'Akses Dosen'
              : 'Akses Administrator'}
          </span>
        </div>
      </div>
    </aside>
  );
}