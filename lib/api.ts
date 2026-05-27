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
    
    // ✅ Perbaiki tipe headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // ✅ HANYA tambahkan Authorization jika token ada dan BUKAN endpoint login/register
    const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register');
    if (this.token && !isAuthEndpoint) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // ✅ Merge dengan headers dari options
    const finalHeaders = {
      ...headers,
      ...(options.headers as Record<string, string> || {})
    };

    try {
      const response = await fetch(url, { 
        ...options, 
        headers: finalHeaders 
      });
      
      // ✅ JANGAN handle 401 untuk endpoint login/register
      if (response.status === 401 && !isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
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

  // ============ AUTH ENDPOINTS ============
  
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.data?.token) {
      this.token = data.data.token;
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
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
  }

  // ============ DOSEN ENDPOINTS ============
  
  async getDosenList() {
    const response = await this.request('/dosen');
    return response.data;
  }

  async getDosenById(id: string) {
    const response = await this.request(`/dosen/${id}`);
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
    return this.request(`/dosen/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ MAHASISWA ENDPOINTS ============
  
  async getMahasiswaList() {
    const response = await this.request('/mahasiswa');
    return response.data;
  }

  async getMahasiswaById(id: string) {
    const response = await this.request(`/mahasiswa/${id}`);
    return response.data;
  }

  async createMahasiswa(data: {
    email: string;
    password: string;
    nama: string;
    nim: string;
    angkatan: number;
  }) {
    return this.request('/mahasiswa', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMahasiswa(id: string, data: {
    nama?: string;
    noTelp?: string;
    alamat?: string;
  }) {
    return this.request(`/mahasiswa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMahasiswa(id: string) {
    return this.request(`/mahasiswa/${id}`, {
      method: 'DELETE',
    });
  }

  // ============ PENGAJUAN JUDUL ENDPOINTS ============
  
  async getPengajuanList() {
    const response = await this.request('/pengajuan');
    return response.data;
  }

  async getPengajuanByMahasiswa() {
    const response = await this.request('/pengajuan/me');
    return response.data;
  }

  async createPengajuan(data: { judul: string; abstrak: string }) {
    return this.request('/pengajuan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approvePengajuan(id: string, dosenPembimbingId: string, catatan?: string) {
    return this.request(`/pengajuan/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ dosenPembimbingId, catatan }),
    });
  }

  async rejectPengajuan(id: string, catatan: string) {
    return this.request(`/pengajuan/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ catatan }),
    });
  }

  // ============ BIMBINGAN ENDPOINTS ============
  
  async getLogBimbinganAll() {
    const response = await this.request('/bimbingan');
    return response.data;
  }

  async getLogBimbinganByMahasiswa() {
    const response = await this.request('/bimbingan/me');
    return response.data;
  }

  async getLogBimbinganByDosen() {
    const response = await this.request('/bimbingan/dosen');
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
    return this.request(`/bimbingan/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectLogBimbingan(id: string) {
    return this.request(`/bimbingan/${id}/reject`, {
      method: 'PUT',
    });
  }

  // ============ JADWAL SIDANG ENDPOINTS ============
  
  async getJadwalSidangAll() {
    const response = await this.request('/sidang');
    return response.data;
  }

  async getJadwalSidangByMahasiswa() {
    const response = await this.request('/sidang/me');
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
    return this.request(`/sidang/${id}/cancel`, {
      method: 'PUT',
    });
  }

  // ============ UPLOAD ENDPOINTS ============
  
  async uploadFile(file: File, jenis: 'berkas' | 'dokumen' = 'berkas') {
    const formData = new FormData();
    formData.append('file', file);
    
    const url = `${BASE_URL}/upload/${jenis}`;
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Sesi habis, silakan login kembali');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Upload gagal');
      }
      
      return data;
    } catch (error) {
      console.error(`Upload Error:`, error);
      throw error;
    }
  }

  // ============ BERKAS ENDPOINTS ============
  
  async getBerkasList() {
    const response = await this.request('/berkas');
    return response.data;
  }

  async approveBerkas(id: string) {
    return this.request(`/berkas/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectBerkas(id: string, catatan: string) {
    return this.request(`/berkas/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ catatan }),
    });
  }

  // ============ STATISTIK ENDPOINTS ============
  
  async getDashboardStats() {
    const response = await this.request('/stats/dashboard');
    return response.data;
  }

  async getChartData(tahun?: number) {
    const response = await this.request(`/stats/chart${tahun ? `?tahun=${tahun}` : ''}`);
    return response.data;
  }
}

export const api = new ApiClient();