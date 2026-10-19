/**
 * Modul Validasi Konflik Jadwal SPT (Conflict Detection Module)
 * Memastikan tidak ada anggota yang memiliki 2 SPT pada rentang tanggal yang beririsan
 */

export const ConflictChecker = {
  parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return new Date(dateStr);
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  },

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

  formatRangeIndo(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return "-";
    if (startDateStr === endDateStr) return this.formatDateIndo(startDateStr);
    return `${this.formatDateIndo(startDateStr)} s.d. ${this.formatDateIndo(endDateStr)}`;
  },

  isDateOverlap(start1Str, end1Str, start2Str, end2Str) {
    const s1 = this.parseDate(start1Str);
    const e1 = this.parseDate(end1Str);
    const s2 = this.parseDate(start2Str);
    const e2 = this.parseDate(end2Str);

    if (!s1 || !e1 || !s2 || !e2) return false;
    return s1.getTime() <= e2.getTime() && e1.getTime() >= s2.getTime();
  },

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

    const activeSpts = (existingSpts || []).filter(spt => {
      if (excludeSptId && String(spt.id) === String(excludeSptId)) return false;
      return validActiveStatuses.includes(spt.status);
    });

    for (const memberId of memberIds) {
      for (const spt of activeSpts) {
        const sptMembers = spt.anggota || spt.pegawaiBertugas || [];
        const isMemberInSpt = sptMembers.some(
          m => String(m.id) === String(memberId) || String(m.nip) === String(memberId) || m.nama === memberId
        );

        if (isMemberInSpt) {
          const sptStart = spt.tglMulai || spt.dariTanggal;
          const sptEnd = spt.tglSelesai || spt.sampaiTanggal;
          const overlap = this.isDateOverlap(tglMulai, tglSelesai, sptStart, sptEnd);
          
          if (overlap) {
            const memberObj = sptMembers.find(
              m => String(m.id) === String(memberId) || String(m.nip) === String(memberId) || m.nama === memberId
            );
            conflicts.push({
              memberId: memberId,
              memberNama: memberObj ? memberObj.nama : memberId,
              memberNip: memberObj ? memberObj.nip : "-",
              existingSptId: spt.id,
              nomorSpt: spt.nomorSpt || `(Draft #${spt.id})`,
              tujuan: spt.tujuanDaerah || spt.tempatTujuan || spt.kotaTujuan || "-",
              keperluan: spt.untukMelaksanakan || spt.uraian || "-",
              tglMulai: sptStart,
              tglSelesai: sptEnd,
              rentangIndo: this.formatRangeIndo(sptStart, sptEnd)
            });
          }
        }
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts: conflicts
    };
  }
};
