// app/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Mail, Lock, UserCog, Users } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'admin' | 'dosen'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (tab: 'admin' | 'dosen') => {
    setActiveTab(tab);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.login(email, password);
      
      if (response.success) {
        const userRole = response.data?.user?.role;
        const userData = response.data?.user;
        
        // ✅ PERBAIKI: Redirect ke /dashboard (satu dashboard untuk semua role)
        // Dashboard akan menyesuaikan tampilan berdasarkan role
        if (userRole === 'ADMIN' || userRole === 'DOSEN') {
          // Simpan role ke localStorage untuk keperluan sidebar
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('user', JSON.stringify(userData));
          window.dispatchEvent(new Event('role-change'));
          router.push('/dashboard');
        } else {
          setError('Role tidak dikenali atau akses ditolak');
          // Mahasiswa tidak bisa login via web
          if (userRole === 'MAHASISWA') {
            setError('Akses ditolak! Silakan gunakan aplikasi mobile untuk mahasiswa.');
          }
        }
      } else {
        setError(response.message || 'Login gagal');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-900 to-purple-900">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            Sistem Manajemen TA
          </h1>
          <p className="text-gray-500 mt-2">Silakan login untuk melanjutkan</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleTabChange('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
              activeTab === 'admin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>Admin</span>
          </button>
          <button
            onClick={() => handleTabChange('dosen')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
              activeTab === 'dosen'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Dosen</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-slate-900! placeholder:text-slate-400! caret-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder={activeTab === 'admin' ? 'admin@university.ac.id' : 'dosen@university.ac.id'}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-slate-900! placeholder:text-slate-400! caret-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded-lg transition duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'admin' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isLoading ? 'Memproses...' : `Login sebagai ${activeTab === 'admin' ? 'Admin' : 'Dosen'}`}
          </button>
        </form>

        {/* HANYA TAMPILKAN LINK REGISTER KETIKA TAB DOSEN YANG AKTIF */}
        {activeTab === 'dosen' && (
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun Dosen?{' '}
              <button
                onClick={() => router.push('/register/dosen')}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Register Dosen
              </button>
            </p>
          </div>
        )}

        {/* Tampilkan informasi untuk admin */}
        {activeTab === 'admin' && (
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-xs text-gray-400">
              Hubungi super admin untuk mendapatkan akun admin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}