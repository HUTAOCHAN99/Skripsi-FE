'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');

  const [generalSettings, setGeneralSettings] = useState({
    appName: 'Sistem Manajemen Tugas Akhir',
    semester: 'Genap 2025/2026',
    maxPembimbing: 2,
    maxPenguji: 2,
    minBimbingan: 8,
    maxRevisi: 3,
  });

  const [tahunAkademik] = useState([
    { id: 1, tahun: '2024/2025', isActive: false },
    { id: 2, tahun: '2025/2026', isActive: true },
  ]);

  const [periodeSidang] = useState([
    {
      id: 1,
      nama: 'Periode I',
      tanggalMulai: '2026-01-15',
      tanggalSelesai: '2026-02-15',
      isActive: false,
    },
    {
      id: 2,
      nama: 'Periode II',
      tanggalMulai: '2026-03-01',
      tanggalSelesai: '2026-03-30',
      isActive: true,
    },
    {
      id: 3,
      nama: 'Periode III',
      tanggalMulai: '2026-06-01',
      tanggalSelesai: '2026-06-30',
      isActive: false,
    },
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotification: true,
    pushNotification: true,
    reminderBimbingan: true,
    reminderSidang: true,
    reminderDays: 3,
  });

  const [userSettings, setUserSettings] = useState({
    namaAdmin: 'Administrator',
    email: 'admin@university.ac.id',
    role: 'Super Admin',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'weekly',
    backupTime: '02:00',
  });

  useEffect(() => {
    const checkAdminOnly = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          router.push('/login');
          return;
        }

        const response = await api.getMe();
        const role = response.data?.user?.role;

        if (role !== 'ADMIN') {
          alert('Halaman pengaturan hanya dapat diakses oleh Admin.');
          router.push('/dashboard');
        }
      } catch {
        router.push('/login');
      }
    };

    checkAdminOnly();
  }, [router]);

  const handleGeneralSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Pengaturan umum berhasil disimpan');
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Pengaturan notifikasi berhasil disimpan');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Password baru tidak cocok!');
      return;
    }

    alert('Password berhasil diubah');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleUserUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Profil admin berhasil diperbarui');
  };

  const handleBackupNow = () => {
    alert('Backup database dimulai...');
  };

  const handleRestoreBackup = () => {
    alert('Pilih file backup untuk direstore');
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-slate-900! placeholder:text-slate-400! focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition';

  const disabledInputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-slate-700!';

  const tabs = [
    { id: 'general', name: 'Umum', icon: '⚙️' },
    { id: 'academic', name: 'Akademik', icon: '📚' },
    { id: 'notification', name: 'Notifikasi', icon: '🔔' },
    { id: 'profile', name: 'Profil', icon: '👤' },
    { id: 'security', name: 'Keamanan', icon: '🔒' },
    { id: 'backup', name: 'Backup', icon: '💾' },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-64">
        <Header />

        <main className="p-6">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="border-b px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Pengaturan Sistem
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola konfigurasi sistem Manajemen Tugas Akhir
              </p>
            </div>

            <div className="border-b px-6">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 font-medium transition border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'general' && (
                <form
                  onSubmit={handleGeneralSubmit}
                  className="space-y-6 max-w-2xl"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Aplikasi
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      value={generalSettings.appName}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          appName: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nama yang akan tampil di header aplikasi
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Semester Aktif
                    </label>
                    <select
                      className={inputClass}
                      value={generalSettings.semester}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          semester: e.target.value,
                        })
                      }
                    >
                      <option>Ganjil 2025/2026</option>
                      <option>Genap 2025/2026</option>
                      <option>Pendek 2026</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maksimal Dosen Pembimbing
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="3"
                        className={inputClass}
                        value={generalSettings.maxPembimbing}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            maxPembimbing: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maksimal Dosen Penguji
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="3"
                        className={inputClass}
                        value={generalSettings.maxPenguji}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            maxPenguji: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimal Pertemuan Bimbingan
                      </label>
                      <input
                        type="number"
                        min="4"
                        max="20"
                        className={inputClass}
                        value={generalSettings.minBimbingan}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            minBimbingan: Number(e.target.value),
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maksimal Revisi
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        className={inputClass}
                        value={generalSettings.maxRevisi}
                        onChange={(e) =>
                          setGeneralSettings({
                            ...generalSettings,
                            maxRevisi: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="primary">
                    Simpan Pengaturan
                  </Button>
                </form>
              )}

              {activeTab === 'academic' && (
                <div className="space-y-8 max-w-4xl">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Tahun Akademik
                    </h3>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-3 text-gray-700 font-medium">
                              Tahun Akademik
                            </th>
                            <th className="text-left p-3 text-gray-700 font-medium">
                              Status
                            </th>
                            <th className="text-left p-3 text-gray-700 font-medium">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tahunAkademik.map((ta) => (
                            <tr key={ta.id} className="border-t">
                              <td className="p-3 text-gray-700">{ta.tahun}</td>
                              <td className="p-3">
                                {ta.isActive ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    Aktif
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                    Non-Aktif
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <button className="text-blue-600 hover:text-blue-800 text-sm">
                                  Set Aktif
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <Button variant="secondary" className="mt-3">
                      + Tambah Tahun Akademik
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Periode Sidang
                    </h3>

                    <div className="space-y-3">
                      {periodeSidang.map((periode) => (
                        <div key={periode.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {periode.nama}
                              </h4>
                              {periode.isActive && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Periode Aktif
                                </span>
                              )}
                            </div>
                            <Button variant="secondary" size="sm">
                              Edit
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">
                                Tanggal Mulai:
                              </span>
                              <p className="text-gray-700">
                                {periode.tanggalMulai}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Tanggal Selesai:
                              </span>
                              <p className="text-gray-700">
                                {periode.tanggalSelesai}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button variant="secondary" className="mt-3">
                      + Tambah Periode
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'notification' && (
                <form
                  onSubmit={handleNotificationSubmit}
                  className="space-y-6 max-w-2xl"
                >
                  {[
                    {
                      key: 'emailNotification',
                      title: 'Notifikasi Email',
                      desc: 'Kirim notifikasi melalui email',
                    },
                    {
                      key: 'pushNotification',
                      title: 'Notifikasi Push',
                      desc: 'Notifikasi realtime di dashboard',
                    },
                    {
                      key: 'reminderBimbingan',
                      title: 'Pengingat Bimbingan',
                      desc: 'Kirim pengingat jadwal bimbingan',
                    },
                    {
                      key: 'reminderSidang',
                      title: 'Pengingat Sidang',
                      desc: 'Kirim pengingat jadwal sidang',
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-700">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>

                      <input
                        type="checkbox"
                        checked={
                          notificationSettings[
                            item.key as keyof typeof notificationSettings
                          ] as boolean
                        }
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [item.key]: e.target.checked,
                          })
                        }
                        className="w-5 h-5"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pengiriman Pengingat
                    </label>
                    <select
                      className={inputClass}
                      value={notificationSettings.reminderDays}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          reminderDays: Number(e.target.value),
                        })
                      }
                    >
                      <option value="1">1 hari sebelumnya</option>
                      <option value="2">2 hari sebelumnya</option>
                      <option value="3">3 hari sebelumnya</option>
                      <option value="7">1 minggu sebelumnya</option>
                    </select>
                  </div>

                  <Button type="submit" variant="primary">
                    Simpan Pengaturan
                  </Button>
                </form>
              )}

              {activeTab === 'profile' && (
                <form
                  onSubmit={handleUserUpdate}
                  className="space-y-6 max-w-2xl"
                >
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      AD
                    </div>
                    <div>
                      <Button variant="secondary" size="sm">
                        Ganti Foto
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Format: JPG, PNG. Maks 2MB
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      value={userSettings.namaAdmin}
                      onChange={(e) =>
                        setUserSettings({
                          ...userSettings,
                          namaAdmin: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className={disabledInputClass}
                      value={userSettings.email}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <input
                      type="text"
                      className={disabledInputClass}
                      value={userSettings.role}
                      disabled
                    />
                  </div>

                  <Button type="submit" variant="primary">
                    Update Profil
                  </Button>
                </form>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 max-w-2xl">
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Ubah Password
                    </h3>

                    <input
                      type="password"
                      className={inputClass}
                      placeholder="Password saat ini"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                    />

                    <input
                      type="password"
                      className={inputClass}
                      placeholder="Password baru"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />

                    <input
                      type="password"
                      className={inputClass}
                      placeholder="Konfirmasi password baru"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />

                    <Button type="submit" variant="primary">
                      Ubah Password
                    </Button>
                  </form>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Sesi Login
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 mb-3">
                        Hapus semua sesi login di perangkat lain
                      </p>
                      <Button variant="danger" size="sm">
                        Logout Semua Perangkat
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Backup Database
                    </h3>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-gray-700">
                        <input
                          type="checkbox"
                          checked={backupSettings.autoBackup}
                          onChange={(e) =>
                            setBackupSettings({
                              ...backupSettings,
                              autoBackup: e.target.checked,
                            })
                          }
                        />
                        Backup Otomatis
                      </label>

                      <select
                        className={inputClass}
                        value={backupSettings.backupFrequency}
                        onChange={(e) =>
                          setBackupSettings({
                            ...backupSettings,
                            backupFrequency: e.target.value,
                          })
                        }
                        disabled={!backupSettings.autoBackup}
                      >
                        <option value="daily">Setiap Hari</option>
                        <option value="weekly">Setiap Minggu</option>
                        <option value="monthly">Setiap Bulan</option>
                      </select>

                      <input
                        type="time"
                        className={inputClass}
                        value={backupSettings.backupTime}
                        onChange={(e) =>
                          setBackupSettings({
                            ...backupSettings,
                            backupTime: e.target.value,
                          })
                        }
                        disabled={!backupSettings.autoBackup}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="primary" onClick={handleBackupNow}>
                      💾 Backup Sekarang
                    </Button>
                    <Button variant="secondary" onClick={handleRestoreBackup}>
                      📂 Restore Backup
                    </Button>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Riwayat Backup
                    </h3>

                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-700">
                              backup_20260510_{i}.sql
                            </p>
                            <p className="text-xs text-gray-500">
                              10 Mei 2026, 02:00 WIB - 45.2 MB
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm">
                              Download
                            </button>
                            <button className="text-red-600 hover:text-red-800 text-sm">
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}