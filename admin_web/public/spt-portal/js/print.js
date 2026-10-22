/**
 * Modul Generator Cetak Naskah Dinas SPT Resmi Standar Kementan BRMP DIY
 * Menghasilkan dokumen A4 siap cetak dengan tata letak resmi persuratan pemerintah RI
 */

const DocumentPrinter = {
  /**
   * Menghitung durasi hari kalender antara tgl mulai dan selesai (inklusif)
   */
  calculateDurationDays(tglMulai, tglSelesai) {
    if (!tglMulai || !tglSelesai) return 1;
    const start = new Date(tglMulai);
    const end = new Date(tglSelesai);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  },

  /**
   * Render HTML Naskah Dinas SPT Resmi
   */
  generateSptHtml(spt) {
    const menimbangList = AppStorage.getMenimbang();
    const dasarList = AppStorage.getDasar();
    const durasiHari = this.calculateDurationDays(spt.tglMulai, spt.tglSelesai);
    const tglMulaiIndo = ConflictChecker.formatDateIndo(spt.tglMulai);
    const tglSelesaiIndo = ConflictChecker.formatDateIndo(spt.tglSelesai);
    const rentangTgl = spt.tglMulai === spt.tglSelesai 
      ? tglMulaiIndo 
      : `${tglMulaiIndo} s.d. ${tglSelesaiIndo}`;

    const nomorSurat = spt.nomorSpt || "B-......../KP.320/H.14.7/..../2026";
    const tglDitetapkan = ConflictChecker.formatDateIndo(spt.tglPengajuan || new Date().toISOString().split("T")[0]);

    // Baris anggota tabel
    const anggotaRows = spt.anggota.map((ang, idx) => `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td>
          <div class="fw-bold">${ang.nama}</div>
          <div class="text-nip">NIP. ${ang.nip || "-"}</div>
        </td>
        <td class="text-center">${ang.golongan || "-"}</td>
        <td>
          <div>${ang.jabatan || "-"}</div>
          <span class="badge-peran">${ang.peranDalamTugas || "Anggota Pelaksana"}</span>
        </td>
      </tr>
    `).join("");

    // Menimbang items (a, b, c...)
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const menimbangHtml = menimbangList.map((item, idx) => `
      <div class="konsiderans-item">
        <span class="item-label">${alphabet[idx] || (idx + 1)}.</span>
        <span class="item-text">${item}</span>
      </div>
    `).join("");

    // Dasar items (1, 2, 3...)
    const dasarHtml = dasarList.map((item, idx) => `
      <div class="konsiderans-item">
        <span class="item-label">${idx + 1}.</span>
        <span class="item-text">${item}</span>
      </div>
    `).join("");

    const logoSrc = (typeof KEMENTAN_LOGO_BASE64 !== "undefined" && KEMENTAN_LOGO_BASE64)
      ? KEMENTAN_LOGO_BASE64
      : "img/logo-kementan.png";

    return `
      <div class="spt-official-document">
        <!-- KOP SURAT RESMI KEMENTERIAN PERTANIAN -->
        <header class="spt-kop">
          <div class="kop-logo">
            <img src="${logoSrc}" alt="Logo Kementerian Pertanian" class="kop-logo-img">
          </div>
          <div class="kop-text">
            <div class="kop-kementerian">KEMENTERIAN PERTANIAN</div>
            <div class="kop-badan">BADAN STANDARDISASI INSTRUMEN PERTANIAN</div>
            <div class="kop-balai">BALAI PENERAPAN STANDAR INSTRUMEN PERTANIAN</div>
            <div class="kop-subbalai">DAERAH ISTIMEWA YOGYAKARTA (BRMP DIY)</div>
            <div class="kop-alamat">
              Jl. Stadion Maguwoharjo No. 22, Karangsari, Wedomartani, Ngemplak, Sleman, D.I. Yogyakarta 55584<br>
              Telepon (0274) 884662 | Faksimili (0274) 884663 | Surel: brmp-diy@pertanian.go.id | Laman: brmpdiy.pertanian.go.id
            </div>
          </div>
        </header>
        <div class="kop-divider">
          <div class="line-thick"></div>
          <div class="line-thin"></div>
        </div>

        <!-- JUDUL SURAT -->
        <div class="spt-title-block">
          <h2 class="spt-title">SURAT PERINTAH TUGAS</h2>
          <div class="spt-number">Nomor: ${nomorSurat}</div>
        </div>

        <!-- KONSIDERANS MENIMBANG & DASAR -->
        <div class="spt-section">
          <div class="konsiderans-row">
            <div class="konsiderans-header">Menimbang</div>
            <div class="konsiderans-sep">:</div>
            <div class="konsiderans-content">
              ${menimbangHtml}
            </div>
          </div>

          <div class="konsiderans-row mt-2">
            <div class="konsiderans-header">Dasar</div>
            <div class="konsiderans-sep">:</div>
            <div class="konsiderans-content">
              ${dasarHtml}
            </div>
          </div>
        </div>

        <!-- MEMERINTAHKAN -->
        <div class="spt-order-header">
          MEMERINTAHKAN:
        </div>

        <!-- KEPADA -->
        <div class="spt-section">
          <div class="diktum-row">
            <div class="diktum-title">Kepada</div>
            <div class="diktum-sep">:</div>
            <div class="diktum-content">
              <table class="table-personil">
                <thead>
                  <tr>
                    <th style="width: 35px;">No</th>
                    <th>Nama / NIP</th>
                    <th style="width: 80px;">Golongan</th>
                    <th>Jabatan & Peran Penugasan</th>
                  </tr>
                </thead>
                <tbody>
                  ${anggotaRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- UNTUK -->
        <div class="spt-section mt-2">
          <div class="diktum-row">
            <div class="diktum-title">Untuk</div>
            <div class="diktum-sep">:</div>
            <div class="diktum-content">
              <ol class="untuk-list">
                <li>
                  <strong>Tujuan & Maksud:</strong><br>
                  ${spt.untukMelaksanakan}
                </li>
                <li>
                  <strong>Lokasi Tujuan:</strong><br>
                  ${spt.tujuanDaerah} ${spt.tempatTujuan ? `(${spt.tempatTujuan})` : ""}
                </li>
                <li>
                  <strong>Waktu Pelaksanaan:</strong><br>
                  Selama <strong>${durasiHari} (${durasiHari} hari)</strong> kalender, terhitung mulai tanggal <strong>${rentangTgl}</strong>.
                </li>
                <li>
                  Segala biaya yang timbul sebagai akibat dikeluarkannya Surat Perintah Tugas ini dibebankan pada DIPA Balai Penerapan Standar Instrumen Pertanian DIY Tahun Anggaran 2026.
                </li>
                <li>
                  Surat Perintah Tugas ini dibuat untuk dilaksanakan dengan penuh kesungguhan dan tanggung jawab, serta segera menyampaikan laporan tertulis hasil pelaksanaan tugas kepada Pimpinan.
                </li>
              </ol>
            </div>
          </div>
        </div>

        <!-- TANDA TANGAN & PENGESAHAN -->
        <div class="spt-signature-area">
          <div class="signature-date">
            Ditetapkan di : Yogyakarta<br>
            Pada tanggal : ${tglDitetapkan}
          </div>
          <div class="signature-title">
            Kepala Balai Penerapan Standar Instrumen Pertanian<br>
            Daerah Istimewa Yogyakarta,
          </div>
          
          <div class="signature-box">
            <!-- Stempel & QR Code Resmi -->
            <div class="official-stamp-qr">
              <div class="qr-code-box">
                <svg viewBox="0 0 100 100" width="70" height="70">
                  <rect x="0" y="0" width="100" height="100" fill="#ffffff" stroke="#222" stroke-width="1.5"/>
                  <rect x="10" y="10" width="25" height="25" fill="#1b5e20"/>
                  <rect x="15" y="15" width="15" height="15" fill="#ffffff"/>
                  <rect x="18" y="18" width="9" height="9" fill="#1b5e20"/>
                  <rect x="65" y="10" width="25" height="25" fill="#1b5e20"/>
                  <rect x="70" y="15" width="15" height="15" fill="#ffffff"/>
                  <rect x="73" y="18" width="9" height="9" fill="#1b5e20"/>
                  <rect x="10" y="65" width="25" height="25" fill="#1b5e20"/>
                  <rect x="15" y="70" width="15" height="15" fill="#ffffff"/>
                  <rect x="18" y="73" width="9" height="9" fill="#1b5e20"/>
                  <rect x="42" y="15" width="8" height="8" fill="#1b5e20"/>
                  <rect x="42" y="30" width="8" height="8" fill="#1b5e20"/>
                  <rect x="42" y="45" width="16" height="8" fill="#1b5e20"/>
                  <rect x="65" y="45" width="8" height="16" fill="#1b5e20"/>
                  <rect x="45" y="65" width="12" height="12" fill="#1b5e20"/>
                  <rect x="70" y="70" width="15" height="15" fill="#1b5e20"/>
                </svg>
                <div class="qr-label">BSRE - KEMENTAN</div>
              </div>
              <div class="stamp-circle">
                <span class="stamp-text">BSIP DIY * KEMENTERIAN PERTANIAN</span>
              </div>
            </div>
          </div>

          <div class="signature-officer">
            <div class="officer-name">Dr. Soeharsono, S.Pt, M.Si</div>
            <div class="officer-nip">NIP. 197109271998031002</div>
          </div>
        </div>

        <!-- TEMBUSAN -->
        <div class="spt-tembusan">
          <div class="fw-bold">Tembusan Yth:</div>
          <ol>
            <li>Sekretaris Badan Standardisasi Instrumen Pertanian di Jakarta;</li>
            <li>Pejabat Pembuat Komitmen BRMP DIY;</li>
            <li>Yang bersangkutan untuk dilaksanakan;</li>
            <li>Pertinggal.</li>
          </ol>
        </div>
      </div>
    `;
  },

  /**
   * Membuka dokumen untuk dicetak
   */
  printSpt(sptId) {
    const spt = AppStorage.getSptById(sptId);
    if (!spt) {
      alert("Dokumen SPT tidak ditemukan!");
      return;
    }

    const container = document.getElementById("printContainer");
    if (container) {
      container.innerHTML = this.generateSptHtml(spt);
      const modalBody = document.getElementById("previewModalBody");
      if (modalBody) {
        modalBody.innerHTML = container.innerHTML;
      }
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          if (container) container.innerHTML = "";
        }, 1000);
      }, 50);
    }
  },

  /**
   * Cetak langsung dari modal preview
   */
  printFromModal() {
    const modalBody = document.getElementById("previewModalBody");
    const container = document.getElementById("printContainer");
    if (modalBody && container) {
      container.innerHTML = modalBody.innerHTML;
    }
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        if (container) container.innerHTML = "";
      }, 1000);
    }, 50);
  },

  /**
   * Tampilkan preview modal naskah dinas
   */
  previewSpt(sptId) {
    const spt = AppStorage.getSptById(sptId);
    if (!spt) return;

    const modalBody = document.getElementById("previewModalBody");
    if (modalBody) {
      modalBody.innerHTML = this.generateSptHtml(spt);
      const modal = document.getElementById("previewModal");
      if (modal) {
        modal.classList.add("show");
        modal.style.display = "flex";
      }
    }
  }
};
