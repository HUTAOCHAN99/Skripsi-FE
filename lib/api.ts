// lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://skripsi-backend-514828886605.asia-southeast2.run.app/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
    if (this.token && !isAuthEndpoint) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const finalHeaders = {
      ...headers,
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers: finalHeaders });

      if (response.status === 401 && !isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new Error('Sesi habis, silakan login kembali');
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Terjadi kesalahan');
      }

      return data;
    } catch (error) {
      console.error(`API Error ${endpoint}:`, error);
      throw error;
    }
  }

  // ============ AUTH ============
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.data?.token) {
      this.token = data.data.token;
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('userRole', data.data.user?.role || '');
    }

    return data;
  }

  async register(data: {
    email: string;
    password: string;
    role: 'MAHASISWA' | 'DOSEN' | 'ADMIN';
    nama: string;
    nim?: string;
    angkatan?: number;
    nip?: string;
    bidangKeahlian?: string;
    kuota?: number;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async logout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
  }

  // ============ DOSEN ============
  async getDosenList() {
    const response = await this.request('/dosen');
    return response.data;
  }

  async createDosen(data: {
    email: string;
    password: string;
    nama: string;
    nip: string;
    bidangKeahlian: string;
    kuota?: number;
  }) {
    return this.request('/dosen', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDosen(id: string, data: {
    nama?: string;
    bidangKeahlian?: string;
    kuota?: number;
    noTelp?: string;
  }) {
    return this.request(`/dosen/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDosen(id: string) {
    return this.request(`/dosen/${id}`, { method: 'DELETE' });
  }

  // ============ PENGAJUAN JUDUL ============
  async getPengajuanList() {
    const response = await this.request('/pengajuan');
    return response.data;
  }

  async assignDosenPembimbing(id: string, dosenPembimbingId: string) {
    return this.request(`/pengajuan/${id}/assign-dosen`, {
      method: 'PUT',
      body: JSON.stringify({ dosenPembimbingId }),
    });
  }

  async approvePengajuan(id: string, catatan?: string) {
    return this.request(`/pengajuan/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ catatan }),
    });
  }

  async rejectPengajuan(id: string, catatan: string) {
    return this.request(`/pengajuan/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ catatan }),
    });
  }

  // ============ BIMBINGAN ============
  async getLogBimbinganAll() {
    const response = await this.request('/bimbingan');
    return response.data;
  }

  async getLogBimbinganByDosen() {
    const response = await this.request('/bimbingan');
    return response.data;
  }

  async createLogBimbingan(data: {
    mahasiswaId: string;
    topik: string;
    catatan: string;
    tanggal: string;
  }) {
    return this.request('/bimbingan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveLogBimbingan(id: string) {
    return this.request(`/bimbingan/${id}/approve`, { method: 'PUT' });
  }

  async rejectLogBimbingan(id: string) {
    return this.request(`/bimbingan/${id}/reject`, { method: 'PUT' });
  }

  // ============ JADWAL SIDANG ============
  async getJadwalSidangAll() {
    const response = await this.request('/sidang');
    return response.data;
  }

  async createJadwalSidang(data: {
    mahasiswaId: string;
    dosenPembimbingId: string;
    dosenPengujiId: string;
    tanggal: string;
    jam: string;
    ruang: string;
  }) {
    return this.request('/sidang', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJadwalSidang(id: string, data: {
    tanggal?: string;
    jam?: string;
    ruang?: string;
    status?: string;
  }) {
    return this.request(`/sidang/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelJadwalSidang(id: string) {
    return this.request(`/sidang/${id}/cancel`, { method: 'PUT' });
  }
}

export const api = new ApiClient();
