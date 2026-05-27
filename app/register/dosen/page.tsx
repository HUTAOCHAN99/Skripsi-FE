// app/register/dosen/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, User, Mail, Lock, Briefcase, IdCard } from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterDosenPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nama: '',
    nip: '',
    bidangKeahlian: '',
    kuota: 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.register({
        email: formData.email,
        password: formData.password,
        role: 'DOSEN',
        nama: formData.nama,
        nip: formData.nip,
        bidangKeahlian: formData.bidangKeahlian,
        kuota: formData.kuota,
      });

      if (response.success) {
        setSuccess('Registrasi berhasil! Silakan login.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(response.message || 'Registrasi gagal');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-900 to-teal-900 py-12">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-600">
            Registrasi Dosen
          </h1>
          <p className="text-gray-600 mt-2">Buat akun dosen pembimbing</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Nama Lengkap *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-600 placeholder-gray-400"
                  placeholder="Dr. Ahmad Rizki, M.Kom"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                NIP *
              </label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-600 placeholder-gray-400"
                  placeholder="197501011998021001"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Bidang Keahlian *
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.bidangKeahlian}
                onChange={(e) => setFormData({ ...formData, bidangKeahlian: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-600 placeholder-gray-400"
                placeholder="AI & Machine Learning, Data Science, dll"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-600 placeholder-gray-400"
                placeholder="dosen@university.ac.id"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-600 placeholder-gray-400"
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Konfirmasi Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-600 placeholder-gray-400"
                  placeholder="Ulangi password"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Kuota Bimbingan Maksimal
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.kuota}
              onChange={(e) => setFormData({ ...formData, kuota: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-600"
            />
            <p className="text-xs text-gray-600 mt-1">Jumlah maksimal mahasiswa yang dapat dibimbing</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Memproses...' : 'Daftar sebagai Dosen'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-600"
            >
              Kembali
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}