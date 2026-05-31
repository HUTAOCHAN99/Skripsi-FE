'use client';

import { LogOut, Bell, User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface UserData {
  id?: string;
  email?: string;
  role?: string;
  profile?: {
    nama?: string;
    nim?: string;
    nip?: string;
  };
}

interface ProfileData {
  nama?: string;
  nim?: string;
  nip?: string;
}

interface HeaderProps {
  user?: UserData;
  profile?: ProfileData;
}

function getLocalUser(): UserData | null {
  if (typeof window === 'undefined') return null;

  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

function getLocalRole(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('userRole') || '';
}

export default function Header({ user, profile }: HeaderProps) {
  const router = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const [currentUser, setCurrentUser] = useState<UserData | null>(() => {
    return user || getLocalUser();
  });

  const [currentProfile, setCurrentProfile] = useState<ProfileData | null>(() => {
    const localUser = getLocalUser();
    return profile || localUser?.profile || null;
  });

  const [storedRole, setStoredRole] = useState<string>(() => getLocalRole());

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          return;
        }

        const response = await api.getMe();

        const userFromApi = response.data?.user;
        const profileFromApi =
          response.data?.profile || response.data?.user?.profile || null;

        if (userFromApi) {
          setCurrentUser(userFromApi);
          setStoredRole(userFromApi.role || '');

          localStorage.setItem(
            'user',
            JSON.stringify({
              ...userFromApi,
              profile: profileFromApi,
            })
          );

          if (userFromApi.role) {
            localStorage.setItem('userRole', userFromApi.role);
          }
        }

        setCurrentProfile(profileFromApi);
      } catch (error) {
        console.error('Gagal memuat user header:', error);
      }
    };

    loadUser();
  }, []);

  const userRole = currentUser?.role || storedRole;

  const displayName =
    currentProfile?.nama ||
    currentUser?.profile?.nama ||
    currentUser?.email ||
    'Pengguna';

  const roleLabel =
    userRole === 'ADMIN'
      ? 'Administrator'
      : userRole === 'DOSEN'
        ? 'Dosen'
        : 'Pengguna';

  const handleLogout = async () => {
    await api.logout();
    router.push('/login');
  };

  const handleOpenSettings = () => {
    if (userRole === 'ADMIN') {
      router.push('/settings');
    } else {
      alert('Menu pengaturan hanya tersedia untuk Admin.');
    }
  };

  const notifications =
    userRole === 'ADMIN'
      ? [
          'Cek pengajuan judul yang belum diassign dosen.',
          'Cek jadwal sidang yang perlu diperbarui.',
        ]
      : [
          'Cek judul yang menunggu review.',
          'Cek log bimbingan yang menunggu approval.',
        ];

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
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotif(!showNotif)}
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {showNotif && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotif(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Ringkasan tugas berdasarkan role akun.
                    </p>
                  </div>

                  <div className="p-3 space-y-2">
                    {notifications.map((notif, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-gray-50 text-sm text-gray-700"
                      >
                        {notif}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>

              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentUser?.email || '-'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{roleLabel}</p>
                  </div>

                  {userRole === 'ADMIN' && (
                    <button
                      type="button"
                      onClick={handleOpenSettings}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <User className="w-4 h-4" />
                      Pengaturan
                    </button>
                  )}

                  <button
                    type="button"
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