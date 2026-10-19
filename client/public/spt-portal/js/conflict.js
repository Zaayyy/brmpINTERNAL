/**
 * Modul Validasi Konflik Jadwal SPT (Conflict Detection Module)
 * Memastikan tidak ada anggota yang memiliki 2 SPT pada rentang tanggal yang beririsan
 */

const ConflictChecker = {
  /**
   * Mengubah string tanggal YYYY-MM-DD menjadi objek Date (jam 00:00:00)
   */
  parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return new Date(dateStr);
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  },

  /**
   * Format tanggal lokal Indonesia DD MMMM YYYY
   */
  formatDateIndo(dateStr) {
    if (!dateStr) return "-";
    const d = this.parseDate(dateStr);
    if (!d || isNaN(d.getTime())) return dateStr;
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },

  /**
   * Format rentang tanggal Indonesia singkat
   */
  formatRangeIndo(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return "-";
    return `${this.formatDateIndo(startDateStr)} s.d. ${this.formatDateIndo(endDateStr)}`;
  },

  /**
   * Memeriksa apakah dua rentang tanggal beririsan (inklusif)
   * Formula: start1 <= end2 && end1 >= start2
   */
  isDateOverlap(start1Str, end1Str, start2Str, end2Str) {
    const s1 = this.parseDate(start1Str);
    const e1 = this.parseDate(end1Str);
    const s2 = this.parseDate(start2Str);
    const e2 = this.parseDate(end2Str);

    if (!s1 || !e1 || !s2 || !e2) return false;
    return s1.getTime() <= e2.getTime() && e1.getTime() >= s2.getTime();
  },

  /**
   * Memeriksa seluruh daftar anggota terhadap SPT aktif yang tersimpan
   * @param {Array<string>} memberIds - ID anggota yang hendak diajukan
   * @param {string} tglMulai - Tanggal mulai penugasan usulan (YYYY-MM-DD)
   * @param {string} tglSelesai - Tanggal selesai penugasan usulan (YYYY-MM-DD)
   * @param {string|null} excludeSptId - ID SPT yang sedang diedit (jika ada)
   * @param {Array<Object>} existingSpts - Daftar seluruh SPT dari storage
   * @returns {Object} { hasConflict: boolean, conflicts: Array }
   */
  checkConflicts(memberIds, tglMulai, tglSelesai, excludeSptId = null, existingSpts = []) {
    if (!memberIds || memberIds.length === 0 || !tglMulai || !tglSelesai) {
      return { hasConflict: false, conflicts: [] };
    }

    const conflicts = [];
    const validActiveStatuses = [
      "diajukan",
      "approved_ketimker",
      "approved_kobag_tu",
      "terbit",
      "berjalan"
    ];

    // Filter SPT yang relevan dan masih aktif (bukan ditolak atau dibatalkan)
    const activeSpts = existingSpts.filter(spt => {
      if (excludeSptId && spt.id === excludeSptId) return false;
      return validActiveStatuses.includes(spt.status);
    });

    for (const memberId of memberIds) {
      for (const spt of activeSpts) {
        // Cek apakah anggota terdaftar dalam SPT aktif ini
        const isMemberInSpt = spt.anggota && spt.anggota.some(m => m.id === memberId || m.nip === memberId);

        if (isMemberInSpt) {
          // Cek irisan tanggal
          const overlap = this.isDateOverlap(tglMulai, tglSelesai, spt.tglMulai, spt.tglSelesai);
          if (overlap) {
            const memberObj = spt.anggota.find(m => m.id === memberId || m.nip === memberId);
            conflicts.push({
              memberId: memberId,
              memberNama: memberObj ? memberObj.nama : memberId,
              memberNip: memberObj ? memberObj.nip : "-",
              existingSptId: spt.id,
              nomorSpt: spt.nomorSpt || `(Draft #${spt.id})`,
              tujuan: spt.tujuanDaerah || spt.tempatTujuan || "-",
              keperluan: spt.untukMelaksanakan || "-",
              tglMulai: spt.tglMulai,
              tglSelesai: spt.tglSelesai,
              statusSpt: spt.status,
              overlapRangeStr: this.formatRangeIndo(spt.tglMulai, spt.tglSelesai)
            });
          }
        }
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts: conflicts
    };
  },

  /**
   * Cek ketersediaan satu anggota tertentu untuk tanggal tertentu
   */
  getMemberConflictDetails(memberId, tglMulai, tglSelesai, excludeSptId = null, existingSpts = []) {
    if (!tglMulai || !tglSelesai) return null;
    const res = this.checkConflicts([memberId], tglMulai, tglSelesai, excludeSptId, existingSpts);
    if (res.hasConflict && res.conflicts.length > 0) {
      return res.conflicts[0];
    }
    return null;
  },

  /**
   * Normalisasi string untuk pencocokan nama atau teks tanpa sensitivitas tanda baca / spasi
   */
  normalizeStr(str) {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9]/g, "");
  },

  /**
   * Memeriksa apakah seorang pegawai/user adalah pemohon dari SPT yang sudah terbit namun belum mengunggah laporan hasil tugas
   * @param {string|Object} pegawaiOrUser - Objek pegawai atau ID atau NIP
   * @param {Array<Object>} existingSpts - Daftar seluruh SPT dari storage
   * @returns {Object|null} Info SPT yang belum dilaporkan atau null jika tertib laporan
   */
  getUnreportedSptForUser(pegawaiOrUser, existingSpts = []) {
    if (!pegawaiOrUser) return null;

    let pId = "";
    let pNip = "";
    let pNama = "";

    if (typeof pegawaiOrUser === "string") {
      pId = pegawaiOrUser;
      pNip = pegawaiOrUser;
    } else {
      pId = pegawaiOrUser.id || pegawaiOrUser.pegawaiId || "";
      pNip = pegawaiOrUser.nip || "";
      pNama = pegawaiOrUser.nama || "";
    }

    const normTargetNama = this.normalizeStr(pNama);

    // Cari SPT yang statusnya "terbit" atau "berjalan" di mana laporan BELUM diunggah
    for (const spt of existingSpts) {
      if (spt.status !== "terbit" && spt.status !== "berjalan") {
        continue;
      }

      // Jika laporan sudah ada, lewati
      const hasReport = Boolean((spt.fileLaporanName && spt.fileLaporanName.trim()) || spt.fileLaporanUrl);
      if (hasReport) {
        continue;
      }

      // Cek apakah pegawai ini adalah pemohon (user yang mengajukan SPT)
      let isPemohon = false;

      if (spt.pemohon) {
        if (pId && spt.pemohon.id === pId) isPemohon = true;
        if (pNip && spt.pemohon.nip === pNip) isPemohon = true;
        if (normTargetNama && this.normalizeStr(spt.pemohon.nama) === normTargetNama) isPemohon = true;
      }

      // Cek juga jika terdaftar di anggota urutan pertama (anggota[0] adalah pemohon/PJ)
      if (!isPemohon && spt.anggota && spt.anggota.length > 0) {
        const pj = spt.anggota[0];
        if (pId && pj.id === pId) isPemohon = true;
        if (pNip && pj.nip === pNip) isPemohon = true;
        if (normTargetNama && this.normalizeStr(pj.nama) === normTargetNama) isPemohon = true;
      }

      if (isPemohon) {
        return {
          sptId: spt.id,
          nomorSpt: spt.nomorSpt || `(Draft #${spt.id})`,
          tujuan: spt.tujuanDaerah || spt.tempatTujuan || "-",
          keperluan: spt.untukMelaksanakan || "-",
          tglMulai: spt.tglMulai,
          tglSelesai: spt.tglSelesai,
          tglKegiatan: this.formatRangeIndo(spt.tglMulai, spt.tglSelesai),
          fileSptTtdName: spt.fileSptTtdName || "-",
          spt: spt
        };
      }
    }

    return null;
  }
};
