/**
 * Aplikasi Utama Sistem SPT Digital Kementan BRMP DIY (Versi Dinamis Multi-Role)
 * Login tersendiri, Dashboard mandiri per role, Validasi bentrok jadwal, Approval berjenjang
 */

const App = {
  currentRole: null,
  currentUser: null,
  currentView: "dashboard",
  selectedMembers: [],
  editingSptId: null,

  init() {
    this.populateLoginQuickSelect();
    this.checkAuth();
    this.bindFormEvents();
    this.bindModals();

    // Check if target view is passed in URL query param
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    if (viewParam && this.currentUser) {
      setTimeout(() => this.navigateTo(viewParam), 50);
    }
  },

  syncPortalUser(portalUser, targetView) {
    if (!portalUser) return;
    const users = AppStorage.getUsers();

    const KETIMKER_NIPS = [
      "198108262011012006", "198012072006042001", "196807121999031001", "197606072009011006",
      "197206181999032001", "198003272009101001", "198302162011011008", "197106141992032001",
      "198106212006042002", "198604092011012024"
    ];

    const nip = String(portalUser.nip || '').trim();
    const pRole = String(portalUser.role || '').toLowerCase();
    
    let resolvedRole = 'user';
    if (['kobag_tu', 'ketimker', 'admin_sekretariat', 'kopoks', 'user'].includes(pRole)) {
      resolvedRole = pRole;
    } else if (pRole === 'admin' || nip === '199111042023212041' || nip === '199103102025211055' || portalUser.id === 'PEG-017' || portalUser.id === 'PEG-021' || portalUser.id === 'PEG-ADM' || portalUser.username === 'admin') {
      resolvedRole = 'admin_sekretariat';
    } else if (nip === '198101312009121004' || portalUser.id === 'PEG-002') {
      resolvedRole = 'kobag_tu';
    } else if (KETIMKER_NIPS.includes(nip) || portalUser.id === 'PEG-003') {
      resolvedRole = 'ketimker';
    } else if (nip === '197402062000032001' || portalUser.id === 'PEG-053' || portalUser.id === 'PEG-034') {
      resolvedRole = 'kopoks';
    }

    let matched = users.find(u => (u.nip && u.nip === portalUser.nip) || (u.pegawaiId && u.pegawaiId === portalUser.id) || u.id === portalUser.id);

    const roleLabelMap = {
      admin_sekretariat: "Admin Sekretariat",
      kobag_tu: "Kobag TU (Approval Utama)",
      ketimker: "Ketimker (Ketua Tim Kerja)",
      kopoks: "Kopoks (Koordinator Poksi)",
      user: "User (Pemohon/Pegawai)"
    };

    if (!matched) {
      matched = {
        id: `usr-${(portalUser.id || 'peg').toLowerCase()}`,
        pegawaiId: portalUser.id || 'PEG-001',
        username: (portalUser.nama || 'pegawai').toLowerCase().replace(/[^a-z]/g, '').slice(0, 10),
        nama: portalUser.nama || 'Pegawai BRMP',
        nip: portalUser.nip || '',
        role: resolvedRole,
        roleLabel: roleLabelMap[resolvedRole] || 'Pegawai',
        jabatan: portalUser.jabatan || 'Staf',
        golongan: portalUser.golongan || '',
        unitKerja: portalUser.divisi || 'Balai Penerapan Standar Instrumen Pertanian DIY',
        avatar: portalUser.nama ? portalUser.nama.split(' ').map(p => p[0]).slice(0,2).join('').toUpperCase() : 'US'
      };
    } else {
      matched.role = resolvedRole;
      matched.roleLabel = roleLabelMap[resolvedRole] || matched.roleLabel;
    }

    AppStorage.setAuthSession(matched);
    this.currentUser = matched;
    this.currentRole = matched.role;

    const loginWrapper = document.getElementById("loginPortalWrapper");
    const appLayout = document.getElementById("appMainLayout");
    if (loginWrapper) loginWrapper.style.display = "none";
    if (appLayout) appLayout.style.display = "flex";

    this.updateUserHeader();
    this.buildDynamicSidebar();

    if (targetView) {
      this.navigateTo(targetView);
    } else {
      this.renderCurrentView();
    }
  },

  populateLoginQuickSelect() {
    const select = document.getElementById("loginQuickSelect");
    if (!select) return;

    const users = AppStorage.getUsers();
    const sorted = [...users].sort((a, b) => a.nama.localeCompare(b.nama));

    select.innerHTML = `<option value="">-- Pilih Cepat Akun Pegawai (115 Pegawai BRMP DIY) --</option>` +
      sorted.map(u => `<option value="${u.id}">${u.nama} — ${u.roleLabel} (${u.unitKerja})</option>`).join("");
  },

  handleQuickSelectUser(userId) {
    if (!userId) return;
    const users = AppStorage.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const uInput = document.getElementById("loginUsername");
    const pInput = document.getElementById("loginPassword");
    if (uInput) uInput.value = user.username;
    if (pInput) pInput.value = user.password || "123456";
  },

  // ==========================================
  // AUTENTIKASI & MANAJEMEN SESI LOGIN
  // ==========================================
  checkAuth() {
    const user = AppStorage.getAuthSession();
    const loginWrapper = document.getElementById("loginPortalWrapper");
    const appLayout = document.getElementById("appMainLayout");

    if (!user) {
      this.currentUser = null;
      this.currentRole = null;
      if (loginWrapper) loginWrapper.style.display = "flex";
      if (appLayout) appLayout.style.display = "none";
      return;
    }

    this.currentUser = user;
    this.currentRole = user.role;

    if (loginWrapper) loginWrapper.style.display = "none";
    if (appLayout) appLayout.style.display = "flex";

    this.updateUserHeader();
    this.buildDynamicSidebar();
    this.renderCurrentView();
  },

  handleLoginSubmit(e) {
    e.preventDefault();
    const usernameInput = document.getElementById("loginUsername")?.value;
    const passwordInput = document.getElementById("loginPassword")?.value;
    const alertBox = document.getElementById("loginAlertBox");

    const result = AppStorage.login(usernameInput, passwordInput);
    if (!result.success) {
      if (alertBox) {
        alertBox.textContent = result.message;
        alertBox.style.display = "block";
      }
      return;
    }

    if (alertBox) alertBox.style.display = "none";
    this.showToast(`Selamat datang, ${result.user.nama}!`, "success");
    this.checkAuth();
  },

  loginAsDemo(roleKey) {
    const users = AppStorage.getUsers();
    const targetUser = users.find(u => u.role === roleKey);
    if (!targetUser) return;

    AppStorage.login(targetUser.username, targetUser.password);
    this.showToast(`Masuk sebagai ${targetUser.roleLabel}: ${targetUser.nama}`, "success");
    this.checkAuth();
  },

  handleLogout() {
    AppStorage.logout();
    this.showToast("Anda telah keluar dari sistem.", "info");
    this.checkAuth();
  },

  switchAccountModalTab(tab) {
    const switchContent = document.getElementById("accountTabContentSwitch");
    const profileContent = document.getElementById("accountTabContentProfile");
    const btnSwitch = document.getElementById("tabBtnSwitch");
    const btnProfile = document.getElementById("tabBtnProfile");

    if (tab === "switch") {
      if (switchContent) switchContent.style.display = "block";
      if (profileContent) profileContent.style.display = "none";
      if (btnSwitch) btnSwitch.classList.add("active");
      if (btnProfile) btnProfile.classList.remove("active");
    } else {
      if (switchContent) switchContent.style.display = "none";
      if (profileContent) profileContent.style.display = "block";
      if (btnSwitch) btnSwitch.classList.remove("active");
      if (btnProfile) btnProfile.classList.add("active");
    }
  },

  getRoleConfig(role) {
    if (role === 'admin') role = 'admin_sekretariat';
    const configs = {
      admin_sekretariat: {
        gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
        pillStyle: "background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe;",
        wewenang: "Penomoran Resmi SPT & Administrasi Tata Naskah",
        permissions: [
          { name: "Registrasi & Penomoran SPT Resmi", allowed: true },
          { name: "Monitoring Seluruh Naskah Dinas", allowed: true },
          { name: "Cetak Naskah Dinas Format Resmi Kementan", allowed: true },
          { name: "Verifikasi Tingkat Unit Kerja", allowed: false },
          { name: "Persetujuan Utama (Final)", allowed: false }
        ]
      },
      user: {
        gradient: "linear-gradient(135deg, #10b981, #059669)",
        pillStyle: "background: #f0fdf4; color: #15803d; border-color: #bbf7d0;",
        wewenang: "Pengajuan Mandiri SPT & Upload Laporan Tugas",
        permissions: [
          { name: "Input & Pengajuan Usulan SPT", allowed: true },
          { name: "Melihat Riwayat SPT Pribadi", allowed: true },
          { name: "Unggah Laporan Hasil Tugas Lapangan", allowed: true },
          { name: "Approval / Verifikasi Naskah", allowed: false },
          { name: "Penomoran Naskah Dinas", allowed: false }
        ]
      },
      ketimker: {
        gradient: "linear-gradient(135deg, #0d9488, #0f766e)",
        pillStyle: "background: #f0fdfa; color: #0f766e; border-color: #99f6e4;",
        wewenang: "Verifikasi Tingkat 1 & Validasi Jadwal Tim",
        permissions: [
          { name: "Verifikasi Substantif Pengajuan Tim (Tier 1)", allowed: true },
          { name: "Pendeteksian Bentrok Jadwal Anggota", allowed: true },
          { name: "Penerusan Usulan ke Kobag TU", allowed: true },
          { name: "Pengesahan / Approval Utama", allowed: false },
          { name: "Penomoran Resmi Naskah", allowed: false }
        ]
      },
      kopoks: {
        gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        pillStyle: "background: #fffbeb; color: #b45309; border-color: #fde68a;",
        wewenang: "Supervisi & Pemantauan Poksi/Substansi",
        permissions: [
          { name: "Monitoring Penugasan Substansi Lapangan", allowed: true },
          { name: "Evaluasi Pelaksanaan Standarisasi", allowed: true },
          { name: "Akses Rekapitulasi Penugasan", allowed: true },
          { name: "Penerbitan Nomor SPT", allowed: false },
          { name: "Approval Tingkat Unit Kerja", allowed: false }
        ]
      },
      kobag_tu: {
        gradient: "linear-gradient(135deg, #1e293b, #0f172a)",
        pillStyle: "background: #faf5ff; color: #7e22ce; border-color: #e9d5ff;",
        wewenang: "Persetujuan Utama (Tier 2) & Pengesahan Naskah",
        permissions: [
          { name: "Persetujuan Utama (Final Approval) Naskah SPT", allowed: true },
          { name: "Otorisasi Penerbitan Naskah Dinas Resmi", allowed: true },
          { name: "Supervisi Seluruh Tim Kerja BRMP DIY", allowed: true },
          { name: "Akses Audit Trail Seluruh Dokumen", allowed: true },
          { name: "Penomoran Naskah Administratif", allowed: false }
        ]
      }
    };

    return configs[role] || {
      gradient: "linear-gradient(135deg, #1b5e20, #2e7d32)",
      pillStyle: "background: #f1f5f9; color: #334155; border-color: #cbd5e1;",
      wewenang: "Pengguna Sistem SPT Digital",
      permissions: []
    };
  },

  openSwitchAccountModal() {
    const modal = document.getElementById("modalSwitchAccount");
    const container = document.getElementById("switchAccountListContainer");
    const highlightContainer = document.getElementById("activeAccountHighlight");
    const profileContainer = document.getElementById("activeProfileDetailContainer");
    const countBadge = document.getElementById("accountCountBadge");
    if (!modal || !container) return;

    const users = AppStorage.getUsers();
    const currentUser = this.currentUser || users[0];
    const currentId = currentUser ? currentUser.id : "";
    const currentCfg = this.getRoleConfig(currentUser.role);

    // Reset tab to default: switch
    this.switchAccountModalTab("switch");

    if (countBadge) {
      countBadge.textContent = `${users.length} Akun Tersedia`;
    }

    // 1. Render Active Account Highlight Card
    if (highlightContainer && currentUser) {
      highlightContainer.innerHTML = `
        <div class="account-current-summary">
          <div class="account-current-summary-header">
            <div class="current-avatar-lg" style="background: ${currentCfg.gradient};">
              ${currentUser.avatar || currentUser.nama.slice(0, 2).toUpperCase()}
              <span class="online-indicator" title="Akun Aktif Saat Ini"></span>
            </div>
            <div class="current-summary-details">
              <div class="current-tag">
                <span class="pulse-dot"></span> Sesi Login Aktif
              </div>
              <div class="current-name">${currentUser.nama}</div>
              <div class="current-badges">
                <span class="badge-role-current">${currentUser.roleLabel}</span>
                <span class="badge-nip-current">NIP. ${currentUser.nip}</span>
              </div>
            </div>
          </div>
          <div class="current-summary-meta-grid">
            <div class="summary-meta-item">
              <span class="meta-label">Jabatan Kedinasan</span>
              <span class="meta-value">${currentUser.jabatan}</span>
            </div>
            <div class="summary-meta-item">
              <span class="meta-label">Unit Kerja</span>
              <span class="meta-value">${currentUser.unitKerja}</span>
            </div>
            <div class="summary-meta-item">
              <span class="meta-label">Wewenang Utama</span>
              <span class="meta-value" style="color: #15803d;">${currentCfg.wewenang}</span>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Render List of Accounts dengan Filter Pencarian
    const searchInput = document.getElementById("switchAccountSearchInput");
    if (searchInput) searchInput.value = "";
    this.filterSwitchAccountList();

    // 3. Render Profile Detail Tab
    if (profileContainer && currentUser) {
      const perms = currentCfg.permissions || [];
      const permsHtml = perms.map(p => `
        <div class="permission-chip ${p.allowed ? 'allowed' : ''}">
          ${p.allowed ? `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ` : `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          `}
          <span>${p.name}</span>
        </div>
      `).join("");

      profileContainer.innerHTML = `
        <div class="profile-detail-card">
          <div class="profile-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b5e20" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Identitas Pegawai Aktif
          </div>
          <div class="profile-info-grid">
            <div class="profile-info-row">
              <span class="profile-info-label">Nama Lengkap & Gelar</span>
              <span class="profile-info-value">${currentUser.nama}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Nomor Induk Pegawai (NIP)</span>
              <span class="profile-info-value" style="font-family: monospace;">${currentUser.nip}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Username Login</span>
              <span class="profile-info-value">${currentUser.username}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Peran Sistem (Role)</span>
              <span class="profile-info-value" style="color: #15803d;">${currentUser.roleLabel}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Jabatan Kedinasan</span>
              <span class="profile-info-value">${currentUser.jabatan}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Unit Organisasi BRMP DIY</span>
              <span class="profile-info-value">${currentUser.unitKerja}</span>
            </div>
          </div>
        </div>

        <div class="profile-detail-card">
          <div class="profile-section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1b5e20" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Matriks Hak Akses & Wewenang Tata Naskah Dinas
          </div>
          <p class="text-muted mb-3" style="font-size: 12px;">
            Wewenang berikut secara otomatis dikonfigurasi mengikuti peran kedinasan <strong>${currentUser.roleLabel}</strong> sesuai tata tertib administrasi BRMP DIY:
          </p>
          <div class="permissions-matrix-grid">
            ${permsHtml}
          </div>
        </div>
      `;
    }

    modal.classList.add("show");
    modal.style.display = "flex";
  },

  filterSwitchAccountList() {
    const container = document.getElementById("switchAccountListContainer");
    const countBadge = document.getElementById("accountCountBadge");
    const searchInput = document.getElementById("switchAccountSearchInput");
    if (!container) return;

    const term = (searchInput?.value || "").toLowerCase().trim();
    const users = AppStorage.getUsers();
    const currentUser = this.currentUser || users[0];
    const currentId = currentUser ? currentUser.id : "";

    const filtered = users.filter(u => 
      !term ||
      u.nama.toLowerCase().includes(term) ||
      (u.nip && u.nip.includes(term)) ||
      (u.username && u.username.toLowerCase().includes(term)) ||
      (u.unitKerja && u.unitKerja.toLowerCase().includes(term)) ||
      (u.jabatan && u.jabatan.toLowerCase().includes(term)) ||
      (u.roleLabel && u.roleLabel.toLowerCase().includes(term))
    );

    if (countBadge) {
      countBadge.textContent = `${filtered.length} dari ${users.length} Akun`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <p style="font-size: 13px;">Tidak ada akun pegawai yang cocok dengan kata kunci "<strong>${term}</strong>".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(u => {
      const isCurrent = u.id === currentId || (currentUser && currentUser.nip && u.nip === currentUser.nip);
      const cfg = this.getRoleConfig(u.role);
      const avatarInitials = u.avatar || u.nama.slice(0, 2).toUpperCase();

      return `
        <div class="account-item-card ${isCurrent ? 'account-active-item' : ''}">
          <div class="account-item-avatar" style="background: ${cfg.gradient};">
            ${avatarInitials}
          </div>
          <div class="account-item-info">
            <div class="account-item-top">
              <h4 class="account-item-name">${u.nama}</h4>
              ${isCurrent ? '<span class="account-badge-active"><span class="pulse-dot"></span> Akun Aktif</span>' : ''}
            </div>
            <div class="account-item-meta">
              <span class="account-nip-pill" title="Nomor Induk Pegawai">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="13" y2="12"/></svg>
                NIP. ${u.nip || "-"}
              </span>
              <span class="account-role-pill" style="${cfg.pillStyle}">
                ${u.roleLabel}
              </span>
            </div>
            <div class="account-item-sub">
              <span class="account-unit-tag" title="Unit Organisasi">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1"/></svg>
                ${u.unitKerja}
              </span>
              <span class="account-jabatan-text">• ${u.jabatan}</span>
            </div>
          </div>
          <div class="account-item-action">
            ${isCurrent ? `
              <div class="account-current-badge">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Sedang Digunakan</span>
              </div>
            ` : `
              <button class="btn-switch-account-action" onclick="App.switchAccountTo('${u.id}')">
                <span>Pilih & Masuk</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            `}
          </div>
        </div>
      `;
    }).join("");
  },

  switchAccountTo(userId) {
    const users = AppStorage.getUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return;

    AppStorage.login(target.username, target.password);
    this.closeModal("modalSwitchAccount");
    this.showToast(`Beralih akun ke: ${target.roleLabel} (${target.nama})`, "success");
    this.selectedMembers = [];
    this.checkAuth();
    if (this.currentView === "pengajuan") {
      this.renderFormPengajuan();
    }
  },

  updateUserHeader() {
    if (!this.currentUser) return;
    const nameEl = document.getElementById("headerUserName");
    const roleEl = document.getElementById("headerUserRole");
    const avatarEl = document.getElementById("headerUserAvatar");
    const badgeSidebar = document.getElementById("sidebarRoleBadge");

    if (nameEl) nameEl.textContent = this.currentUser.nama;
    if (roleEl) roleEl.textContent = `${this.currentUser.roleLabel}`;
    if (avatarEl) avatarEl.textContent = this.currentUser.avatar || "BR";
    if (badgeSidebar) badgeSidebar.textContent = this.currentUser.roleLabel;
  },

  // ==========================================
  // ==========================================
  // HELPER ROUTING TIM KERJA & APPROVAL KETIMKER
  // ==========================================
  findKetimkerForUnit(unitKerja) {
    const allPegawai = AppStorage.getPegawai();
    const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const target = norm(unitKerja);

    const ketimkerMap = {
      "pengelolaansumberdayamanusia": "198604092011012024", // Dwi Dinia Rahayu
      "keuangandanbarangmiliknegara": "198106212006042002", // Asri Wijayanti
      "tatausahadanrumahtangga": "197106141992032001", // Yuni Pratiwi
      "tatausaha": "197106141992032001",
      "programevaluasidanpendampingan": "198302162011011008", // Eko Sutardi
      "pengujianteknologispesifiklokasi": "198003272009101001", // Agung Iswadi
      "pendampinganprogramdanwilayahi": "197206181999032001", // Kurnianita Triwidiastuti
      "pendampinganprogramdanwilayahii": "197606072009011006", // Utomo Bimo Bekti
      "penerapandiseminasi": "198108262011012006", // Diah Sulistyorini
      "pengelolakerjasamalayanandankesesuaian": "198012072006042001", // Charisnalia Listyowati
      "laboratoriumpupuktanahdanair": "196807121999031001", // Widada
      "laboratorium": "196807121999031001",
      "perpustakaan": "198108262011012006", // under Diseminasi
      "penyuluhpertanianlapangan": "198108262011012006" // under Diseminasi
    };

    for (const [key, nip] of Object.entries(ketimkerMap)) {
      if (target.includes(key) || key.includes(target)) {
        const found = allPegawai.find(p => p.nip === nip);
        if (found) return found;
      }
    }

    return allPegawai.find(p => p.roleDefault === "ketimker" && (norm(p.unitKerja) === target || norm(p.unitKerja).includes(target) || target.includes(norm(p.unitKerja)))) || null;
  },

  isSptForKetimker(spt, ketimkerUser) {
    if (!spt || !ketimkerUser) return false;

    // 1. Direct match berdasarkan NIP Ketimker yang dituju
    if (spt.targetKetimkerNip && ketimkerUser.nip && spt.targetKetimkerNip === ketimkerUser.nip) {
      return true;
    }

    const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const kUnit = norm(ketimkerUser.unitKerja);
    const pUnit = norm(spt.pemohon?.unitKerja || spt.unitKerja || (spt.anggota && spt.anggota[0]?.unitKerja));

    if (kUnit && pUnit) {
      if (kUnit === pUnit || kUnit.includes(pUnit) || pUnit.includes(kUnit)) return true;
      if (kUnit.includes("tatausaha") && (pUnit.includes("tatausaha") || pUnit.includes("rumahtangga"))) return true;
      if (kUnit.includes("sumberdayamanusia") && pUnit.includes("sumberdayamanusia")) return true;
      if (kUnit.includes("keuangan") && (pUnit.includes("keuangan") || pUnit.includes("barangmiliknegara"))) return true;
      if (kUnit.includes("laboratorium") && pUnit.includes("laboratorium")) return true;
      if (kUnit.includes("diseminasi") && (pUnit.includes("diseminasi") || pUnit.includes("perpustakaan") || pUnit.includes("penyuluh"))) return true;
      if (kUnit.includes("wilayahi") && pUnit.includes("wilayahi") && !pUnit.includes("wilayahii")) return true;
      if (kUnit.includes("wilayahii") && pUnit.includes("wilayahii")) return true;
      if (kUnit.includes("spesifiklokasi") && pUnit.includes("spesifiklokasi")) return true;
      if (kUnit.includes("evaluasi") && pUnit.includes("evaluasi")) return true;
      if (kUnit.includes("kerjasama") && pUnit.includes("kerjasama")) return true;
    }

    return false;
  },

  // ==========================================
  // SIDEBAR DINAMIS BERDASARKAN ROLE
  // ==========================================
  buildDynamicSidebar() {
    const container = document.getElementById("sidebarMenuContainer");
    if (!container || !this.currentUser) return;

    const spts = AppStorage.getSpts();
    const pendingKetimkerCount = spts.filter(s => s.status === "diajukan" && this.isSptForKetimker(s, this.currentUser)).length;
    const pendingKobagCount = spts.filter(s => s.status === "approved_ketimker").length;
    const pendingSekretariatCount = spts.filter(s => s.status === "approved_kobag_tu").length;
    const mySptCount = spts.filter(s => s.pemohon && (s.pemohon.id === this.currentUser.id || s.pemohon.nama === this.currentUser.nama)).length;

    let html = `
      <div class="menu-category">Utama</div>
      <a class="nav-link ${this.currentView === 'dashboard' ? 'active' : ''}" onclick="App.navigateTo('dashboard')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span>Dashboard ${this.currentUser.roleLabel.split(' ')[0]}</span>
      </a>
    `;

    // Role: User (Pegawai)
    if (this.currentRole === "user") {
      html += `
        <div class="menu-category">Layanan SPT Saya</div>
        <a class="nav-link ${this.currentView === 'pengajuan' ? 'active' : ''}" onclick="App.navigateTo('pengajuan')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span>Ajukan SPT Baru</span>
        </a>
        <a class="nav-link ${this.currentView === 'tracking' ? 'active' : ''}" onclick="App.navigateTo('tracking')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Tracking & Unduh SPT</span>
          <span class="nav-badge">${mySptCount}</span>
        </a>
      `;
    }

    // Role: Ketimker
    if (this.currentRole === "ketimker") {
      html += `
        <div class="menu-category">Verifikasi Tim Kerja</div>
        <a class="nav-link ${this.currentView === 'approval-ketimker' ? 'active' : ''}" onclick="App.navigateTo('approval-ketimker')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span>Approval Unit Kerja</span>
          <span class="nav-badge alert-count">${pendingKetimkerCount}</span>
        </a>
        <a class="nav-link ${this.currentView === 'pengajuan' ? 'active' : ''}" onclick="App.navigateTo('pengajuan')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span>Buat SPT Tim</span>
        </a>
        <a class="nav-link ${this.currentView === 'tracking' ? 'active' : ''}" onclick="App.navigateTo('tracking')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Daftar Seluruh SPT</span>
        </a>
      `;
    }

    // Role: Kobag TU
    if (this.currentRole === "kobag_tu") {
      html += `
        <div class="menu-category">Persetujuan Eksekutif</div>
        <a class="nav-link ${this.currentView === 'approval-kobag' ? 'active' : ''}" onclick="App.navigateTo('approval-kobag')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span>Approval Utama Kobag</span>
          <span class="nav-badge alert-count">${pendingKobagCount}</span>
        </a>
        <a class="nav-link ${this.currentView === 'monitoring-kopoks' ? 'active' : ''}" onclick="App.navigateTo('monitoring-kopoks')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          <span>Pantau Penugasan Balai</span>
        </a>
        <a class="nav-link ${this.currentView === 'tracking' ? 'active' : ''}" onclick="App.navigateTo('tracking')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Arsip Seluruh SPT</span>
        </a>
      `;
    }

    // Role: Kopoks
    if (this.currentRole === "kopoks") {
      html += `
        <div class="menu-category">Pemantauan Substansi</div>
        <a class="nav-link ${this.currentView === 'monitoring-kopoks' ? 'active' : ''}" onclick="App.navigateTo('monitoring-kopoks')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          <span>Monitoring Penugasan</span>
        </a>
        <a class="nav-link ${this.currentView === 'tracking' ? 'active' : ''}" onclick="App.navigateTo('tracking')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Rekapitulasi SPT</span>
        </a>
      `;
    }

    // Role: Admin Sekretariat (Khusus Administrasi Tata Persuratan & Penomoran Resmi)
    if (this.currentRole === "admin_sekretariat") {
      html += `
        <div class="menu-category">Administrasi Tata Persuratan</div>
        <a class="nav-link ${this.currentView === 'admin-sekretariat' ? 'active' : ''}" onclick="App.navigateTo('admin-sekretariat')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span>Admin Sekretariat</span>
          <span class="nav-badge alert-count">${pendingSekretariatCount}</span>
        </a>
        <div class="menu-category">Layanan Persuratan</div>
        <a class="nav-link ${this.currentView === 'pengajuan' ? 'active' : ''}" onclick="App.navigateTo('pengajuan')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span>Input Pengajuan SPT</span>
        </a>
        <a class="nav-link ${this.currentView === 'tracking' ? 'active' : ''}" onclick="App.navigateTo('tracking')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Daftar Seluruh SPT</span>
        </a>
      `;
    }

    // Role: Administrator Sistem (Superadmin)
    if (this.currentRole === "admin") {
      html += `
        <div class="menu-category">Administrasi Tata Persuratan</div>
        <a class="nav-link ${this.currentView === 'admin-sekretariat' ? 'active' : ''}" onclick="App.navigateTo('admin-sekretariat')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span>Admin Sekretariat</span>
          <span class="nav-badge alert-count">${pendingSekretariatCount}</span>
        </a>
        <a class="nav-link ${this.currentView === 'pengajuan' ? 'active' : ''}" onclick="App.navigateTo('pengajuan')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          <span>Input Pengajuan SPT</span>
        </a>
        <a class="nav-link ${this.currentView === 'tracking' ? 'active' : ''}" onclick="App.navigateTo('tracking')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>Daftar Seluruh SPT</span>
        </a>
        <div class="menu-category">Supervisi Seluruh Approval</div>
        <a class="nav-link ${this.currentView === 'approval-ketimker' ? 'active' : ''}" onclick="App.navigateTo('approval-ketimker')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <span>Approval Ketimker</span>
          <span class="nav-badge alert-count">${pendingKetimkerCount}</span>
        </a>
        <a class="nav-link ${this.currentView === 'approval-kobag' ? 'active' : ''}" onclick="App.navigateTo('approval-kobag')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <span>Approval Kobag TU</span>
          <span class="nav-badge alert-count">${pendingKobagCount}</span>
        </a>
        <a class="nav-link ${this.currentView === 'monitoring-kopoks' ? 'active' : ''}" onclick="App.navigateTo('monitoring-kopoks')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          <span>Monitoring Kopoks</span>
        </a>
      `;
    }

    // Common: SOP
    html += `
      <div class="menu-category">Regulasi & Pedoman</div>
      <a class="nav-link ${this.currentView === 'sop' ? 'active' : ''}" onclick="App.navigateTo('sop')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <span>SOP & Tata Naskah Dinas</span>
      </a>
    `;

    container.innerHTML = html;
  },

  navigateTo(viewName) {
    this.currentView = viewName;
    document.querySelectorAll(".view-section").forEach(sec => {
      sec.classList.remove("active");
    });

    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add("active");
    }

    const sidebar = document.querySelector(".sidebar");
    if (sidebar) sidebar.classList.remove("open");

    this.buildDynamicSidebar();
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  renderCurrentView() {
    switch (this.currentView) {
      case "dashboard":
        this.renderRoleSpecificDashboard();
        break;
      case "pengajuan":
        this.renderFormPengajuan();
        break;
      case "tracking":
        this.renderTrackingList();
        break;
      case "approval-ketimker":
        this.renderApprovalKetimker();
        break;
      case "approval-kobag":
        this.renderApprovalKobag();
        break;
      case "monitoring-kopoks":
        this.renderMonitoringKopoks();
        break;
      case "admin-sekretariat":
        this.renderAdminSekretariat();
        break;
      case "sop":
        this.renderSopView();
        break;
    }
  },

  // ==========================================
  // DASHBOARD SPESIFIK & MANDIRI UNTUK MASING-MASING ROLE
  // ==========================================
  renderRoleSpecificDashboard() {
    const container = document.getElementById("roleDashboardContainer");
    if (!container || !this.currentUser) return;

    switch (this.currentRole) {
      case "admin":
      case "admin_sekretariat":
        this.renderDashboardAdmin(container);
        break;
      case "user":
        this.renderDashboardUser(container);
        break;
      case "ketimker":
        this.renderDashboardKetimker(container);
        break;
      case "kopoks":
        this.renderDashboardKopoks(container);
        break;
      case "kobag_tu":
        this.renderDashboardKobagTu(container);
        break;
      default:
        this.renderDashboardUser(container);
    }
  },

  // 1. DASHBOARD DEDIKASI: ADMIN SEKRETARIAT
  renderDashboardAdmin(container) {
    const spts = AppStorage.getSpts();
    const pegawai = AppStorage.getPegawai();
    const menimbang = AppStorage.getMenimbang();
    const dasar = AppStorage.getDasar();

    const pendingPenomoran = spts.filter(s => s.status === "approved_kobag_tu");
    const countTerbit = spts.filter(s => s.status === "terbit").length;

    container.innerHTML = `
      <div class="role-hero-banner banner-admin">
        <div>
          <div class="role-hero-title">
            <span>👑 Portal Administrasi Sekretariat BRMP DIY</span>
          </div>
          <div class="role-hero-desc">
            Selamat bertugas, <strong>${this.currentUser.nama}</strong>. Anda memiliki kewenangan penuh terhadap penomoran dinas, konsiderans Menimbang, Dasar hukum, Database personil, dan pengelolaan pengguna.
          </div>
        </div>
        <div>
          <button class="btn btn-warning" onclick="App.navigateTo('admin-sekretariat')">
            ⚙️ Kelola Seluruh Administrasi
          </button>
        </div>
      </div>

      <!-- Metrik Utama Admin -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon purple">📝</div>
          <div>
            <div class="stat-value">${pendingPenomoran.length}</div>
            <div class="stat-label">Siap Diberi Nomor & TTD</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">✅</div>
          <div>
            <div class="stat-value">${countTerbit}</div>
            <div class="stat-label">SPT Sah & Terbit</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber">⚖️</div>
          <div>
            <div class="stat-value">${menimbang.length} Butir</div>
            <div class="stat-label">Konsiderans Menimbang</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">👥</div>
          <div>
            <div class="stat-value">${pegawai.length} Orang</div>
            <div class="stat-label">Master Database Pegawai</div>
          </div>
        </div>
      </div>

      <!-- Action Shortcut Cards -->
      <h4 class="mb-3">Aksi Cepat Administrasi Sekretariat:</h4>
      <div class="shortcuts-grid">
        <div class="shortcut-card" onclick="App.navigateTo('admin-sekretariat'); App.showAdminSubTab('penerbitan');">
          <div class="shortcut-icon-box" style="background: #e0f2fe; color: #0284c7;">📝</div>
          <div class="shortcut-info">
            <strong>Input Nomor & Upload TTD</strong>
            <span>Terbitkan berkas SPT resmi</span>
          </div>
        </div>
        <div class="shortcut-card" onclick="App.navigateTo('admin-sekretariat'); App.showAdminSubTab('menimbang');">
          <div class="shortcut-icon-box" style="background: #fef3c7; color: #b45309;">⚖️</div>
          <div class="shortcut-info">
            <strong>Update Menimbang</strong>
            <span>Konsiderans pertimbangan SPT</span>
          </div>
        </div>
        <div class="shortcut-card" onclick="App.navigateTo('admin-sekretariat'); App.showAdminSubTab('dasar');">
          <div class="shortcut-icon-box" style="background: #ede9fe; color: #7c3aed;">📜</div>
          <div class="shortcut-info">
            <strong>Update Dasar Hukum</strong>
            <span>Peraturan perundangan & DIPA</span>
          </div>
        </div>
        <div class="shortcut-card" onclick="App.navigateTo('admin-sekretariat'); App.showAdminSubTab('database');">
          <div class="shortcut-icon-box" style="background: #dcfce7; color: #15803d;">👥</div>
          <div class="shortcut-info">
            <strong>Database Pegawai</strong>
            <span>Kelola data 70+ personil</span>
          </div>
        </div>
        <div class="shortcut-card" onclick="App.navigateTo('admin-sekretariat'); App.showAdminSubTab('users');">
          <div class="shortcut-icon-box" style="background: #fee2e2; color: #b91c1c;">⚙️</div>
          <div class="shortcut-info">
            <strong>Setting User</strong>
            <span>Manajemen akun & hak akses</span>
          </div>
        </div>
      </div>

      <!-- Antrean Penerbitan Nomor Surat -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-header-title">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
            <div>
              <h3>Antrean Penerbitan Nomor Resmi (Telah Disetujui Kobag TU)</h3>
              <div class="card-header-subtitle">Berkas siap diberi nomor dinas resmi dan diunggah pindaian tanda tangannya</div>
            </div>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="app-table">
              <thead>
                <tr>
                  <th>ID Draft</th>
                  <th>Klasifikasi Penugasan</th>
                  <th>Personil Pelaksana</th>
                  <th>Jadwal & Tujuan</th>
                  <th>Aksi Sekretariat</th>
                </tr>
              </thead>
              <tbody>
                ${pendingPenomoran.length === 0 ? `
                  <tr><td colspan="5" class="text-center py-4 text-muted">✅ Tidak ada antrean penomoran saat ini. Semua SPT telah diterbitkan.</td></tr>
                ` : pendingPenomoran.map(s => `
                  <tr>
                    <td><strong>${s.id}</strong></td>
                    <td><strong>${s.klasifikasiNama}</strong></td>
                    <td>${s.anggota.map(a => a.nama).join(", ")}</td>
                    <td>${ConflictChecker.formatRangeIndo(s.tglMulai, s.tglSelesai)} (${s.tujuanDaerah})</td>
                    <td>
                      <button class="btn btn-success btn-sm" onclick="App.openModalPenomoran('${s.id}')">
                        📝 Input Nomor & Upload TTD
                      </button>
                      <button class="btn btn-primary btn-sm" onclick="DocumentPrinter.previewSpt('${s.id}')">
                        🖨️ Pratinjau
                      </button>
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // 2. DASHBOARD DEDIKASI: USER (PEGAWAI / PEMOHON)
  renderDashboardUser(container) {
    const spts = AppStorage.getSpts();
    const myId = this.currentUser.id;
    const myName = this.currentUser.nama;

    // Filter SPT di mana pegawai ini bertindak sebagai pemohon ATAU anggota
    const mySpts = spts.filter(s => {
      const isPemohon = s.pemohon && (s.pemohon.id === myId || s.pemohon.nama === myName);
      const isAnggota = s.anggota && s.anggota.some(a => a.nama === myName || a.id === myId || a.nip === this.currentUser.nip);
      return isPemohon || isAnggota;
    });

    const countDiajukan = mySpts.filter(s => s.status === "diajukan" || s.status === "approved_ketimker" || s.status === "approved_kobag_tu").length;
    const countTerbit = mySpts.filter(s => s.status === "terbit").length;
    const countPerluLaporan = mySpts.filter(s => s.status === "terbit" && !s.fileLaporanName).length;

    // Cari penugasan aktif saat ini
    const activeAssignments = mySpts.filter(s => s.status === "terbit");

    container.innerHTML = `
      <div class="role-hero-banner banner-user">
        <div>
          <div class="role-hero-title">
            <span>👤 Selamat Datang, ${this.currentUser.nama}</span>
          </div>
          <div class="role-hero-desc">
            NIP. ${this.currentUser.nip} | ${this.currentUser.jabatan} (${this.currentUser.unitKerja}). 
            Pantau pengajuan SPT Anda, unduh berkas dinas resmi ter-TTD, dan jangan lupa mengunggah laporan hasil tugas setelah dinas selesai.
          </div>
        </div>
        <div>
          <button class="btn btn-warning btn-lg" onclick="App.navigateTo('pengajuan')">
            ⚡ + Buat Usulan SPT Baru
          </button>
        </div>
      </div>

      <!-- Metrik Pribadi Pegawai -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">📋</div>
          <div>
            <div class="stat-value">${mySpts.length}</div>
            <div class="stat-label">Total Penugasan Saya</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber">⏳</div>
          <div>
            <div class="stat-value">${countDiajukan}</div>
            <div class="stat-label">Proses Pengajuan Berjalan</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">📄</div>
          <div>
            <div class="stat-value">${countTerbit}</div>
            <div class="stat-label">SPT Sah / Siap Unduh</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">📤</div>
          <div>
            <div class="stat-value" style="color: ${countPerluLaporan > 0 ? '#dc2626' : '#15803d'};">${countPerluLaporan}</div>
            <div class="stat-label">Laporan Belum Diunggah</div>
          </div>
        </div>
      </div>

      ${countPerluLaporan > 0 ? `
        <div class="alert alert-warning mb-4" style="background:#fffbeb; border:1.5px solid #fde68a; border-left:5px solid #f59e0b; padding:14px 18px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:24px;">⚠️</span>
            <div>
              <div style="font-weight:700; color:#92400e; font-size:14px;">Pemberitahuan Kewajiban: Anda Memiliki ${countPerluLaporan} Penugasan yang Belum Diunggah Laporannya</div>
              <div style="font-size:12.5px; color:#b45309; margin-top:2px;">Sesuai ketentuan, pembuatan usulan SPT baru dan pengikutsertaan Anda dalam penugasan lain ditangguhkan sampai laporan hasil tugas diunggah.</div>
            </div>
          </div>
          <button class="btn btn-warning btn-sm" onclick="App.navigateTo('tracking')">
            📂 Buka Daftar Penugasan & Upload
          </button>
        </div>
      ` : ''}

      <!-- Status Penugasan Saya Saat Ini -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-header-title">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <div>
              <h3>Penugasan Kedinasan Saya yang Sedang Aktif / Terbit</h3>
              <div class="card-header-subtitle">Jadwal penugasan resmi BRMP DIY yang mengikat jadwal Anda</div>
            </div>
          </div>
        </div>
        <div class="card-body">
          ${activeAssignments.length === 0 ? `
            <p class="text-muted text-center py-3">Saat ini tidak ada penugasan luar aktif untuk jadwal Anda. Anda dapat mengajukan usulan SPT baru.</p>
          ` : activeAssignments.map(s => `
            <div class="mission-card">
              <div>
                <div class="mission-title">${s.klasifikasiNama} - ${s.nomorSpt}</div>
                <div class="mission-meta">
                  📅 <strong>${ConflictChecker.formatRangeIndo(s.tglMulai, s.tglSelesai)}</strong> | 
                  📍 <strong>${s.tujuanDaerah}</strong> (${s.tempatTujuan || '-'})
                </div>
                <div style="font-size: 12px; color: #334155; margin-top: 4px;">${s.untukMelaksanakan}</div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-success btn-sm" onclick="App.downloadSptTtd('${s.id}')">
                  📥 Unduh SPT TTD
                </button>
                <button class="btn btn-outline-primary btn-sm" onclick="App.openUploadLaporanModal('${s.id}')">
                  ${s.fileLaporanName ? '✅ Laporan Diunggah' : '📤 Upload Laporan'}
                </button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Tabel Seluruh Pengajuan SPT Saya -->
      <div class="card">
        <div class="card-header">
          <div class="card-header-title">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <div>
              <h3>Riwayat & Status Alur Pengajuan SPT Saya</h3>
            </div>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="app-table">
              <thead>
                <tr>
                  <th>Nomor SPT / ID</th>
                  <th>Klasifikasi</th>
                  <th>Jadwal Penugasan</th>
                  <th>Tujuan Daerah</th>
                  <th>Status Alur</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${mySpts.length === 0 ? `
                  <tr><td colspan="6" class="text-center py-4 text-muted">Belum ada usulan penugasan SPT atas nama Anda.</td></tr>
                ` : mySpts.map(spt => `
                  <tr>
                    <td><strong>${spt.nomorSpt || `Draft #${spt.id}`}</strong></td>
                    <td>${spt.klasifikasiNama}</td>
                    <td>${ConflictChecker.formatRangeIndo(spt.tglMulai, spt.tglSelesai)}</td>
                    <td>${spt.tujuanDaerah}</td>
                    <td>${this.getStatusBadge(spt.status)}</td>
                    <td>
                      <button class="btn btn-secondary btn-sm" onclick="App.viewSptDetail('${spt.id}')">Detail</button>
                      ${spt.status === 'terbit' ? `
                        <button class="btn btn-success btn-sm" onclick="App.downloadSptTtd('${spt.id}')">Unduh</button>
                      ` : ''}
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // 3. DASHBOARD DEDIKASI: KETIMKER (KETUA TIM KERJA)
  renderDashboardKetimker(container) {
    const spts = AppStorage.getSpts();
    // Hanya tampilkan usulan dari tim kerja yang dipimpin oleh Ketimker yang sedang login
    const pendingUnit = spts.filter(s => s.status === "diajukan" && this.isSptForKetimker(s, this.currentUser));
    const approvedByMe = spts.filter(s => (s.status === "approved_ketimker" || s.status === "approved_kobag_tu" || s.status === "terbit") && this.isSptForKetimker(s, this.currentUser));

    container.innerHTML = `
      <div class="role-hero-banner banner-ketimker">
        <div>
          <div class="role-hero-title">
            <span>🛡️ Dashboard Verifikasi Unit: ${this.currentUser.unitKerja}</span>
          </div>
          <div class="role-hero-desc">
            Ketua Tim Kerja: <strong>${this.currentUser.nama}</strong>. Bertanggung jawab memverifikasi usulan penugasan khusus anggota tim <strong>${this.currentUser.unitKerja}</strong> sebelum diteruskan ke Kepala Bagian TU.
          </div>
        </div>
        <div>
          <button class="btn btn-light text-dark fw-bold" onclick="App.navigateTo('approval-ketimker')">
            📥 Buka Kotak Masuk Approval (${pendingUnit.length})
          </button>
        </div>
      </div>

      <!-- Metrik Ketimker -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon amber">🔔</div>
          <div>
            <div class="stat-value" style="color: ${pendingUnit.length > 0 ? '#b45309' : '#15803d'};">${pendingUnit.length}</div>
            <div class="stat-label">Usulan Perlu Approval Unit</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">✅</div>
          <div>
            <div class="stat-value">${approvedByMe.length}</div>
            <div class="stat-label">Usulan Telah Diverifikasi</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">👥</div>
          <div>
            <div class="stat-value">Tim Kerja</div>
            <div class="stat-label" style="font-size: 11px;">${this.currentUser.unitKerja}</div>
          </div>
        </div>
      </div>

      <!-- Inbox Usulan Anggota Tim yang Siap Disetujui Langsung -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-header-title">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <div>
              <h3>Kotak Masuk Persetujuan Tim Kerja: ${this.currentUser.unitKerja}</h3>
              <div class="card-header-subtitle">Daftar usulan baru dari anggota ${this.currentUser.unitKerja} yang menunggu rekomendasi persetujuan Anda</div>
            </div>
          </div>
        </div>
        <div class="card-body">
          ${pendingUnit.length === 0 ? `
            <div class="p-4 text-center text-muted">
              ✅ Semua usulan anggota ${this.currentUser.unitKerja} telah Anda verifikasi. Tidak ada antrean baru.
            </div>
          ` : pendingUnit.map(spt => `
            <div class="card mb-3 p-3 bg-light border">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge badge-diajukan">Usulan Baru Masuk</span>
                  <span class="badge" style="background: #e0f2fe; color: #0369a1; font-size: 11px;">🏢 ${spt.pemohon?.unitKerja || spt.unitKerja}</span>
                </div>
                <span class="text-muted" style="font-size: 11.5px;">Diajukan: ${ConflictChecker.formatDateIndo(spt.tglPengajuan)}</span>
              </div>
              <h4 class="mb-1">${spt.klasifikasiNama}</h4>
              <div class="text-muted mb-2" style="font-size: 12.5px;">
                Pemohon: <strong>${spt.pemohon.nama}</strong> | Lokasi: <strong>${spt.tujuanDaerah}</strong>
              </div>
              <p style="background: #fff; padding: 10px; border-radius: 6px; font-size: 13px;">${spt.untukMelaksanakan}</p>
              
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div style="font-size: 12px;"><strong>Personil (${spt.anggota.length} Org):</strong> ${spt.anggota.map(a => a.nama).join(", ")}</div>
                <div class="d-flex gap-2">
                  <button class="btn btn-secondary btn-sm" onclick="DocumentPrinter.previewSpt('${spt.id}')">Pratinjau</button>
                  <button class="btn btn-danger btn-sm" onclick="App.processApprovalKetimker('${spt.id}', false)">Tolak</button>
                  <button class="btn btn-success btn-sm" onclick="App.processApprovalKetimker('${spt.id}', true)">✅ Setujui Unit</button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  // 4. DASHBOARD DEDIKASI: KOPOKS (KOORDINATOR POKSI / MONITORING)
  renderDashboardKopoks(container) {
    const spts = AppStorage.getSpts();
    const countTotal = spts.length;
    const countTerbit = spts.filter(s => s.status === "terbit").length;
    const countOnDuty = spts.filter(s => s.status === "terbit" || s.status === "berjalan").length;

    // Hitung sebaran wilayah penugasan
    const wilayahCounts = {
      "Kulon Progo": 0,
      "Sleman": 0,
      "Bantul": 0,
      "Gunungkidul": 0,
      "Yogyakarta (Kota)": 0,
      "Luar DIY / Nasional": 0
    };

    spts.forEach(s => {
      const tuj = (s.tujuanDaerah || "").toLowerCase();
      if (tuj.includes("kulon progo")) wilayahCounts["Kulon Progo"]++;
      else if (tuj.includes("sleman")) wilayahCounts["Sleman"]++;
      else if (tuj.includes("bantul")) wilayahCounts["Bantul"]++;
      else if (tuj.includes("gunung")) wilayahCounts["Gunungkidul"]++;
      else if (tuj.includes("kota") || tuj.includes("jogja")) wilayahCounts["Yogyakarta (Kota)"]++;
      else wilayahCounts["Luar DIY / Nasional"]++;
    });

    container.innerHTML = `
      <div class="role-hero-banner banner-kopoks">
        <div>
          <div class="role-hero-title">
            <span>📊 Pusat Monitoring Penugasan Lintas Poksi: ${this.currentUser.nama}</span>
          </div>
          <div class="role-hero-desc">
            Koordinator Poksi BRMP DIY. Memantau distribusi penugasan substantif di seluruh wilayah Daerah Istimewa Yogyakarta, efektivitas penugasan, dan keterisian jadwal personil.
          </div>
        </div>
        <div>
          <button class="btn btn-light text-dark fw-bold" onclick="App.navigateTo('monitoring-kopoks')">
            🔍 Buka Tabel Lengkap Monitoring
          </button>
        </div>
      </div>

      <!-- Metrik Makro Kopoks -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue">📍</div>
          <div>
            <div class="stat-value">${countTotal}</div>
            <div class="stat-label">Total Penugasan Terdata</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">🚜</div>
          <div>
            <div class="stat-value">${countOnDuty}</div>
            <div class="stat-label">SPT Berjalan di Lapangan</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">🗺️</div>
          <div>
            <div class="stat-value">5 Kab/Kota</div>
            <div class="stat-label">Cakupan Wilayah DIY</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber">🌾</div>
          <div>
            <div class="stat-value">${countTerbit} Selesai</div>
            <div class="stat-label">Penerapan Standar Tuntas</div>
          </div>
        </div>
      </div>

      <!-- Grafik Dinamis Sebaran Wilayah Penugasan -->
      <div class="chart-card-grid">
        <div class="card">
          <div class="card-header">
            <div class="card-header-title">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
              <div>
                <h3>Sebaran Wilayah Penugasan Kedinasan di DIY</h3>
                <div class="card-header-subtitle">Statistik frekuensi tugas lapangan berdasarkan kabupaten/kota tujuan</div>
              </div>
            </div>
          </div>
          <div class="card-body">
            ${Object.keys(wilayahCounts).map((w, idx) => {
              const val = wilayahCounts[w];
              const pct = countTotal > 0 ? Math.round((val / countTotal) * 100) : 0;
              const bgColors = ["bg-emerald", "bg-sky", "bg-amber", "bg-violet", "bg-rose", "bg-sky"];
              return `
                <div class="dynamic-bar-item">
                  <div class="dynamic-bar-labels">
                    <span>${w}</span>
                    <span>${val} Penugasan (${pct}%)</span>
                  </div>
                  <div class="dynamic-bar-track">
                    <div class="dynamic-bar-fill ${bgColors[idx % bgColors.length]}" style="width: ${Math.max(pct, 6)}%;"></div>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div class="card-header-title">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              <div>
                <h3>Ringkasan Kategori Tugas</h3>
                <div class="card-header-subtitle">Proporsi kluster kegiatan dinas</div>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="dynamic-bar-item">
              <div class="dynamic-bar-labels">
                <span>Pendampingan Lapangan & Alsintan</span>
                <span>45%</span>
              </div>
              <div class="dynamic-bar-track"><div class="dynamic-bar-fill bg-emerald" style="width: 45%;"></div></div>
            </div>
            <div class="dynamic-bar-item">
              <div class="dynamic-bar-labels">
                <span>Pengujian Lab & Pengambilan Sampel</span>
                <span>25%</span>
              </div>
              <div class="dynamic-bar-track"><div class="dynamic-bar-fill bg-sky" style="width: 25%;"></div></div>
            </div>
            <div class="dynamic-bar-item">
              <div class="dynamic-bar-labels">
                <span>Diseminasi Standar Instrumen</span>
                <span>20%</span>
              </div>
              <div class="dynamic-bar-track"><div class="dynamic-bar-fill bg-amber" style="width: 20%;"></div></div>
            </div>
            <div class="dynamic-bar-item">
              <div class="dynamic-bar-labels">
                <span>Koordinasi Kementerian & Lainnya</span>
                <span>10%</span>
              </div>
              <div class="dynamic-bar-track"><div class="dynamic-bar-fill bg-violet" style="width: 10%;"></div></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 5. DASHBOARD DEDIKASI: KOBAG TU (KEPALA BAGIAN TATA USAHA)
  renderDashboardKobagTu(container) {
    const spts = AppStorage.getSpts();
    const pendingKobag = spts.filter(s => s.status === "approved_ketimker");
    const countTotalApproved = spts.filter(s => s.status === "approved_kobag_tu" || s.status === "terbit").length;

    container.innerHTML = `
      <div class="role-hero-banner banner-kobag">
        <div>
          <div class="role-hero-title">
            <span>⚡ Dashboard Eksekutif: Kepala Bagian Tata Usaha</span>
          </div>
          <div class="role-hero-desc">
            Pejabat Penilai: <strong>${this.currentUser.nama}</strong>. Anda memegang kewenangan persetujuan utama sebelum penerbitan nomor surat resmi oleh Sekretariat.
          </div>
        </div>
        <div>
          <button class="btn btn-light text-dark fw-bold" onclick="App.navigateTo('approval-kobag')">
            ⚡ Eksekusi Approval Utama (${pendingKobag.length})
          </button>
        </div>
      </div>

      <!-- Metrik Kobag TU -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon purple">📋</div>
          <div>
            <div class="stat-value" style="color: ${pendingKobag.length > 0 ? '#7c3aed' : '#15803d'};">${pendingKobag.length}</div>
            <div class="stat-label">Menunggu Approval Utama</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">🏆</div>
          <div>
            <div class="stat-value">${countTotalApproved}</div>
            <div class="stat-label">Total Telah Disahkan Kobag</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue">📜</div>
          <div>
            <div class="stat-value">DIPA 2026</div>
            <div class="stat-label">Kepatuhan Anggaran Sah</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber">⏱️</div>
          <div>
            <div class="stat-value">&le; 60 Menit</div>
            <div class="stat-label">Standar Waktu Layanan (SLA)</div>
          </div>
        </div>
      </div>

      <!-- Antrean Persetujuan Utama Eksekutif -->
      <div class="card mb-4">
        <div class="card-header">
          <div class="card-header-title">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <div>
              <h3>Antrean Approval Utama Kepala Bagian Tata Usaha</h3>
              <div class="card-header-subtitle">Berkas yang telah lolos verifikasi Ketua Tim Kerja dan siap disahkan</div>
            </div>
          </div>
        </div>
        <div class="card-body">
          ${pendingKobag.length === 0 ? `
            <div class="p-4 text-center text-muted">
              ✅ Tidak ada berkas menunggu persetujuan utama. Seluruh usulan telah selesai ditelaah.
            </div>
          ` : pendingKobag.map(spt => `
            <div class="card mb-3 p-3 bg-light border">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge badge-approved-ketimker">Lolos Verifikasi Ketimker</span>
                <span class="text-muted" style="font-size: 11.5px;">Tgl Usulan: ${ConflictChecker.formatDateIndo(spt.tglPengajuan)}</span>
              </div>
              <h4>${spt.klasifikasiNama}</h4>
              <div class="text-muted mb-2" style="font-size: 12.5px;">
                Pemohon: <strong>${spt.pemohon.nama}</strong> (${spt.pemohon.unitKerja}) | 
                Tujuan: <strong>${spt.tujuanDaerah}</strong>
              </div>
              <div class="alert alert-info py-2 px-3 mb-2" style="font-size: 12px;">
                <strong>Catatan Telaah Ketimker:</strong> ${spt.catatanKetimker || '-'}
              </div>
              <p style="background: #fff; padding: 10px; border-radius: 6px; font-size: 13px;">${spt.untukMelaksanakan}</p>
              
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div style="font-size: 12px;"><strong>Personil (${spt.anggota.length} Org):</strong> ${spt.anggota.map(a => a.nama).join(", ")}</div>
                <div class="d-flex gap-2">
                  <button class="btn btn-secondary btn-sm" onclick="DocumentPrinter.previewSpt('${spt.id}')">👁️ Format SPT</button>
                  <button class="btn btn-danger btn-sm" onclick="App.processApprovalKobag('${spt.id}', false)">Kembalikan</button>
                  <button class="btn btn-primary btn-sm" onclick="App.processApprovalKobag('${spt.id}', true)">⚡ Setujui Terbitkan</button>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  // ==========================================
  // FORM PENGAJUAN SPT & REAL-TIME CONFLICT
  // ==========================================
  ensureApplicantInSelectedMembers() {
    const currentUser = this.currentUser || AppStorage.getCurrentUser();
    if (!currentUser) return;

    const allPegawai = AppStorage.getPegawai();
    const userPegawai = allPegawai.find(p => 
      (currentUser.nip && p.nip === currentUser.nip) || 
      p.id === currentUser.pegawaiId ||
      (currentUser.nama && p.nama.toLowerCase() === currentUser.nama.toLowerCase())
    );

    if (!userPegawai) return;

    // Filter keluar user pemohon jika ada di posisi lain agar tidak duplikat
    const otherMembers = (this.selectedMembers || []).filter(m => m.id !== userPegawai.id);

    // User pemohon SELALU di posisi pertama (index 0) sebagai Penanggung Jawab
    const applicantMember = {
      id: userPegawai.id,
      nama: userPegawai.nama,
      nip: userPegawai.nip,
      jabatan: userPegawai.jabatan,
      golongan: userPegawai.golongan,
      unitKerja: userPegawai.unitKerja,
      peranDalamTugas: "Penanggung Jawab",
      isApplicant: true
    };

    // Anggota lainnya tetap di posisi berikutnya sebagai Anggota Pelaksana
    const formattedOthers = otherMembers.map(m => ({
      ...m,
      peranDalamTugas: "Anggota Pelaksana",
      isApplicant: false
    }));

    this.selectedMembers = [applicantMember, ...formattedOthers];
  },

  renderFormPengajuan() {
    const spts = AppStorage.getSpts();
    const currentUser = this.currentUser || AppStorage.getCurrentUser();

    const selectKlas = document.getElementById("formKlasifikasi");
    if (selectKlas) {
      const klasList = AppStorage.getKlasifikasi();
      selectKlas.innerHTML = `<option value="">-- Pilih Klasifikasi Penugasan --</option>` +
        klasList.map(k => `<option value="${k.id}">${k.kode} - ${k.nama} (${k.kategori})</option>`).join("");
    }

    const tglMulaiInput = document.getElementById("formTglMulai");
    const tglSelesaiInput = document.getElementById("formTglSelesai");

    if (tglMulaiInput && !tglMulaiInput.value) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      tglMulaiInput.value = d.toISOString().split("T")[0];
    }
    if (tglSelesaiInput && !tglSelesaiInput.value) {
      const d2 = new Date();
      d2.setDate(d2.getDate() + 3);
      tglSelesaiInput.value = d2.toISOString().split("T")[0];
    }

    // CEK VALIDASI LAPORAN: Apakah user pemohon memiliki tanggungan laporan SPT terbit?
    const lockBanner = document.getElementById("unreportedLockBanner");
    const submitBtn = document.getElementById("btnSubmitPengajuan");
    const myUnreported = ConflictChecker.getUnreportedSptForUser(currentUser, spts);

    if (myUnreported && lockBanner) {
      lockBanner.style.display = "block";
      lockBanner.innerHTML = `
        <div class="unreported-alert-box">
          <div class="unreported-alert-icon">🚫</div>
          <div class="unreported-alert-body">
            <h4>Pengajuan Usulan SPT Baru Dinonaktifkan Sementara</h4>
            <p>
              Akun Anda (<strong>${currentUser.nama}</strong>) belum dapat mengajukan usulan SPT baru karena masih memiliki penugasan kedinasan yang <strong>belum mengunggah laporan hasil penugasan</strong>.
            </p>
            <div class="unreported-spt-card">
              <div class="unreported-spt-title">📄 SPT: ${myUnreported.nomorSpt}</div>
              <div class="unreported-spt-meta">
                📍 Tujuan: <strong>${myUnreported.tujuan}</strong> | 📅 Jadwal: <strong>${myUnreported.tglKegiatan}</strong><br>
                Uraian: <em>"${myUnreported.keperluan}"</em>
              </div>
            </div>
            <p style="margin-top: 6px; font-size: 12.5px;">
              Sesuai ketentuan SOP BRMP DIY, seluruh pelaksana penugasan wajib mengunggah laporan tertulis setelah pelaksanaan tugas dinas selesai. Silakan unggah berkas laporan penugasan sebelumnya untuk membuka hak pengajuan SPT baru.
            </p>
            <div style="margin-top: 10px;">
              <button type="button" class="btn btn-primary btn-sm" onclick="App.openUploadLaporanModal('${myUnreported.sptId}')">
                📤 Unggah Laporan Hasil Tugas Sekarang
              </button>
            </div>
          </div>
        </div>
      `;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("btn-disabled-lock");
        submitBtn.innerHTML = `🚫 Pengajuan Dinonaktifkan (Wajib Unggah Laporan Sebelumnya)`;
      }
    } else if (lockBanner) {
      lockBanner.style.display = "none";
      lockBanner.innerHTML = "";
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("btn-disabled-lock");
        submitBtn.innerHTML = `Kirim Pengajuan SPT`;
      }
    }

    // Pastikan akun user yang sedang mengajukan otomatis masuk di urutan pertama (PJ)
    this.ensureApplicantInSelectedMembers();

    this.renderMemberPicker();
    this.validateAndCheckConflicts();
  },

  renderMemberPicker() {
    const container = document.getElementById("memberPickerScroll");
    if (!container) return;

    const searchTerm = (document.getElementById("memberSearchInput")?.value || "").toLowerCase();
    const allPegawai = AppStorage.getPegawai();
    const tglMulai = document.getElementById("formTglMulai")?.value;
    const tglSelesai = document.getElementById("formTglSelesai")?.value;
    const spts = AppStorage.getSpts();

    const currentUser = this.currentUser || AppStorage.getCurrentUser();
    const userPegawai = allPegawai.find(p => 
      (currentUser && currentUser.nip && p.nip === currentUser.nip) || 
      (currentUser && p.id === currentUser.pegawaiId) ||
      (currentUser && currentUser.nama && p.nama.toLowerCase() === currentUser.nama.toLowerCase())
    );
    const applicantId = userPegawai ? userPegawai.id : null;

    const filtered = allPegawai.filter(p => {
      return p.nama.toLowerCase().includes(searchTerm) ||
             (p.nip && p.nip.includes(searchTerm)) ||
             p.unitKerja.toLowerCase().includes(searchTerm) ||
             p.jabatan.toLowerCase().includes(searchTerm);
    });

    container.innerHTML = filtered.map(pegawai => {
      const isApplicant = applicantId && pegawai.id === applicantId;
      const isSelected = isApplicant || this.selectedMembers.some(m => m.id === pegawai.id);
      
      // 1. Cek bentrok jadwal tanggal
      const conflict = ConflictChecker.getMemberConflictDetails(
        pegawai.id,
        tglMulai,
        tglSelesai,
        this.editingSptId,
        spts
      );

      // 2. Cek tanggungan laporan SPT yang belum diunggah
      const unreported = ConflictChecker.getUnreportedSptForUser(pegawai, spts);

      const conflictClass = conflict ? "is-conflict" : "";
      const unreportedClass = (unreported && !isApplicant) ? "is-blocked-laporan" : "";

      const conflictBadge = conflict 
        ? `<div class="badge badge-conflict mt-1">⚠️ JADWAL BENTROK: SPT ${conflict.nomorSpt} (${conflict.overlapRangeStr})</div>`
        : "";

      const unreportedBadge = unreported
        ? (isApplicant 
            ? `<div class="badge badge-unreported mt-1">🚫 Ada Tanggungan Laporan SPT: ${unreported.nomorSpt}</div>` 
            : `<div class="badge badge-unreported mt-1">🚫 DIBLOKIR: Belum Upload Laporan SPT (${unreported.nomorSpt})</div>`)
        : "";

      const applicantBadge = isApplicant 
        ? `<span class="badge" style="background: #15803d; color: #ffffff; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 12px; margin-left: 6px;">👑 Pemohon (Urutan ke-1 / PJ)</span>` 
        : "";

      const isDisabledCheckbox = isApplicant 
        ? true 
        : (Boolean(unreported) || (conflict && !isSelected));

      const checkboxTitle = isApplicant 
        ? "Pemohon SPT wajib tercantum di urutan ke-1" 
        : (unreported 
            ? `Pegawai ini tidak dapat ditugaskan karena belum mengunggah laporan hasil tugas pada SPT ${unreported.nomorSpt}` 
            : (conflict ? `Jadwal penugasan bentrok pada SPT ${conflict.nomorSpt}` : ""));

      return `
        <div class="member-card-item ${isSelected ? 'selected' : ''} ${isApplicant ? 'applicant-card-item' : ''} ${conflictClass} ${unreportedClass}" 
             onclick="App.toggleMemberSelection('${pegawai.id}')">
          <div class="member-left">
            <input type="checkbox" class="member-checkbox" 
                   ${isSelected ? 'checked' : ''} 
                   ${isDisabledCheckbox ? `disabled title="${checkboxTitle}"` : ''}
                   onclick="event.stopPropagation(); App.toggleMemberSelection('${pegawai.id}')">
            <div>
              <div class="member-name">
                ${pegawai.nama}
                ${applicantBadge}
              </div>
              <div class="member-meta">NIP. ${pegawai.nip || "-"} | Gol. ${pegawai.golongan || "-"} | ${pegawai.jabatan}</div>
              <div class="member-tag-unit">${pegawai.unitKerja}</div>
              ${conflictBadge}
              ${unreportedBadge}
            </div>
          </div>
        </div>
      `;
    }).join("");

    this.renderSelectedMembersBar();
  },

  renderSelectedMembersBar() {
    const bar = document.getElementById("selectedMembersBar");
    if (!bar) return;

    if (this.selectedMembers.length === 0) {
      bar.innerHTML = `<span class="text-muted" style="font-size: 12px; font-style: italic;">Belum ada anggota yang dipilih. Silakan centang pegawai di atas.</span>`;
      return;
    }

    bar.innerHTML = this.selectedMembers.map((m, idx) => {
      const isFirst = idx === 0;
      return `
        <div class="selected-member-pill ${isFirst ? 'selected-member-applicant' : ''}">
          <span>${isFirst ? '👑 [Urutan 1 - Pemohon / PJ] ' : `${idx + 1}. `}${m.nama}</span>
          ${isFirst 
            ? '<span title="Pemohon SPT (Wajib Pertama)" style="margin-left: 6px; font-size: 11px; opacity: 0.85;">🔒</span>' 
            : `<button type="button" class="remove-member-btn" onclick="App.toggleMemberSelection('${m.id}')" title="Hapus">&times;</button>`
          }
        </div>
      `;
    }).join("");
  },

  toggleMemberSelection(pegawaiId) {
    const allPegawai = AppStorage.getPegawai();
    const pegawai = allPegawai.find(p => p.id === pegawaiId);
    if (!pegawai) return;

    const currentUser = this.currentUser || AppStorage.getCurrentUser();
    const userPegawai = allPegawai.find(p => 
      (currentUser && currentUser.nip && p.nip === currentUser.nip) || 
      (currentUser && p.id === currentUser.pegawaiId) ||
      (currentUser && currentUser.nama && p.nama.toLowerCase() === currentUser.nama.toLowerCase())
    );

    // Jika pegawai adalah user yang sedang mengajukan: tidak boleh di-uncheck
    if (userPegawai && pegawai.id === userPegawai.id) {
      this.showToast(`Pegawai pemohon (${pegawai.nama}) otomatis tercantum sebagai urutan pertama (Penanggung Jawab SPT).`, "info");
      return;
    }

    const tglMulai = document.getElementById("formTglMulai")?.value;
    const tglSelesai = document.getElementById("formTglSelesai")?.value;
    const spts = AppStorage.getSpts();

    const existingIdx = this.selectedMembers.findIndex(m => m.id === pegawaiId);

    if (existingIdx >= 0) {
      this.selectedMembers.splice(existingIdx, 1);
    } else {
      // CEK TANGGUNGAN LAPORAN: Tidak boleh dimasukkan ke SPT lain oleh user lain jika belum setor laporan
      const unreported = ConflictChecker.getUnreportedSptForUser(pegawai, spts);
      if (unreported) {
        this.showToast(
          `Gagal memilih ${pegawai.nama}! Pegawai ini belum mengunggah laporan penugasan pada SPT ${unreported.nomorSpt} (${unreported.tujuan}) dan tidak dapat dimasukkan ke SPT baru.`,
          "error"
        );
        return;
      }

      const conflict = ConflictChecker.getMemberConflictDetails(
        pegawai.id,
        tglMulai,
        tglSelesai,
        this.editingSptId,
        spts
      );

      if (conflict) {
        this.showToast(
          `Gagal memilih ${pegawai.nama}! Pegawai ini memiliki jadwal penugasan aktif yang bentrok (${conflict.nomorSpt}: ${conflict.overlapRangeStr}).`,
          "error"
        );
        return;
      }

      this.selectedMembers.push({
        id: pegawai.id,
        nama: pegawai.nama,
        nip: pegawai.nip,
        jabatan: pegawai.jabatan,
        golongan: pegawai.golongan,
        unitKerja: pegawai.unitKerja,
        peranDalamTugas: "Anggota Pelaksana",
        isApplicant: false
      });
    }

    // Pastikan user pemohon selalu di urutan pertama (index 0)
    this.ensureApplicantInSelectedMembers();
    this.renderMemberPicker();
    this.validateAndCheckConflicts();
  },

  validateAndCheckConflicts() {
    const tglMulai = document.getElementById("formTglMulai")?.value;
    const tglSelesai = document.getElementById("formTglSelesai")?.value;
    const alertBox = document.getElementById("conflictAlertBox");
    const conflictListEl = document.getElementById("conflictListUl");
    const submitBtn = document.getElementById("btnSubmitPengajuan");

    if (!alertBox || !conflictListEl) return;

    const spts = AppStorage.getSpts();
    const currentUser = this.currentUser || AppStorage.getCurrentUser();
    const myUnreported = ConflictChecker.getUnreportedSptForUser(currentUser, spts);

    // Jika pemohon sendiri memiliki tanggungan laporan: blokir tombol kirim
    if (myUnreported) {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("btn-disabled-lock");
        submitBtn.innerHTML = `🚫 Pengajuan Dinonaktifkan (Wajib Unggah Laporan Sebelumnya)`;
      }
      return;
    }

    if (!tglMulai || !tglSelesai || this.selectedMembers.length === 0) {
      alertBox.classList.remove("show");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("btn-disabled-lock");
        submitBtn.innerHTML = `Kirim Pengajuan SPT`;
      }
      return;
    }

    if (new Date(tglSelesai) < new Date(tglMulai)) {
      alertBox.classList.add("show");
      conflictListEl.innerHTML = `<li><strong>Peringatan Tanggal:</strong> Tanggal selesai tidak boleh lebih awal dari tanggal mulai penugasan!</li>`;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("btn-disabled-lock");
        submitBtn.innerHTML = `⚠️ Tanggal Tidak Valid`;
      }
      return;
    }

    // Cek apakah ada anggota terpilih yang memiliki tanggungan laporan
    const unreportedMembers = [];
    for (const m of this.selectedMembers) {
      if (m.isApplicant) continue;
      const u = ConflictChecker.getUnreportedSptForUser(m, spts);
      if (u) {
        unreportedMembers.push({ member: m, unreported: u });
      }
    }

    if (unreportedMembers.length > 0) {
      alertBox.classList.add("show");
      conflictListEl.innerHTML = unreportedMembers.map(item => `
        <li style="color: #b91c1c;">
          <strong>TANGGUNGAN LAPORAN: ${item.member.nama} (NIP. ${item.member.nip || '-'})</strong> 
          belum mengunggah laporan hasil penugasan pada <strong>SPT ${item.unreported.nomorSpt}</strong> 
          (${item.unreported.tujuan}). Pegawai ini tidak dapat diikutsertakan ke dalam SPT baru.
        </li>
      `).join("");

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("btn-disabled-lock");
        submitBtn.innerHTML = `⚠️ Pengajuan Diblokir (Tanggungan Laporan Anggota)`;
      }
      return;
    }

    const memberIds = this.selectedMembers.map(m => m.id);

    const checkRes = ConflictChecker.checkConflicts(
      memberIds,
      tglMulai,
      tglSelesai,
      this.editingSptId,
      spts
    );

    if (checkRes.hasConflict) {
      alertBox.classList.add("show");
      conflictListEl.innerHTML = checkRes.conflicts.map(c => `
        <li>
          <strong>${c.memberNama} (NIP. ${c.memberNip})</strong> sudah memiliki penugasan pada 
          <strong>${c.nomorSpt}</strong> di <em>${c.tujuan}</em> 
          periode <strong>${c.overlapRangeStr}</strong>.
        </li>
      `).join("");

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("btn-disabled-lock");
        submitBtn.innerHTML = `⚠️ Pengajuan Diblokir (Bentrok Jadwal)`;
      }
    } else {
      alertBox.classList.remove("show");
      conflictListEl.innerHTML = "";
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("btn-disabled-lock");
        submitBtn.innerHTML = `Kirim Pengajuan SPT`;
      }
    }
  },

  bindFormEvents() {
    const tglMulai = document.getElementById("formTglMulai");
    const tglSelesai = document.getElementById("formTglSelesai");

    if (tglMulai) {
      tglMulai.addEventListener("change", () => {
        this.renderMemberPicker();
        this.validateAndCheckConflicts();
      });
    }

    if (tglSelesai) {
      tglSelesai.addEventListener("change", () => {
        this.renderMemberPicker();
        this.validateAndCheckConflicts();
      });
    }

    const memberSearch = document.getElementById("memberSearchInput");
    if (memberSearch) {
      memberSearch.addEventListener("input", () => {
        this.renderMemberPicker();
      });
    }

    const formPengajuan = document.getElementById("formPengajuanSpt");
    if (formPengajuan) {
      formPengajuan.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submitPengajuanSpt();
      });
    }
  },

  submitPengajuanSpt() {
    const klasifikasiId = document.getElementById("formKlasifikasi")?.value;
    const tglMulai = document.getElementById("formTglMulai")?.value;
    const tglSelesai = document.getElementById("formTglSelesai")?.value;
    const tujuanDaerah = document.getElementById("formTujuanDaerah")?.value;
    const tempatTujuan = document.getElementById("formTempatTujuan")?.value;
    const untukMelaksanakan = document.getElementById("formUntukMelaksanakan")?.value;

    if (!klasifikasiId) {
      this.showToast("Silakan pilih klasifikasi penugasan!", "error");
      return;
    }
    if (!tglMulai || !tglSelesai) {
      this.showToast("Silakan tentukan tanggal mulai dan selesai!", "error");
      return;
    }
    if (new Date(tglSelesai) < new Date(tglMulai)) {
      this.showToast("Tanggal selesai tidak boleh sebelum tanggal mulai!", "error");
      return;
    }
    if (this.selectedMembers.length === 0) {
      this.showToast("Silakan pilih minimal 1 orang personil pelaksana tugas!", "error");
      return;
    }
    if (!tujuanDaerah || !untukMelaksanakan) {
      this.showToast("Tujuan daerah dan uraian tugas wajib diisi!", "error");
      return;
    }

    const spts = AppStorage.getSpts();
    const currentUser = this.currentUser || AppStorage.getCurrentUser();

    // 1. Validasi Pemohon: Tidak boleh mengajukan SPT baru jika masih memiliki tanggungan laporan SPT
    const myUnreported = ConflictChecker.getUnreportedSptForUser(currentUser, spts);
    if (myUnreported) {
      alert(`PENGAJUAN DIBLOKIR:\n\nAkun Anda (${currentUser.nama}) belum dapat mengajukan usulan SPT baru karena masih memiliki penugasan kedinasan yang belum diunggah laporannya:\n- SPT: ${myUnreported.nomorSpt}\n- Tujuan: ${myUnreported.tujuan}\n- Jadwal: ${myUnreported.tglKegiatan}\n\nSesuai SOP BRMP DIY, silakan unggah laporan kegiatan penugasan sebelumnya terlebih dahulu.`);
      this.openUploadLaporanModal(myUnreported.sptId);
      return;
    }

    // 2. Validasi Anggota: Tidak boleh ada anggota yang memiliki tanggungan laporan belum diunggah
    for (const m of this.selectedMembers) {
      if (m.isApplicant) continue;
      const u = ConflictChecker.getUnreportedSptForUser(m, spts);
      if (u) {
        alert(`PENGAJUAN DITOLAK:\n\nAnggota ${m.nama} belum dapat diikutsertakan dalam penugasan baru karena masih memiliki tanggungan laporan hasil tugas untuk SPT ${u.nomorSpt} (${u.tujuan}).\n\nHarap hapus anggota ini dari daftar atau minta anggota tersebut mengunggah laporannya terlebih dahulu.`);
        return;
      }
    }

    const memberIds = this.selectedMembers.map(m => m.id);
    const conflictResult = ConflictChecker.checkConflicts(memberIds, tglMulai, tglSelesai, null, spts);

    if (conflictResult.hasConflict) {
      alert("PENGAJUAN DITOLAK:\nTerdeteksi bentrok jadwal penugasan pada anggota yang dipilih. Satu pegawai tidak boleh memiliki 2 SPT pada tanggal yang sama!");
      this.validateAndCheckConflicts();
      return;
    }

    const klasObj = AppStorage.getKlasifikasi().find(k => k.id === klasifikasiId);
    const newId = `SPT-${new Date().getFullYear()}-${String(spts.length + 1).padStart(3, "0")}`;
    const timestampNow = new Date().toISOString().replace("T", " ").substring(0, 16);

    // Pastikan user pemohon selalu di urutan pertama (PJ)
    this.ensureApplicantInSelectedMembers();

    const targetKetimker = this.findKetimkerForUnit(currentUser.unitKerja);

    const newSpt = {
      id: newId,
      nomorSpt: null,
      klasifikasiId: klasifikasiId,
      klasifikasiNama: klasObj ? klasObj.nama : "Penugasan Kedinasan",
      tglPengajuan: new Date().toISOString().split("T")[0],
      tglMulai: tglMulai,
      tglSelesai: tglSelesai,
      tujuanDaerah: tujuanDaerah,
      tempatTujuan: tempatTujuan,
      untukMelaksanakan: untukMelaksanakan,
      unitKerja: currentUser.unitKerja,
      targetKetimkerNip: targetKetimker ? targetKetimker.nip : null,
      targetKetimkerNama: targetKetimker ? targetKetimker.nama : null,
      pemohon: {
        id: currentUser.id,
        nama: currentUser.nama,
        nip: currentUser.nip,
        unitKerja: currentUser.unitKerja
      },
      anggota: [...this.selectedMembers],
      status: "diajukan",
      statusLabel: "Menunggu Approval Ketimker",
      fileSptTtdUrl: null,
      fileSptTtdName: null,
      fileLaporanUrl: null,
      fileLaporanName: null,
      timeline: [
        {
          waktu: timestampNow,
          aktor: currentUser.nama,
          aksi: `Pengajuan usulan SPT dibuat oleh ${currentUser.nama} (Menunggu persetujuan Ketimker: ${targetKetimker ? targetKetimker.nama : currentUser.unitKerja})`,
          status: "diajukan"
        }
      ],
      catatanKetimker: null,
      catatanKobagTu: null,
      tandaTanganPejabat: {
        nama: "Dr. Soeharsono, S.Pt, M.Si",
        nip: "197109271998031002",
        jabatan: "Kepala Balai Penerapan Standar Instrumen Pertanian DIY"
      }
    };

    AppStorage.saveSpt(newSpt);

    this.selectedMembers = [];
    document.getElementById("formPengajuanSpt")?.reset();
    this.ensureApplicantInSelectedMembers();
    this.showToast(`SPT Berhasil Diajukan dengan ID: ${newId}! Menunggu persetujuan Ketimker.`, "success");
    this.navigateTo("tracking");
  },

  // ==========================================
  // TRACKING PROSES & DOWNLOAD SPT TER-TTD
  // ==========================================
  renderTrackingList() {
    const tbody = document.getElementById("trackingTableBody");
    if (!tbody) return;

    const spts = AppStorage.getSpts();

    if (spts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada data pengajuan SPT yang terlacak.</td></tr>`;
      return;
    }

    tbody.innerHTML = spts.map(spt => {
      const statusBadge = this.getStatusBadge(spt.status);
      const anggotaList = spt.anggota.map(a => `${a.nama} (${a.peranDalamTugas || 'Pelaksana'})`).join("<br>");
      const nomorDisplay = spt.nomorSpt 
        ? `<div class="fw-bold text-success">${spt.nomorSpt}</div>` 
        : `<div class="text-muted font-italic">Draft #${spt.id}</div>`;

      const downloadBtn = spt.status === "terbit"
        ? `<button class="btn btn-success btn-sm" onclick="App.downloadSptTtd('${spt.id}')" title="Download SPT Ter-TTD">
             📥 Unduh SPT TTD
           </button>`
        : `<button class="btn btn-secondary btn-sm" disabled title="Menunggu pengesahan resmi">
             ⏳ Belum Terbit
           </button>`;

      const laporanBtn = (spt.status === "terbit" || spt.status === "approved_kobag_tu")
        ? `<button class="btn btn-outline-primary btn-sm" onclick="App.openUploadLaporanModal('${spt.id}')">
             ${spt.fileLaporanName ? '📄 Laporan Terunggah' : '📤 Upload Laporan'}
           </button>`
        : `<span class="text-muted" style="font-size: 11px;">-</span>`;

      return `
        <tr>
          <td>${nomorDisplay}</td>
          <td>
            <div class="fw-bold">${spt.klasifikasiNama}</div>
            <div class="text-muted" style="font-size: 11px;">Tujuan: ${spt.tujuanDaerah}</div>
          </td>
          <td><div style="font-size: 12px;">${anggotaList}</div></td>
          <td>
            <div>${ConflictChecker.formatRangeIndo(spt.tglMulai, spt.tglSelesai)}</div>
          </td>
          <td>${statusBadge}</td>
          <td>
            <div class="action-buttons-group">
              <button class="btn btn-secondary btn-sm" onclick="App.viewSptDetail('${spt.id}')">Tracking</button>
              <button class="btn btn-primary btn-sm" onclick="DocumentPrinter.previewSpt('${spt.id}')">Pratinjau</button>
              ${downloadBtn}
              ${laporanBtn}
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  // ==========================================
  // APPROVAL KETIMKER (APPROVAL UNIT)
  // ==========================================
  renderApprovalKetimker() {
    const container = document.getElementById("ketimkerPendingList");
    if (!container) return;

    // Filter usulan: prioritaskan usulan unit kerja Ketimker, atau tampilkan semua usulan jika admin/testing
    const allPending = AppStorage.getSpts().filter(s => s.status === "diajukan");
    const myUnitPending = this.currentUser ? allPending.filter(s => this.isSptForKetimker(s, this.currentUser)) : [];
    const spts = (myUnitPending.length > 0) ? myUnitPending : allPending;

    if (spts.length === 0) {
      container.innerHTML = `
        <div class="card p-4 text-center text-muted">
          <h4>✅ Tidak ada pengajuan baru yang menunggu persetujuan Ketimker.</h4>
          <p style="font-size: 13px;">Semua usulan SPT yang diajukan telah diverifikasi.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = spts.map(spt => `
      <div class="card mb-3" style="border-left: 5px solid #0284c7;">
        <div class="card-header bg-white">
          <div>
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge badge-diajukan">Menunggu Verifikasi Ketimker</span>
              <span class="badge" style="background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 10px;">🏢 ${spt.pemohon.unitKerja}</span>
            </div>
            <h4 class="mt-1">${spt.klasifikasiNama}</h4>
            <div class="text-muted" style="font-size: 12px;">Pemohon: <strong>${spt.pemohon.nama}</strong> (${spt.pemohon.unitKerja})</div>
          </div>
          <div>
            <span class="text-muted" style="font-size: 12px;">Diajukan: ${ConflictChecker.formatDateIndo(spt.tglPengajuan)}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="form-row-2 mb-3">
            <div>
              <div class="text-muted font-weight-bold" style="font-size: 11px;">JADWAL PENUGASAN:</div>
              <div class="fw-bold">${ConflictChecker.formatRangeIndo(spt.tglMulai, spt.tglSelesai)}</div>
            </div>
            <div>
              <div class="text-muted font-weight-bold" style="font-size: 11px;">TUJUAN DAERAH / INSTANSI:</div>
              <div>${spt.tujuanDaerah} ${spt.tempatTujuan ? `(${spt.tempatTujuan})` : ''}</div>
            </div>
          </div>

          <div class="mb-3">
            <div class="text-muted font-weight-bold" style="font-size: 11px;">URAIAN TUGAS:</div>
            <p style="background: #f8fafc; padding: 10px; border-radius: 6px; font-size: 13px;">${spt.untukMelaksanakan}</p>
          </div>

          <div class="mb-3">
            <div class="text-muted font-weight-bold" style="font-size: 11px;">DAFTAR PERSONIL:</div>
            <ul style="padding-left: 20px; font-size: 12.5px;">
              ${spt.anggota.map(a => `<li><strong>${a.nama}</strong> - ${a.jabatan} (Peran: <em>${a.peranDalamTugas || 'Pelaksana'}</em>)</li>`).join("")}
            </ul>
          </div>

          <div class="form-group mb-3">
            <label class="form-label">Catatan Telaah Ketimker (Opsional):</label>
            <input type="text" class="form-control" id="catatanKetimker_${spt.id}" placeholder="Contoh: Disetujui untuk koordinasi BPP setempat.">
          </div>

          <div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-danger btn-sm" onclick="App.processApprovalKetimker('${spt.id}', false)">
              ❌ Tolak Pengajuan
            </button>
            <button class="btn btn-secondary btn-sm" onclick="DocumentPrinter.previewSpt('${spt.id}')">
              👁️ Lihat Format SPT
            </button>
            <button class="btn btn-success" onclick="App.processApprovalKetimker('${spt.id}', true)">
              ✅ Setujui (Approval Unit)
            </button>
          </div>
        </div>
      </div>
    `).join("");
  },

  processApprovalKetimker(sptId, isApproved) {
    const spt = AppStorage.getSptById(sptId);
    if (!spt) return;

    const currentUser = this.currentUser || AppStorage.getCurrentUser();
    const catatanInput = document.getElementById(`catatanKetimker_${sptId}`);
    const catatan = catatanInput ? catatanInput.value.trim() : "";
    const timestampNow = new Date().toISOString().replace("T", " ").substring(0, 16);

    if (isApproved) {
      spt.status = "approved_ketimker";
      spt.statusLabel = "Disetujui Ketimker (Menunggu Kobag TU)";
      spt.catatanKetimker = catatan || "Disetujui tanpa catatan khusus.";
      spt.timeline.push({
        waktu: timestampNow,
        aktor: currentUser.nama,
        aksi: `Disetujui Ketua Tim Kerja (Approval Unit). Catatan: "${spt.catatanKetimker}"`,
        status: "approved_ketimker"
      });
      this.showToast(`SPT #${sptId} berhasil disetujui! Diteruskan ke Kobag TU.`, "success");
    } else {
      let reason = catatan;
      if (!reason) {
        if (catatanInput) {
          catatanInput.focus();
          catatanInput.style.borderColor = "#ef4444";
        }
        const confirmReject = confirm("Catatan telaah masih kosong. Apakah Anda yakin ingin menolak pengajuan ini?");
        if (!confirmReject) return;
        reason = "Ditolak oleh Ketua Tim Kerja (Perlu revisi atau penyesuaian usulan).";
      }

      spt.status = "ditolak";
      spt.statusLabel = "Ditolak oleh Ketimker";
      spt.catatanKetimker = reason;
      spt.timeline.push({
        waktu: timestampNow,
        aktor: currentUser.nama,
        aksi: `Ditolak oleh Ketimker. Alasan: "${reason}"`,
        status: "ditolak"
      });
      this.showToast(`SPT #${sptId} telah ditolak dan dikembalikan ke pemohon.`, "warning");
    }

    AppStorage.saveSpt(spt);
    this.renderCurrentView();
    this.buildDynamicSidebar();
  },

  // ==========================================
  // APPROVAL KOBAG TU (APPROVAL UTAMA)
  // ==========================================
  renderApprovalKobag() {
    const container = document.getElementById("kobagPendingList");
    if (!container) return;

    const spts = AppStorage.getSpts().filter(s => s.status === "approved_ketimker");

    if (spts.length === 0) {
      container.innerHTML = `
        <div class="card p-4 text-center text-muted">
          <h4>✅ Tidak ada berkas menunggu Approval Utama Kobag TU.</h4>
          <p style="font-size: 13px;">Seluruh pengajuan yang telah disetujui Ketimker telah diproses.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = spts.map(spt => `
      <div class="card mb-3" style="border-left: 5px solid #7c3aed;">
        <div class="card-header bg-white">
          <div>
            <div class="badge badge-approved-ketimker">Telah Diverifikasi Unit Kerja</div>
            <h4 class="mt-1">${spt.klasifikasiNama}</h4>
            <div class="text-muted" style="font-size: 12px;">Pemohon: <strong>${spt.pemohon.nama}</strong> | Unit: ${spt.pemohon.unitKerja}</div>
          </div>
          <div>
            <span class="badge badge-approved-kobag">Tahap Approval Utama</span>
          </div>
        </div>
        <div class="card-body">
          <div class="alert alert-info py-2 px-3 mb-3" style="background: #e0f2fe; border-left: 4px solid #0284c7; font-size: 12.5px;">
            <strong>Catatan Telaah Ketimker:</strong> ${spt.catatanKetimker || '-'}
          </div>

          <div class="form-row-2 mb-3">
            <div>
              <div class="text-muted font-weight-bold" style="font-size: 11px;">JADWAL PENUGASAN:</div>
              <div class="fw-bold">${ConflictChecker.formatRangeIndo(spt.tglMulai, spt.tglSelesai)}</div>
            </div>
            <div>
              <div class="text-muted font-weight-bold" style="font-size: 11px;">LOKASI KEDINASAN:</div>
              <div>${spt.tujuanDaerah} ${spt.tempatTujuan ? `(${spt.tempatTujuan})` : ''}</div>
            </div>
          </div>

          <div class="mb-3">
            <div class="text-muted font-weight-bold" style="font-size: 11px;">URAIAN TUGAS RESMI:</div>
            <p style="background: #f8fafc; padding: 10px; border-radius: 6px; font-size: 13px;">${spt.untukMelaksanakan}</p>
          </div>

          <div class="mb-3">
            <div class="text-muted font-weight-bold" style="font-size: 11px;">SUSUNAN TIM (${spt.anggota.length} Orang):</div>
            <div class="d-flex flex-wrap gap-2 mt-1">
              ${spt.anggota.map(a => `<span class="badge bg-light text-dark border p-2">${a.nama} (${a.jabatan})</span>`).join("")}
            </div>
          </div>

          <div class="form-group mb-3">
            <label class="form-label">Catatan Kebijakan Kobag TU (Persetujuan / Alasan Pengembalian):</label>
            <input type="text" class="form-control" id="catatanKobag_${spt.id}" placeholder="Ketik alasan penolakan jika ditolak, atau catatan kebijakan jika disetujui...">
          </div>

          <div class="d-flex gap-2 justify-content-end">
            <button class="btn btn-secondary btn-sm" onclick="DocumentPrinter.previewSpt('${spt.id}')">
              👁️ Pratinjau Dokumen
            </button>
            <button class="btn btn-danger btn-sm" onclick="App.processApprovalKobag('${spt.id}', false)">
              Kembalikan / Tolak
            </button>
            <button class="btn btn-primary" onclick="App.processApprovalKobag('${spt.id}', true)">
              ⚡ Beri Approval Utama (Lanjut ke Sekretariat)
            </button>
          </div>
        </div>
      </div>
    `).join("");
  },

  processApprovalKobag(sptId, isApproved) {
    const spt = AppStorage.getSptById(sptId);
    if (!spt) return;

    const currentUser = this.currentUser || AppStorage.getCurrentUser();
    const catatanInput = document.getElementById(`catatanKobag_${sptId}`);
    const catatan = catatanInput ? catatanInput.value.trim() : "";
    const timestampNow = new Date().toISOString().replace("T", " ").substring(0, 16);

    if (isApproved) {
      spt.status = "approved_kobag_tu";
      spt.statusLabel = "Disetujui Kobag TU (Menunggu Penomoran)";
      spt.catatanKobagTu = catatan || "Disetujui untuk penerbitan nomor surat dinas.";
      spt.timeline.push({
        waktu: timestampNow,
        aktor: currentUser.nama,
        aksi: `Disetujui Kobag TU (Approval Utama). Catatan: "${spt.catatanKobagTu}"`,
        status: "approved_kobag_tu"
      });
      this.showToast(`Approval Utama diberikan untuk SPT #${sptId}! Siap diberi nomor dinas.`, "success");
    } else {
      let reason = catatan;
      if (!reason) {
        if (catatanInput) {
          catatanInput.focus();
          catatanInput.style.borderColor = "#ef4444";
        }
        const confirmReject = confirm("Catatan kebijakan / alasan penolakan masih kosong. Apakah Anda yakin ingin menolak / mengembalikan usulan SPT ini?");
        if (!confirmReject) return;
        reason = "Dikembalikan oleh Kobag TU untuk perbaikan dan penyesuaian usulan tugas kedinasan.";
      }

      spt.status = "ditolak";
      spt.statusLabel = "Ditolak oleh Kobag TU";
      spt.catatanKobagTu = reason;
      spt.timeline.push({
        waktu: timestampNow,
        aktor: currentUser.nama,
        aksi: `Ditolak oleh Kobag TU. Alasan: "${reason}"`,
        status: "ditolak"
      });
      this.showToast(`SPT #${sptId} berhasil dikembalikan / ditolak ke pemohon.`, "warning");
    }

    AppStorage.saveSpt(spt);
    this.renderCurrentView();
    this.buildDynamicSidebar();
  },

  // ==========================================
  // MONITORING KOPOKS (SUBSTANSI & PENUGASAN)
  // ==========================================
  renderMonitoringKopoks() {
    const tbody = document.getElementById("monitoringTableBody");
    if (!tbody) return;

    const filterStatus = document.getElementById("filterMonStatus")?.value || "all";
    const filterBulan = document.getElementById("filterMonBulan")?.value || "all";
    let spts = AppStorage.getSpts();

    if (filterStatus !== "all") {
      spts = spts.filter(s => s.status === filterStatus);
    }
    if (filterBulan !== "all") {
      spts = spts.filter(s => s.tglMulai && s.tglMulai.startsWith(filterBulan));
    }

    if (spts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Tidak ada data penugasan sesuai filter pemantauan.</td></tr>`;
      return;
    }

    tbody.innerHTML = spts.map(spt => {
      const statusBadge = this.getStatusBadge(spt.status);
      const personilBadges = spt.anggota.map(a => `<span class="badge bg-white text-dark border me-1">${a.nama}</span>`).join(" ");

      return `
        <tr>
          <td><span class="table-spt-number">${spt.nomorSpt || `Draft #${spt.id}`}</span></td>
          <td>
            <strong>${spt.klasifikasiNama}</strong>
            <div class="text-muted" style="font-size: 11px;">Maksud: ${spt.untukMelaksanakan.substring(0, 60)}...</div>
          </td>
          <td>${personilBadges}</td>
          <td>${ConflictChecker.formatRangeIndo(spt.tglMulai, spt.tglSelesai)}</td>
          <td>${spt.tujuanDaerah}</td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="App.viewSptDetail('${spt.id}')">Monitoring</button>
            <button class="btn btn-primary btn-sm" onclick="DocumentPrinter.previewSpt('${spt.id}')">Cetak</button>
          </td>
        </tr>
      `;
    }).join("");
  },

  // ==========================================
  // ADMIN SEKRETARIAT (5 FITUR UTAMA)
  // ==========================================
  renderAdminSekretariat() {
    this.renderAdminTabPenerbitan();
    this.renderAdminTabMenimbang();
    this.renderAdminTabDasar();
    this.renderAdminTabDatabasePegawai();
    this.renderAdminTabSettingUser();
  },

  renderAdminTabPenerbitan() {
    const tbody = document.getElementById("adminPenerbitanTableBody");
    if (!tbody) return;

    const spts = AppStorage.getSpts();
    tbody.innerHTML = spts.map(spt => {
      const statusBadge = this.getStatusBadge(spt.status);
      const canPublish = spt.status === "approved_kobag_tu" || spt.status === "terbit";

      return `
        <tr>
          <td>
            <strong>${spt.id}</strong>
            <div class="text-success font-monospace" style="font-size: 11.5px;">${spt.nomorSpt || '(Belum ada nomor resmi)'}</div>
          </td>
          <td>
            <div class="fw-bold">${spt.klasifikasiNama}</div>
            <div class="text-muted" style="font-size: 11.5px;">Tujuan: ${spt.tujuanDaerah}</div>
          </td>
          <td>${ConflictChecker.formatRangeIndo(spt.tglMulai, spt.tglSelesai)}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="action-buttons-group">
              ${canPublish ? `
                <button class="btn btn-success btn-sm" onclick="App.openModalPenomoran('${spt.id}')">
                  📝 Input Nomor & Upload TTD
                </button>
              ` : `<span class="text-muted" style="font-size: 11.5px;">Menunggu approval Kobag TU</span>`}
              <button class="btn btn-primary btn-sm" onclick="DocumentPrinter.printSpt('${spt.id}')">
                🖨️ Print Out
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  openModalPenomoran(sptId) {
    const spt = AppStorage.getSptById(sptId);
    if (!spt) return;

    const modal = document.getElementById("modalPenomoranSpt");
    const idInput = document.getElementById("penomoranSptId");
    const noInput = document.getElementById("penomoranNomorSpt");
    const currentFileLabel = document.getElementById("penomoranCurrentFileLabel");

    if (idInput) idInput.value = spt.id;
    if (noInput) {
      noInput.value = spt.nomorSpt || `B-${Math.floor(100 + Math.random() * 900)}/KP.320/H.14.7/${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
    }
    if (currentFileLabel) {
      currentFileLabel.textContent = spt.fileSptTtdName || "Belum ada file ter-ttd yang diunggah.";
    }

    if (modal) {
      modal.classList.add("show");
      modal.style.display = "flex";
    }
  },

  submitPenomoranDanUpload() {
    const sptId = document.getElementById("penomoranSptId")?.value;
    const nomorSpt = document.getElementById("penomoranNomorSpt")?.value;
    const fileInput = document.getElementById("penomoranFileInput");

    if (!sptId || !nomorSpt) {
      this.showToast("Nomor SPT resmi wajib diisi!", "error");
      return;
    }

    const spt = AppStorage.getSptById(sptId);
    if (!spt) return;

    const currentUser = this.currentUser || AppStorage.getCurrentUser();
    const timestampNow = new Date().toISOString().replace("T", " ").substring(0, 16);

    spt.nomorSpt = nomorSpt;
    spt.status = "terbit";
    spt.statusLabel = "SPT Terbit / Sah";

    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("Peringatan: Ukuran file melebihi batas 2MB!");
        return;
      }
      spt.fileSptTtdName = file.name;
      spt.fileSptTtdUrl = URL.createObjectURL(file);
    } else if (!spt.fileSptTtdName) {
      spt.fileSptTtdName = `SPT_Resmi_${nomorSpt.replace(/\//g, "-")}_ttd.pdf`;
    }

    spt.timeline.push({
      waktu: timestampNow,
      aktor: currentUser.nama,
      aksi: `Nomor resmi ${nomorSpt} diterbitkan dan berkas ter-ttd disahkan oleh Admin Sekretariat`,
      status: "terbit"
    });

    AppStorage.saveSpt(spt);
    this.closeModal("modalPenomoranSpt");
    this.showToast(`SPT resmi berhasil diterbitkan dengan nomor: ${nomorSpt}!`, "success");
    this.renderCurrentView();
    this.buildDynamicSidebar();
  },

  renderAdminTabMenimbang() {
    const container = document.getElementById("menimbangListContainer");
    if (!container) return;

    const list = AppStorage.getMenimbang();
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    container.innerHTML = list.map((item, idx) => `
      <div class="d-flex align-items-start gap-2 mb-2">
        <span class="fw-bold mt-2" style="width: 25px;">${alphabet[idx] || (idx + 1)}.</span>
        <textarea class="form-control" rows="2" id="menimbangItem_${idx}">${item}</textarea>
        <button class="btn btn-danger btn-sm mt-1" onclick="App.deleteMenimbangItem(${idx})" title="Hapus Butir">&times;</button>
      </div>
    `).join("");
  },

  addMenimbangItem() {
    const list = AppStorage.getMenimbang();
    list.push("bahwa ...");
    AppStorage.saveMenimbang(list);
    this.renderAdminTabMenimbang();
  },

  deleteMenimbangItem(idx) {
    let list = AppStorage.getMenimbang();
    list.splice(idx, 1);
    AppStorage.saveMenimbang(list);
    this.renderAdminTabMenimbang();
    this.showToast("Butir konsiderans menimbang dihapus.", "info");
  },

  saveAllMenimbang() {
    const list = AppStorage.getMenimbang();
    const updated = [];
    list.forEach((_, idx) => {
      const el = document.getElementById(`menimbangItem_${idx}`);
      if (el && el.value.trim()) {
        updated.push(el.value.trim());
      }
    });

    AppStorage.saveMenimbang(updated);
    this.showToast("Konsiderans Menimbang berhasil disimpan!", "success");
    this.renderAdminTabMenimbang();
  },

  renderAdminTabDasar() {
    const container = document.getElementById("dasarListContainer");
    if (!container) return;

    const list = AppStorage.getDasar();

    container.innerHTML = list.map((item, idx) => `
      <div class="d-flex align-items-start gap-2 mb-2">
        <span class="fw-bold mt-2" style="width: 25px;">${idx + 1}.</span>
        <textarea class="form-control" rows="2" id="dasarItem_${idx}">${item}</textarea>
        <button class="btn btn-danger btn-sm mt-1" onclick="App.deleteDasarItem(${idx})" title="Hapus Dasar">&times;</button>
      </div>
    `).join("");
  },

  addDasarItem() {
    const list = AppStorage.getDasar();
    list.push("Peraturan ...");
    AppStorage.saveDasar(list);
    this.renderAdminTabDasar();
  },

  deleteDasarItem(idx) {
    let list = AppStorage.getDasar();
    list.splice(idx, 1);
    AppStorage.saveDasar(list);
    this.renderAdminTabDasar();
    this.showToast("Butir landasan dasar hukum dihapus.", "info");
  },

  saveAllDasar() {
    const list = AppStorage.getDasar();
    const updated = [];
    list.forEach((_, idx) => {
      const el = document.getElementById(`dasarItem_${idx}`);
      if (el && el.value.trim()) {
        updated.push(el.value.trim());
      }
    });

    AppStorage.saveDasar(updated);
    this.showToast("Landasan hukum Dasar berhasil disimpan!", "success");
    this.renderAdminTabDasar();
  },

  renderAdminTabDatabasePegawai() {
    const tbody = document.getElementById("adminPegawaiTableBody");
    if (!tbody) return;

    const searchPeg = (document.getElementById("adminSearchPegawaiInput")?.value || "").toLowerCase();
    const allPegawai = AppStorage.getPegawai();

    const filtered = allPegawai.filter(p => {
      return p.nama.toLowerCase().includes(searchPeg) ||
             (p.nip && p.nip.includes(searchPeg)) ||
             p.unitKerja.toLowerCase().includes(searchPeg);
    });

    const badgeEl = document.getElementById("adminTotalPegawaiBadge");
    if (badgeEl) badgeEl.textContent = `${allPegawai.length} Pegawai`;

    tbody.innerHTML = filtered.slice(0, 30).map(p => `
      <tr>
        <td><strong>${p.nama}</strong></td>
        <td><code>${p.nip || '-'}</code></td>
        <td>${p.golongan || '-'}</td>
        <td>${p.jabatan}</td>
        <td><span class="member-tag-unit">${p.unitKerja}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="App.openEditPegawaiModal('${p.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="App.deletePegawaiRecord('${p.id}')">&times;</button>
        </td>
      </tr>
    `).join("");
  },

  openEditPegawaiModal(id) {
    const peg = AppStorage.getPegawai().find(p => p.id === id);
    if (!peg) return;

    const name = prompt("Edit Nama Pegawai:", peg.nama);
    if (name === null) return;
    const nip = prompt("Edit NIP Pegawai:", peg.nip || "");
    const jab = prompt("Edit Jabatan:", peg.jabatan);

    AppStorage.updatePegawai(id, {
      nama: name.trim(),
      nip: nip ? nip.trim() : "",
      jabatan: jab ? jab.trim() : peg.jabatan
    });

    this.showToast("Data pegawai berhasil diperbarui.", "success");
    this.renderAdminTabDatabasePegawai();
  },

  deletePegawaiRecord(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data personil ini dari database BRMP?")) {
      AppStorage.deletePegawai(id);
      this.showToast("Pegawai dihapus dari database.", "info");
      this.renderAdminTabDatabasePegawai();
    }
  },

  openAddPegawaiModal() {
    const nama = prompt("Nama Lengkap Pegawai & Gelar:");
    if (!nama) return;
    const nip = prompt("NIP Pegawai (18 digit):") || "";
    const jabatan = prompt("Jabatan Kedinasan:") || "Pelaksana Teknis";
    const unit = prompt("Unit Kerja / Tim Kerja:") || "Tim Kerja Tata Usaha dan Rumah Tangga";
    const golongan = prompt("Pangkat / Golongan (contoh: III/a):") || "III/a";

    const newPeg = {
      id: `PEG-${Date.now()}`,
      nama: nama.trim(),
      nip: nip.trim(),
      jabatan: jabatan.trim(),
      golongan: golongan.trim(),
      unitKerja: unit.trim(),
      email: `${nama.toLowerCase().replace(/[^a-z]/g, "")}@pertanian.go.id`,
      roleDefault: "user"
    };

    AppStorage.addPegawai(newPeg);
    this.showToast("Pegawai baru berhasil ditambahkan!", "success");
    this.renderAdminTabDatabasePegawai();
  },

  renderAdminTabSettingUser() {
    const tbody = document.getElementById("adminUsersTableBody");
    if (!tbody) return;

    const users = AppStorage.getUsers();
    tbody.innerHTML = users.map(u => `
      <tr>
        <td><strong>${u.username}</strong></td>
        <td>${u.nama}</td>
        <td><code>${u.nip}</code></td>
        <td><span class="badge bg-primary text-white">${u.roleLabel}</span></td>
        <td>${u.unitKerja}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="App.changeUserRoleDialog('${u.id}')">
            Ubah Peran (Role)
          </button>
        </td>
      </tr>
    `).join("");
  },

  changeUserRoleDialog(userId) {
    const users = AppStorage.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const roles = [
      { key: "admin_sekretariat", label: "Admin Sekretariat" },
      { key: "user", label: "User (Pemohon/Pegawai)" },
      { key: "ketimker", label: "Ketimker (Ketua Tim Kerja)" },
      { key: "kopoks", label: "Kopoks (Koordinator Poksi)" },
      { key: "kobag_tu", label: "Kobag TU (Approval Utama)" }
    ];

    const currentRoleIdx = roles.findIndex(r => r.key === user.role);
    const optionsText = roles.map((r, i) => `${i + 1}. ${r.label}`).join("\n");
    const choice = prompt(`Pilih Role Baru untuk ${user.nama}:\n${optionsText}\n\nMasukkan nomor (1-5):`, currentRoleIdx + 1);

    if (choice) {
      const idx = parseInt(choice, 10) - 1;
      if (roles[idx]) {
        user.role = roles[idx].key;
        user.roleLabel = roles[idx].label;
        AppStorage.saveUsers(users);
        this.showToast(`Role pengguna berhasil diubah menjadi: ${user.roleLabel}`, "success");
        this.renderAdminTabSettingUser();
      }
    }
  },

  // ==========================================
  // SOP VIEW GENERATION
  // ==========================================
  renderSopView() {
    const stepsContainer = document.getElementById("sopStepsContainer");
    if (stepsContainer) {
      stepsContainer.innerHTML = DATA_SOP_SPT.tahapanAlur.map(s => `
        <div class="sop-step-card">
          <div class="sop-step-header">
            <div class="sop-step-num">${s.step}</div>
            <span class="sop-sla-badge">⏱️ SLA: ${s.sla}</span>
          </div>
          <div class="sop-step-title">${s.tahap}</div>
          <div class="sop-step-role">Pelaksana: ${s.pelaksana}</div>
          <p class="sop-step-desc">${s.uraian}</p>
          <div class="mt-2 text-muted" style="font-size: 11.5px;"><strong>Output:</strong> ${s.output}</div>
        </div>
      `).join("");
    }

    const raciContainer = document.getElementById("sopRaciTableBody");
    if (raciContainer) {
      raciContainer.innerHTML = DATA_SOP_SPT.matriksRaci.map(r => `
        <tr>
          <td><strong>${r.aktivitas}</strong></td>
          <td class="text-center"><code>${r.user}</code></td>
          <td class="text-center"><code>${r.ketimker}</code></td>
          <td class="text-center"><code>${r.kobagTu}</code></td>
          <td class="text-center"><code>${r.kopoks}</code></td>
          <td class="text-center"><code>${r.adminSekretariat}</code></td>
        </tr>
      `).join("");
    }
  },

  // ==========================================
  // DETAIL SPT TRACKING MODAL
  // ==========================================
  viewSptDetail(sptId) {
    const spt = AppStorage.getSptById(sptId);
    if (!spt) return;

    const modal = document.getElementById("modalDetailSpt");
    const content = document.getElementById("modalDetailSptBody");
    if (!modal || !content) return;

    const anggotaList = spt.anggota.map((a, i) => `
      <li><strong>${a.nama}</strong> (NIP. ${a.nip || '-'}) - ${a.jabatan} <em>[${a.peranDalamTugas || 'Pelaksana'}]</em></li>
    `).join("");

    const timelineItems = spt.timeline.map((t, idx) => `
      <div class="timeline-item">
        <div class="timeline-dot done"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-action">${t.aksi}</span>
            <span class="timeline-time">${t.waktu}</span>
          </div>
          <div class="timeline-actor">Oleh: ${t.aktor}</div>
        </div>
      </div>
    `).join("");

    content.innerHTML = `
      <div class="mb-3">
        <div class="d-flex justify-content-between align-items-center">
          <h3>SPT: ${spt.nomorSpt || `Draft #${spt.id}`}</h3>
          ${this.getStatusBadge(spt.status)}
        </div>
        <p class="text-muted" style="font-size: 12px;">Klasifikasi: <strong>${spt.klasifikasiNama}</strong></p>
      </div>

      <div class="card p-3 mb-3 bg-light">
        <div class="row">
          <div><strong>Tanggal Penugasan:</strong> ${ConflictChecker.formatRangeIndo(spt.tglMulai, spt.tglSelesai)}</div>
          <div><strong>Tujuan Daerah:</strong> ${spt.tujuanDaerah} ${spt.tempatTujuan ? `(${spt.tempatTujuan})` : ''}</div>
          <div class="mt-2"><strong>Maksud & Uraian Tugas:</strong><br>${spt.untukMelaksanakan}</div>
        </div>
      </div>

      <div class="mb-3">
        <h5 class="fw-bold">Daftar Personil Pelaksana:</h5>
        <ul style="padding-left: 20px;">
          ${anggotaList}
        </ul>
      </div>

      <div class="mb-3">
        <h5 class="fw-bold">Alur Histori & Tracking Proses:</h5>
        <div class="tracking-timeline">
          ${timelineItems}
        </div>
      </div>

      ${spt.fileLaporanName ? `
        <div class="alert alert-success p-3">
          <strong>📄 Laporan Pelaksanaan Terlampir:</strong> ${spt.fileLaporanName}
        </div>
      ` : ''}
    `;

    modal.classList.add("show");
    modal.style.display = "flex";
  },

  // ==========================================
  // UPLOAD LAPORAN KEGIATAN (MAX 2MB)
  // ==========================================
  openUploadLaporanModal(sptId) {
    const spt = AppStorage.getSptById(sptId);
    if (!spt) return;

    const modal = document.getElementById("modalUploadLaporan");
    const inputId = document.getElementById("uploadLaporanSptId");
    const titleEl = document.getElementById("uploadLaporanSptTitle");
    const infoEl = document.getElementById("uploadFileInfo");

    if (inputId) inputId.value = spt.id;
    if (titleEl) titleEl.textContent = `Upload Laporan untuk SPT: ${spt.nomorSpt || spt.id}`;
    if (infoEl) {
      infoEl.textContent = spt.fileLaporanName 
        ? `File tersimpan saat ini: ${spt.fileLaporanName}`
        : "Belum ada laporan terunggah. Maksimal 2MB.";
    }

    if (modal) {
      modal.classList.add("show");
      modal.style.display = "flex";
    }
  },

  handleLaporanFileSelect(e) {
    const file = e.target.files[0];
    const infoEl = document.getElementById("uploadFileInfo");
    const submitBtn = document.getElementById("btnSubmitLaporan");

    if (!file) return;

    const maxSizeBytes = 2 * 1024 * 1024;
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);

    if (file.size > maxSizeBytes) {
      alert(`UKURAN FILE DITOLAK!\nUkuran file ${fileSizeMb} MB melebihi batas maksimum 2MB. Harap kompres berkas atau pilih berkas di bawah 2MB.`);
      e.target.value = "";
      if (infoEl) infoEl.innerHTML = `<span class="text-danger font-weight-bold">❌ File terlalu besar (${fileSizeMb} MB). Batas maksimal 2MB!</span>`;
      if (submitBtn) submitBtn.disabled = true;
      return;
    }

    if (infoEl) {
      infoEl.innerHTML = `<span class="text-success fw-bold">✅ Siap diunggah: ${file.name} (${fileSizeMb} MB)</span>`;
    }
    if (submitBtn) submitBtn.disabled = false;
  },

  submitUploadLaporan() {
    const sptId = document.getElementById("uploadLaporanSptId")?.value;
    const fileInput = document.getElementById("laporanFileInput");

    if (!sptId) return;
    const file = fileInput?.files[0];

    if (!file) {
      this.showToast("Silakan pilih berkas laporan terlebih dahulu!", "error");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("File melebihi batas 2MB!");
      return;
    }

    const spt = AppStorage.getSptById(sptId);
    if (!spt) return;

    const currentUser = this.currentUser || AppStorage.getCurrentUser();
    const timestampNow = new Date().toISOString().replace("T", " ").substring(0, 16);

    spt.fileLaporanName = file.name;
    spt.fileLaporanUrl = URL.createObjectURL(file);
    spt.timeline.push({
      waktu: timestampNow,
      aktor: currentUser.nama,
      aksi: `Laporan kegiatan (${file.name}) berhasil diunggah`,
      status: "laporan_terunggah"
    });

    AppStorage.saveSpt(spt);
    this.closeModal("modalUploadLaporan");
    this.showToast(`Laporan kegiatan (${file.name}) berhasil diunggah! Blokir pengajuan & keanggotaan SPT telah dicabut.`, "success");
    this.renderCurrentView();
    if (this.currentView === "pengajuan") {
      this.renderFormPengajuan();
    }
  },

  downloadSptTtd(sptId) {
    const spt = AppStorage.getSptById(sptId);
    if (!spt) return;
    DocumentPrinter.printSpt(sptId);
    this.showToast(`Membuka dialog cetak / simpan PDF resmi: ${spt.nomorSpt || spt.id}`, "info");
  },

  // ==========================================
  // MODAL UTILITIES
  // ==========================================
  bindModals() {
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("show");
          overlay.style.display = "none";
        }
      });
    });

    const fileLaporanInput = document.getElementById("laporanFileInput");
    if (fileLaporanInput) {
      fileLaporanInput.addEventListener("change", (e) => this.handleLaporanFileSelect(e));
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("show");
      modal.style.display = "none";
    }
  },

  getStatusBadge(status) {
    switch (status) {
      case "diajukan":
        return `<span class="badge badge-diajukan">⏳ Menunggu Ketimker</span>`;
      case "approved_ketimker":
        return `<span class="badge badge-approved-ketimker">🔵 Approved Ketimker</span>`;
      case "approved_kobag_tu":
        return `<span class="badge badge-approved-kobag">🟣 Approved Kobag TU</span>`;
      case "terbit":
        return `<span class="badge badge-terbit">✅ SPT Terbit & Sah</span>`;
      case "ditolak":
        return `<span class="badge badge-ditolak">❌ Ditolak</span>`;
      default:
        return `<span class="badge bg-secondary text-white">${status}</span>`;
    }
  },

  showToast(message, type = "info") {
    let toastContainer = document.getElementById("toastContainer");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toastContainer";
      toastContainer.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px;";
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    let bg = "#1e293b";
    if (type === "success") bg = "#15803d";
    if (type === "error") bg = "#b91c1c";
    if (type === "warning") bg = "#d97706";

    toast.style.cssText = `background: ${bg}; color: #fff; padding: 12px 18px; border-radius: 8px; font-size: 13px; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.25); max-width: 360px; animation: fadeIn 0.2s ease-out;`;
    toast.textContent = message;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
