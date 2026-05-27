'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface SettingSection {
  title: string;
  icon: string;
  description: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  
  // State untuk berbagai pengaturan
  const [generalSettings, setGeneralSettings] = useState({
    appName: 'Sistem Manajemen Tugas Akhir',
    semester: 'Genap 2025/2026',
    maxPembimbing: 2,
    maxPenguji: 2,
    minBimbingan: 8,
    maxRevisi: 3,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tahunAkademik, setTahunAkademik] = useState([
    { id: 1, tahun: '2024/2025', isActive: false },
    { id: 2, tahun: '2025/2026', isActive: true },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [periodeSidang, setPeriodeSidang] = useState([
    { id: 1, nama: 'Periode I', tanggalMulai: '2026-01-15', tanggalSelesai: '2026-02-15', isActive: false },
    { id: 2, nama: 'Periode II', tanggalMulai: '2026-03-01', tanggalSelesai: '2026-03-30', isActive: true },
    { id: 3, nama: 'Periode III', tanggalMulai: '2026-06-01', tanggalSelesai: '2026-06-30', isActive: false },
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
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
            {/* Header */}
            <div className="border-b px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-600">Pengaturan Sistem</h1>
              <p className="text-gray-600 mt-1">Kelola konfigurasi sistem Manajemen Tugas Akhir</p>
            </div>

            {/* Tabs Navigation */}
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

            {/* Content */}
            <div className="p-6">
              {/* Tab 1: General Settings */}
              {activeTab === 'general' && (
                <form onSubmit={handleGeneralSubmit} className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Nama Aplikasi</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-600"
                      value={generalSettings.appName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, appName: e.target.value })}
                    />
                    <p className="text-xs text-gray-600 mt-1">Nama yang akan tampil di header aplikasi</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Semester Aktif</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg text-gray-600"
                      value={generalSettings.semester}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, semester: e.target.value })}
                    >
                      <option className="text-gray-600">Ganjil 2025/2026</option>
                      <option className="text-gray-600">Genap 2025/2026</option>
                      <option className="text-gray-600">Pendek 2026</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Maksimal Dosen Pembimbing</label>
                      <input
                        type="number"
                        min="1"
                        max="3"
                        className="w-full px-3 py-2 border rounded-lg text-gray-600"
                        value={generalSettings.maxPembimbing}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, maxPembimbing: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Maksimal Dosen Penguji</label>
                      <input
                        type="number"
                        min="1"
                        max="3"
                        className="w-full px-3 py-2 border rounded-lg text-gray-600"
                        value={generalSettings.maxPenguji}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, maxPenguji: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Minimal Pertemuan Bimbingan</label>
                      <input
                        type="number"
                        min="4"
                        max="20"
                        className="w-full px-3 py-2 border rounded-lg text-gray-600"
                        value={generalSettings.minBimbingan}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, minBimbingan: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-gray-600 mt-1">Minimal bimbingan sebelum sidang</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Maksimal Revisi</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        className="w-full px-3 py-2 border rounded-lg text-gray-600"
                        value={generalSettings.maxRevisi}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, maxRevisi: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" variant="primary">Simpan Pengaturan</Button>
                  </div>
                </form>
              )}

              {/* Tab 2: Academic Settings */}
              {activeTab === 'academic' && (
                <div className="space-y-8 max-w-4xl">
                  {/* Tahun Akademik */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-4">Tahun Akademik</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-3 text-gray-600 font-medium">Tahun Akademik</th>
                            <th className="text-left p-3 text-gray-600 font-medium">Status</th>
                            <th className="text-left p-3 text-gray-600 font-medium">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tahunAkademik.map((ta) => (
                            <tr key={ta.id} className="border-t">
                              <td className="p-3 text-gray-600">{ta.tahun}</td>
                              <td className="p-3">
                                {ta.isActive ? (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Aktif</span>
                                ) : (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Non-Aktif</span>
                                )}
                              </td>
                              <td className="p-3">
                                <button className="text-blue-600 hover:text-blue-800 text-sm">Set Aktif</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Button variant="secondary" className="mt-3">+ Tambah Tahun Akademik</Button>
                  </div>

                  {/* Periode Sidang */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-4">Periode Sidang</h3>
                    <div className="space-y-3">
                      {periodeSidang.map((periode) => (
                        <div key={periode.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-600">{periode.nama}</h4>
                              {periode.isActive && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Periode Aktif</span>
                              )}
                            </div>
                            <Button variant="secondary" size="sm">Edit</Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Tanggal Mulai:</span>
                              <p className="text-gray-600">{periode.tanggalMulai}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Tanggal Selesai:</span>
                              <p className="text-gray-600">{periode.tanggalSelesai}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="secondary" className="mt-3">+ Tambah Periode</Button>
                  </div>
                </div>
              )}

              {/* Tab 3: Notification Settings */}
              {activeTab === 'notification' && (
                <form onSubmit={handleNotificationSubmit} className="space-y-6 max-w-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-600">Notifikasi Email</p>
                        <p className="text-sm text-gray-600">Kirim notifikasi melalui email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationSettings.emailNotification}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotification: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-600">Notifikasi Push</p>
                        <p className="text-sm text-gray-600">Notifikasi realtime di dashboard</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationSettings.pushNotification}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotification: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-600">Pengingat Bimbingan</p>
                        <p className="text-sm text-gray-600">Kirim pengingat jadwal bimbingan</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationSettings.reminderBimbingan}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, reminderBimbingan: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-600">Pengingat Sidang</p>
                        <p className="text-sm text-gray-600">Kirim pengingat jadwal sidang</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={notificationSettings.reminderSidang}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, reminderSidang: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Pengiriman Pengingat (Hari Sebelum)</label>
                      <select
                        className="w-full px-3 py-2 border rounded-lg text-gray-600"
                        value={notificationSettings.reminderDays}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, reminderDays: parseInt(e.target.value) })}
                      >
                        <option value="1" className="text-gray-600">1 hari sebelumnya</option>
                        <option value="2" className="text-gray-600">2 hari sebelumnya</option>
                        <option value="3" className="text-gray-600">3 hari sebelumnya</option>
                        <option value="7" className="text-gray-600">1 minggu sebelumnya</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" variant="primary">Simpan Pengaturan</Button>
                  </div>
                </form>
              )}

              {/* Tab 4: Profile Settings */}
              {activeTab === 'profile' && (
                <form onSubmit={handleUserUpdate} className="space-y-6 max-w-2xl">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      AD
                    </div>
                    <div>
                      <Button variant="secondary" size="sm">Ganti Foto</Button>
                      <p className="text-xs text-gray-600 mt-1">Format: JPG, PNG. Maks 2MB</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg text-gray-600"
                      value={userSettings.namaAdmin}
                      onChange={(e) => setUserSettings({ ...userSettings, namaAdmin: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                      value={userSettings.email}
                      disabled
                    />
                    <p className="text-xs text-gray-600 mt-1">Email tidak dapat diubah</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Role</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                      value={userSettings.role}
                      disabled
                    />
                  </div>

                  <div className="pt-4">
                    <Button type="submit" variant="primary">Update Profil</Button>
                  </div>
                </form>
              )}

              {/* Tab 5: Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-8 max-w-2xl">
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-600">Ubah Password</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Password Saat Ini</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border rounded-lg text-gray-600"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Password Baru</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border rounded-lg text-gray-600"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        required
                      />
                      <p className="text-xs text-gray-600 mt-1">Minimal 8 karakter, kombinasi huruf dan angka</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Konfirmasi Password Baru</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border rounded-lg text-gray-600"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>

                    <div className="pt-4">
                      <Button type="submit" variant="primary">Ubah Password</Button>
                    </div>
                  </form>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-600 mb-4">Sesi Login</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 mb-3">
                        Hapus semua sesi login di perangkat lain
                      </p>
                      <Button variant="danger" size="sm">Logout Semua Perangkat</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: Backup Settings */}
              {activeTab === 'backup' && (
                <div className="space-y-6 max-w-2xl">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-600 mb-3">Backup Database</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Backup Otomatis</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={backupSettings.autoBackup}
                            onChange={(e) => setBackupSettings({ ...backupSettings, autoBackup: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Frekuensi Backup</label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg text-gray-600"
                          value={backupSettings.backupFrequency}
                          onChange={(e) => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })}
                          disabled={!backupSettings.autoBackup}
                        >
                          <option value="daily" className="text-gray-600">Setiap Hari</option>
                          <option value="weekly" className="text-gray-600">Setiap Minggu</option>
                          <option value="monthly" className="text-gray-600">Setiap Bulan</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Waktu Backup</label>
                        <input
                          type="time"
                          className="w-full px-3 py-2 border rounded-lg text-gray-600"
                          value={backupSettings.backupTime}
                          onChange={(e) => setBackupSettings({ ...backupSettings, backupTime: e.target.value })}
                          disabled={!backupSettings.autoBackup}
                        />
                      </div>
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
                    <h3 className="font-semibold text-gray-600 mb-3">Riwayat Backup</h3>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-600">backup_20260510_{i}.sql</p>
                            <p className="text-xs text-gray-600">10 Mei 2026, 02:00 WIB - 45.2 MB</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 text-sm">Download</button>
                            <button className="text-red-600 hover:text-red-800 text-sm">Hapus</button>
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