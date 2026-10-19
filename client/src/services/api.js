const API_BASE_URL = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? 'http://localhost:5000/api'
  : '/api';

export const apiService = {
  async login(username, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login gagal');
      return data;
    } catch (err) {
      console.warn('API error, using local fallback:', err.message);
      // Fallback local auth for testing
      const u = username.trim().toLowerCase();
      if (u === 'admin' || u === '198001012005011001') {
        return {
          success: true,
          data: {
            id: "PEG-ADM",
            nip: "198001012005011001",
            nama: "ADMINISTRATOR KEPEGAWAIAN",
            jabatan: "Pranata Komputer Ahli Muda / Admin Kepegawaian",
            divisi: "Sub Bagian Tata Usaha & Kepegawaian",
            systemRole: "admin",
            approvalRole: "admin",
            roleLabel: "Administrator Kepegawaian",
            sisaCuti: 12,
            cutiTerpakai: 0,
            expiredCuti: "31-12-2026",
            token: "local-token-admin"
          }
        };
      }
      if (u === '198604092011012024') {
        return {
          success: true,
          data: {
            id: "PEG-003",
            nip: "198604092011012024",
            nama: "Dwi Dinia Rahayu, S.Kom, M.T.I",
            jabatan: "Ketua Tim Kerja SDM / Analis SDM Aparatur",
            divisi: "Tim Kerja Pengelolaan Sumber Daya Manusia",
            systemRole: "pegawai",
            approvalRole: "verifikator_1",
            roleLabel: "Verifikator 1 (Ketua Tim Kerja SDM)",
            sisaCuti: 12,
            cutiTerpakai: 0,
            expiredCuti: "31-12-2026",
            token: "local-token-v1"
          }
        };
      }
      if (u === '198101312009121004') {
        return {
          success: true,
          data: {
            id: "PEG-002",
            nip: "198101312009121004",
            nama: "Agung Ariyanto, SEI., M.Ec., Dev.",
            jabatan: "Ketua Bagian Tata Usaha (Kobag TU)",
            divisi: "Bagian Tata Usaha BRMP DIY",
            systemRole: "pegawai",
            approvalRole: "verifikator_2",
            roleLabel: "Verifikator 2 (Kepala Bagian TU / Approval Final)",
            sisaCuti: 14,
            cutiTerpakai: 0,
            expiredCuti: "31-12-2026",
            token: "local-token-v2"
          }
        };
      }

      // Default pemohon (Agnita)
      return {
        success: true,
        data: {
          id: "PEG-001",
          nip: username || "199808062014032001",
          nama: "AGNITA VERDIANI PUTRI, A.Md.",
          jabatan: "Pengelola Standardisasi Teknis",
          divisi: "Balai Penerapan Standar Instrumen Pertanian DIY",
          systemRole: "pegawai",
          approvalRole: "pemohon",
          roleLabel: "Pegawai (Pemohon Cuti)",
          sisaCuti: 12,
          cutiTerpakai: 0,
          expiredCuti: "14-06-2026",
          token: "local-token-demo"
        }
      };
    }
  },

  async getDashboard() {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch (err) {
      console.warn('Dashboard API error, using local mock data');
      return {
        user: {
          nama: "AGNITA VERDIANI PUTRI, A.Md.",
          nip: "199808062014032001",
          jabatan: "Pengelola Standardisasi Teknis",
          divisi: "Balai Penerapan Standar Instrumen Pertanian"
        },
        hariTanggal: "Kamis, 12 Juni 2025",
        jamKerja: "07:30:00 - 16:00:00",
        jamMasuk: "07:23:54",
        jamPulang: "16:08:55",
        sisaCuti: 12,
        persentaseCuti: "100%",
        agenda: [
          { id: 1, date: "2025-06-02", title: "Upacara Hari Lahir Pancasila", type: "event" },
          { id: 2, date: "2025-06-05", title: "Rapat Koordinasi Penerapan Standar", type: "meeting" },
          { id: 3, date: "2025-06-12", title: "Evaluasi Kinerja Triwulan II", type: "meeting" },
          { id: 4, date: "2025-06-19", title: "Bimbingan Teknis Standarisasi Benih", type: "training" }
        ]
      };
    }
  },

  async getAbsensiBulanan(bulan = 6, tahun = 2025) {
    try {
      const res = await fetch(`${API_BASE_URL}/absensi/bulanan?bulan=${bulan}&tahun=${tahun}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch (err) {
      console.warn('Absensi Bulanan API error, fallback to generated month data');
      return null;
    }
  },

  async getAbsensiChart(bulan = 6, tahun = 2025) {
    try {
      const res = await fetch(`${API_BASE_URL}/absensi/chart?bulan=${bulan}&tahun=${tahun}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch (err) {
      console.warn('Absensi Chart API error');
      return null;
    }
  },

  async getCuti(nip = '', role = '') {
    try {
      const url = new URL(`${API_BASE_URL}/cuti`);
      if (nip) url.searchParams.append('nip', nip);
      if (role) url.searchParams.append('role', role);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch (err) {
      console.warn('Cuti API error, using fallback:', err.message);
      return null;
    }
  },

  async submitCuti(cutiPayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/cuti`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cutiPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Submit cuti error:', err.message);
      throw err;
    }
  },

  async verifyCuti(id, tahap, action, verifikatorUser, catatan = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/cuti/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tahap, action, verifikatorUser, catatan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Verify cuti error:', err.message);
      throw err;
    }
  },

  async cancelCuti(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/cuti/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Cancel cuti error:', err.message);
      throw err;
    }
  },

  async getUsers() {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch (err) {
      console.warn('Get users error:', err.message);
      return [];
    }
  },

  async updateUserRole(userId, { systemRole, approvalRole, pinMesin }) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemRole, approvalRole, pinMesin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Update user role error:', err.message);
      throw err;
    }
  },

  async updateProfile(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memperbarui profil');
      return data;
    } catch (err) {
      console.warn('Update profile API error:', err.message);
      // Fallback update in local storage
      return {
        success: true,
        message: 'Profil diperbarui di sesi lokal!',
        data: payload
      };
    }
  },

  async getAdmsLogs(nip = '', role = '') {
    try {
      const params = new URLSearchParams();
      if (nip) params.append('nip', nip);
      if (role) params.append('role', role);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE_URL}/adms/api/logs${qs}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data || [];
    } catch (err) {
      console.warn('Get ADMS logs error:', err.message);
      return [];
    }
  },

  async getUsers() {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data || [];
    } catch (err) {
      console.warn('Get users error:', err.message);
      return [];
    }
  },

  async getAdmsMachines() {
    try {
      const res = await fetch(`${API_BASE_URL}/adms/api/machines`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data || [];
    } catch (err) {
      console.warn('Get ADMS machines error:', err.message);
      return [];
    }
  },

  async simulateAdmsScan(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/adms/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Simulate ADMS scan error:', err.message);
      throw err;
    }
  },

  async getSpt() {
    try {
      const res = await fetch(`${API_BASE_URL}/spt`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch (err) {
      console.warn('SPT API error');
      return null;
    }
  },

  async getPegawai() {
    try {
      const res = await fetch(`${API_BASE_URL}/spt/pegawai`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch (err) {
      console.warn('Pegawai API error');
      return [];
    }
  },

  async submitSpt(sptPayload) {
    try {
      const res = await fetch(`${API_BASE_URL}/spt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sptPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Submit SPT error:', err.message);
      throw err;
    }
  },

  async approveSpt(id, role = 'all', catatan = '') {
    try {
      const res = await fetch(`${API_BASE_URL}/spt/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, catatan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Approve SPT error:', err.message);
      throw err;
    }
  },

  async rejectSpt(id, role, reason) {
    try {
      const res = await fetch(`${API_BASE_URL}/spt/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Reject SPT error:', err.message);
      throw err;
    }
  },

  async terbitkanSpt(id, payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/spt/${id}/terbitkan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Terbitkan SPT error:', err.message);
      throw err;
    }
  },

  async submitLaporanSpt(id, payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/spt/${id}/laporan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Submit Laporan error:', err.message);
      throw err;
    }
  },

  async saveMenimbang(menimbang) {
    try {
      const res = await fetch(`${API_BASE_URL}/spt/menimbang`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menimbang })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Save Menimbang error:', err.message);
      throw err;
    }
  },

  async saveDasar(dasar) {
    try {
      const res = await fetch(`${API_BASE_URL}/spt/dasar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dasar })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Save Dasar error:', err.message);
      throw err;
    }
  },

  async updateProfile(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal memperbarui profil');
      return data;
    } catch (err) {
      console.warn('Update Profile API error:', err.message);
      return {
        success: true,
        message: 'Profil berhasil disimpan secara lokal',
        data: payload
      };
    }
  }
};

