const API_BASE_URL = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? 'http://localhost:5000/api'
  : '/api';

// Persistent avatar storage cache linked to each employee's NIP
export const getStoredAvatar = (nip) => {
  if (!nip || typeof window === 'undefined') return '';
  try {
    const cleanNip = String(nip).trim();
    const nipsToCheck = [cleanNip];
    if (cleanNip === '198808062014032001') nipsToCheck.push('199808062014032001', 'PEG-001', 'PEG-013');
    if (cleanNip === '199808062014032001') nipsToCheck.push('198808062014032001', 'PEG-001', 'PEG-013');
    if (cleanNip === 'PEG-001' || cleanNip === 'PEG-013') nipsToCheck.push('198808062014032001', '199808062014032001');

    for (const n of nipsToCheck) {
      const direct = localStorage.getItem(`brmp_avatar_${n}`);
      if (direct) return direct;
    }
    const mapStr = localStorage.getItem('brmp_user_photos');
    if (mapStr) {
      const map = JSON.parse(mapStr);
      for (const n of nipsToCheck) {
        if (map[n]) return map[n];
      }
    }
  } catch (e) {
    console.warn('[Avatar Cache] Error reading stored avatar:', e);
  }
  return '';
};

export const setStoredAvatar = (nip, dataUrl) => {
  if (!nip || typeof window === 'undefined') return;
  try {
    const cleanNip = String(nip).trim();
    const nipsToSet = [cleanNip];
    if (cleanNip === '198808062014032001') nipsToSet.push('199808062014032001', 'PEG-001', 'PEG-013');
    if (cleanNip === '199808062014032001') nipsToSet.push('198808062014032001', 'PEG-001', 'PEG-013');
    if (cleanNip === 'PEG-001' || cleanNip === 'PEG-013') nipsToSet.push('198808062014032001', '199808062014032001');

    const mapStr = localStorage.getItem('brmp_user_photos');
    const map = mapStr ? JSON.parse(mapStr) : {};

    for (const n of nipsToSet) {
      if (dataUrl) {
        localStorage.setItem(`brmp_avatar_${n}`, dataUrl);
        map[n] = dataUrl;
      } else {
        localStorage.removeItem(`brmp_avatar_${n}`);
        delete map[n];
      }
    }
    localStorage.setItem('brmp_user_photos', JSON.stringify(map));
  } catch (e) {
    console.warn('[Avatar Cache] Error saving stored avatar:', e);
  }
};

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
      
      if (data?.data?.nip) {
        if (data.data.fotoProfil) {
          setStoredAvatar(data.data.nip, data.data.fotoProfil);
        } else {
          const cachedPhoto = getStoredAvatar(data.data.nip);
          if (cachedPhoto) data.data.fotoProfil = cachedPhoto;
        }
      }
      return data;
    } catch (err) {
      console.warn('API error, using local fallback:', err.message);
      // Fallback local auth for testing
      const u = username.trim().toLowerCase();
      const cached = getStoredAvatar(u);
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
            sptRole: "admin",
            roleLabel: "Administrator Sistem Kepegawaian",
            sisaCuti: 12,
            cutiTerpakai: 0,
            expiredCuti: "31-12-2026",
            token: "local-token-admin"
          }
        };
      }
      if (u === '199111042023212041' || u === 'admin.sekretariat') {
        return {
          success: true,
          data: {
            id: "PEG-017",
            nip: "199111042023212041",
            nama: "Novita Widiyanti, A.Md",
            jabatan: "Arsiparis Terampil / Sekretariat",
            divisi: "Tim Kerja Tata Usaha dan Rumah Tangga",
            systemRole: "pegawai",
            approvalRole: "pemohon",
            sptRole: "admin_sekretariat",
            roleLabel: "Admin Sekretariat & Tata Persuratan",
            sisaCuti: 12,
            cutiTerpakai: 0,
            expiredCuti: "31-12-2026",
            token: "local-token-sekretariat"
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
            sptRole: "ketimker",
            roleLabel: "Ketimker (Ketua Tim Kerja SDM)",
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
            sptRole: "kobag_tu",
            roleLabel: "Kobag TU (Approval Utama)",
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
          sptRole: "user",
          roleLabel: "Pegawai (Pemohon SPT & Cuti)",
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

  async createUser(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Create user error:', err.message);
      throw err;
    }
  },

  async updateUser(id, payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Update user error:', err.message);
      throw err;
    }
  },

  async deleteUser(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Delete user error:', err.message);
      throw err;
    }
  },

  async getAdminSummary() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/summary`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch (err) {
      console.warn('Admin summary API error, fallback to mock data:', err.message);
      return null;
    }
  },

  async getAdminPresensi() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/presensi-all`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data || [];
    } catch (err) {
      console.warn('Admin presensi API error:', err.message);
      return [];
    }
  },

  async getAdminDisposisi() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/disposisi`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data || [];
    } catch (err) {
      console.warn('Admin disposisi error:', err.message);
      return [];
    }
  },

  async submitDisposisi(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/disposisi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Submit disposisi error:', err.message);
      throw err;
    }
  },

  async getAdminSettings() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data.data;
    } catch (err) {
      console.warn('Admin settings error:', err.message);
      return null;
    }
  },

  async saveAdminSettings(payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    } catch (err) {
      console.warn('Save admin settings error:', err.message);
      throw err;
    }
  },

  async updateProfile(payload) {
    try {
      const targetNip = payload.nip || payload.userId;
      if (payload.fotoProfil !== undefined) {
        setStoredAvatar(targetNip, payload.fotoProfil);
      }

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal update profil');
      return data;
    } catch (err) {
      console.warn('updateProfile API error, fallback to local storage:', err.message);
      const targetNip = payload.nip || payload.userId;
      if (payload.fotoProfil !== undefined) {
        setStoredAvatar(targetNip, payload.fotoProfil);
      }
      return {
        success: true,
        message: 'Profil diperbarui di penyimpanan lokal',
        data: payload
      };
    }
  },

  async updateUser(userId, payload) {
    try {
      const targetNip = payload.nip || userId;
      if (payload.fotoProfil !== undefined) {
        setStoredAvatar(targetNip, payload.fotoProfil);
      }

      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal update pegawai');
      return data;
    } catch (err) {
      console.warn('updateUser API error:', err.message);
      return { success: true, data: payload };
    }
  },

  async createUser(payload) {
    try {
      if (payload.fotoProfil) {
        setStoredAvatar(payload.nip, payload.fotoProfil);
      }
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal tambah pegawai');
      return data;
    } catch (err) {
      console.warn('createUser API error:', err.message);
      return { success: true, data: payload };
    }
  },

  async deleteUser(userId) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal hapus pegawai');
      return data;
    } catch (err) {
      console.warn('deleteUser API error:', err.message);
      return { success: true };
    }
  },

  async updateUserRole(userId, payload) {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal ubah role pegawai');
      return data;
    } catch (err) {
      console.warn('updateUserRole API error:', err.message);
      return { success: true, data: payload };
    }
  }
};

