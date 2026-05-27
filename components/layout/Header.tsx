'use client';
import { LogOut, Bell, User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

interface HeaderProps {
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  profile?: {
    nama?: string;
    nim?: string;
    nip?: string;
  };
}

export default function Header({ user, profile }: HeaderProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const displayName = profile?.nama || user?.email || 'Admin';
  const userRole = user?.role || 'ADMIN';
  const roleLabel = userRole === 'ADMIN' ? 'Administrator' : userRole === 'DOSEN' ? 'Dosen' : 'Mahasiswa';

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-500">
            Selamat datang kembali, {displayName}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">{displayName}</p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{displayName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => router.push('/settings')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <User className="w-4 h-4" />
                    Pengaturan
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}