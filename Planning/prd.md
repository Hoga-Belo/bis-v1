Berikut adalah \*\*Product Requirement Document (PRD)\*\* yang lengkap dan detail, disusun berdasarkan seluruh file spesifikasi yang Anda lampirkan dan standar pengembangan sistem enterprise.



Dokumen ini dirancang untuk menjadi acuan tunggal bagi Tim Developer (Backend \& Frontend), UI/UX Designer, dan QA Tester.



---



\# PRODUCT REQUIREMENT DOCUMENT (PRD)

\*\*Nama Proyek:\*\* Bebang Sistem Informasi (BSI)

\*\*Klien:\*\* PT Prima Sarana Gemilang (Site Taliabu)

\*\*Versi:\*\* 1.0

\*\*Tanggal:\*\* 25 Desember 2025

\*\*Status:\*\* Approved for Development



---



\## 1. Pendahuluan



\### 1.1. Latar Belakang

PT Prima Sarana Gemilang membutuhkan sistem informasi terpusat berbasis web progresif (PWA) untuk mengelola data operasional di site Taliabu. Sistem ini bertujuan meniadakan \*silo\* data antar departemen dengan menjadikan data HR sebagai pusat referensi.



\### 1.2. Tujuan

Membangun aplikasi "Bebang Sistem Informasi" yang berfungsi sebagai pusat pelayanan data karyawan, pengelolaan aset (inventory), manajemen akomodasi (mess), manajemen gedung, dan pengaturan hak akses pengguna secara terintegrasi.



\### 1.3. Lingkup Kerja (Scope)

Sistem mencakup pengembangan Backend (API), Frontend (Web PWA), dan Database.

\*\*Modul Utama:\*\*

1\.  \*\*Core \& Security:\*\* User Access Management \& Audit Trail.

2\.  \*\*Human Resources (HR):\*\* Manajemen Karyawan, Organisasi, Absensi, Cuti.

3\.  \*\*Inventory Management:\*\* Stok, Aset, QR Code.

4\.  \*\*Building Management:\*\* Gedung, Ruangan, Aset Gedung.

5\.  \*\*Mess Management:\*\* Hunian Karyawan.



---



\## 2. Target Pengguna (User Personas)



| Peran | Deskripsi | Akses Utama |

| :--- | :--- | :--- |

| \*\*Super Admin\*\* | Tim IT/System Admin | Akses Penuh, Konfigurasi Modul, Audit Trail. |

| \*\*HR Admin\*\* | Staff HRD | Input Karyawan, Approval Cuti, Manajemen Kontrak. |

| \*\*Storeman\*\* | Staff Logistik/Gudang | Stok Masuk/Keluar, Opname, Manajemen Aset. |

| \*\*GA / Mess Spv\*\* | General Affairs | Manajemen Kamar Mess, Maintenance Gedung. |

| \*\*Karyawan\*\* | Seluruh Pegawai | \*Self-Service\*: Absen, Cek Slip Gaji, Request Cuti. |

| \*\*Approver\*\* | Manager/Head | Melakukan persetujuan (Approval) request bawahan. |



---



\## 3. Spesifikasi Fungsional (Functional Requirements)



\### 3.0. Sistem Umum \& Autentikasi

\*   \*\*\[SYS-01] Login:\*\* Menggunakan \*\*Nomor Induk Karyawan (NIK)\*\* sebagai username.

\*   \*\*\[SYS-02] Welcome Page:\*\* Dashboard landing page yang menampilkan \*shortcut\* ke modul yang diizinkan sesuai hak akses user.

\*   \*\*\[SYS-03] PWA Capabilities:\*\* Aplikasi dapat diinstal di desktop/mobile, mendukung mode offline terbatas (caching aset), dan akses kamera untuk scan QR.

\*   \*\*\[SYS-04] Bahasa:\*\* Antarmuka wajib menggunakan \*\*Bahasa Indonesia\*\* baku.



\### 3.1. Modul Human Resources (HR)

\*Pusat data referensi untuk modul lain.\*



\*\*Master Data:\*\*

\*   \*\*\[HR-01] Organisasi:\*\* CRUD untuk Divisi, Departemen (link to Manager), Posisi Jabatan, Golongan, Pangkat.

\*   \*\*\[HR-02] Referensi:\*\* CRUD untuk Lokasi Kerja, Status Karyawan, Tag (Warna), Jenis Hubungan Kerja.



\*\*Manajemen Karyawan:\*\*

\*   \*\*\[HR-03] Profil Lengkap:\*\* Input data sesuai dokumen \*02\_modul\_hr\_v2.md\* (Tabs: Personal, HR Info, Keluarga, Pendidikan, Payroll, Dokumen).

\*   \*\*\[HR-04] Foto \& Dokumen:\*\* Upload foto profil dan dokumen pendukung (KTP, Ijazah).

\*   \*\*\[HR-05] Import Excel:\*\* Fitur import massal data karyawan menggunakan template standar (Validasi NIK unik).



\*\*Operasional HR:\*\*

\*   \*\*\[HR-06] Struktur Organisasi:\*\* Visualisasi Tree-View interaktif.

\*   \*\*\[HR-07] Absensi:\*\* Clock-in/out (Lokasi/QR), Rekapitulasi kehadiran.

\*   \*\*\[HR-08] Cuti \& Izin:\*\* Pengajuan cuti, perhitungan saldo cuti otomatis, approval berjenjang.

\*   \*\*\[HR-09] Kontrak:\*\* Notifikasi otomatis kontrak akan habis (Reminder H-30/H-60).



\### 3.2. Modul Inventory Management

\*Terintegrasi dengan HR untuk penanggung jawab aset.\*



\*\*Master Data \& Stok:\*\*

\*   \*\*\[INV-01] Katalog Produk:\*\* Kategori (Fixed/Consumable), Brand, UOM, SKU Produk.

\*   \*\*\[INV-02] Manajemen Gudang:\*\* Multi-gudang/Lokasi penyimpanan.

\*   \*\*\[INV-03] Transaksi Stok:\*\* Inbound (Masuk), Outbound (Keluar), Adjustment (Opname), Transfer antar Gudang.



\*\*Aset \& Tagging:\*\*

\*   \*\*\[INV-04] Assign to Employee:\*\* Fitur mengeluarkan stok (Aset) dan menetapkan Karyawan (dari modul HR) sebagai penanggung jawab. Data ini harus muncul di profil karyawan ybs.

\*   \*\*\[INV-05] Assign to Location:\*\* Fitur mengeluarkan stok untuk ditempatkan di Gedung/Mess (Link to Module Building/Mess).

\*   \*\*\[INV-06] QR/Barcode:\*\* Generate QR Code per item aset (termasuk Serial Number). Fitur Scan untuk info detail aset.



\### 3.3. Modul Mess Management

\*Pengelolaan tempat tinggal karyawan.\*



\*   \*\*\[MES-01] Master Akomodasi:\*\* Data Site, Blok, Lantai, Nomor Kamar, Kapasitas, Fasilitas (AC/Non-AC).

\*   \*\*\[MES-02] Check-In/Placement:\*\* Assign karyawan (dari HR) ke kamar tertentu. Validasi kapasitas kamar dan gender.

\*   \*\*\[MES-03] Monitoring:\*\* Dashboard status kamar (Terisi, Kosong, Rusak, Maintenance).

\*   \*\*\[MES-04] Perawatan:\*\* Log laporan kerusakan fasilitas mess dan status perbaikannya.



\### 3.4. Modul Building Management

\*Pengelolaan fasilitas kantor dan aset di dalamnya.\*



\*   \*\*\[BLD-01] Master Lokasi:\*\* Gedung, Lantai, Ruangan, Fasilitas Tetap.

\*   \*\*\[BLD-02] Aset Ruangan:\*\* Menampilkan daftar aset (Meja, PC, AC) yang berada di ruangan tersebut (Data ditarik dari status lokasi aset di Inventory).

\*   \*\*\[BLD-03] Penanggung Jawab:\*\* Assign karyawan (dari HR) sebagai PIC ruangan/gedung.

\*   \*\*\[BLD-04] Maintenance:\*\* Jadwal kebersihan dan pencatatan perbaikan sarana gedung.



\### 3.5. Modul User Access Management (UAM)

\*Sistem keamanan berbasis Role-Based Access Control (RBAC).\*



\*   \*\*\[UAM-01] Roles:\*\* Manajemen Role dinamis (Super Admin, HR Staff, User, dll).

\*   \*\*\[UAM-02] Granular Permission:\*\* Kontrol akses hingga level:

&nbsp;   \*   \*Module Level\* (Bisa buka Inventory?)

&nbsp;   \*   \*Feature Level\* (Bisa Edit?)

&nbsp;   \*   \*Field Level\* (Bisa lihat Gaji?)

\*   \*\*\[UAM-03] Password:\*\* Karyawan login awal menggunakan password default (seed), wajib ganti password saat login pertama. Reset password oleh Admin.



\### 3.6. Modul Audit Trail

\*Pencatatan jejak digital untuk keamanan.\*



\*   \*\*\[AUD-01] Global Logging:\*\* Mencatat 5W+1H (Who, What, Where, When, Why, How) untuk setiap aksi Create, Update, Delete.

\*   \*\*\[AUD-02] Data Change Log:\*\* Menyimpan `old\_value` dan `new\_value` (format JSON) untuk melihat apa yang berubah.

\*   \*\*\[AUD-03] View History:\*\* Tombol "Lihat Riwayat" pada setiap form detail (misal: Riwayat perubahan biodata karyawan).



---



\## 4. Spesifikasi Non-Fungsional (Technical Requirements)



\### 4.1. Arsitektur \& Teknologi

\*   \*\*Platform:\*\* Web-based Enterprise Application (PWA).

\*   \*\*Database:\*\* PostgreSQL (Wajib).

&nbsp;   \*   \*Credential Dev:\* root:postgres / 123456789 (Hanya untuk lokal).

\*   \*\*Backend:\*\* Modular Monolith (Disarankan: NestJS atau Laravel). Folder backend terpisah dari frontend.

\*   \*\*Frontend:\*\* React (Next.js) atau Vue (Nuxt.js) dengan UI Library Enterprise (AntD/Mantine). Folder frontend terpisah.

\*   \*\*Deployment:\*\* Docker Containerization (Siap untuk Server Lokal Taliabu dan Scale-up Cloud).



\### 4.2. Kinerja \& Skalabilitas

\*   \*\*Support User:\*\* Mampu menangani >500 karyawan aktif.

\*   \*\*Response Time:\*\* Target < 2 detik untuk loading data standar.

\*   \*\*Concurrency:\*\* Mampu menangani akses bersamaan saat jam masuk/pulang kerja (absen).



\### 4.3. Keamanan

\*   \*\*Password Encryption:\*\* Bcrypt atau Argon2.

\*   \*\*Session Management:\*\* JWT (JSON Web Token) dengan refresh token mechanism.

\*   \*\*Data Protection:\*\* Tidak ada data \*hardcoded\* di source code. Credential via Environment Variables (`.env`).



---



\## 5. UI/UX Guidelines



\*   \*\*Desain Visual:\*\* Bersih, Modern, Professional, Corporate Look.

\*   \*\*Navigasi:\*\*

&nbsp;   \*   Sidebar Menu (Collapsible).

&nbsp;   \*   Breadcrumbs untuk orientasi lokasi halaman.

\*   \*\*Input Form:\*\*

&nbsp;   \*   Validasi real-time (Merah jika error).

&nbsp;   \*   Mandatory field ditandai asterisk (\*).

&nbsp;   \*   Dropdown dengan fitur \*Search\* untuk referensi data besar (misal: pilih karyawan).

\*   \*\*Responsivitas:\*\* Layout menyesuaikan Desktop, Tablet, dan Mobile (khusus fitur user umum).



---



\## 6. Rencana Migrasi \& Seeding Data



\*   \*\*Data Awal (Seed):\*\*

&nbsp;   \*   User Admin Default.

&nbsp;   \*   Master Data Statis (Provinsi, Golongan Darah, Agama).

\*   \*\*Strategi Import:\*\*

&nbsp;   \*   Menggunakan format Excel (`.xlsx`).

&nbsp;   \*   Mapping kolom sesuai dokumen \*08\_relasi\_dengan\_sheet\_excel.md\*.

&nbsp;   \*   Sistem menolak import jika ada data referensi (misal: Kode Jabatan) yang tidak ditemukan di Master Data.



---



\## 7. Roadmap Pengembangan (Phasing)



\### Fase 1: Core Foundation \& HR (Minggu 1-4)

\*   Setup Project (Repo, Docker, DB).

\*   Implementasi UAM \& Audit Trail.

\*   Modul HR Lengkap (Master, Profil, Import Excel).



\### Fase 2: Inventory \& Building (Minggu 5-7)

\*   Modul Inventory (Stok, QR Code).

\*   Integrasi Inventory -> HR (Assign Aset).

\*   Modul Building Management.

\*   Integrasi Inventory -> Building (Aset Ruangan).



\### Fase 3: Mess, Dashboard \& Finishing (Minggu 8-10)

\*   Modul Mess Management (Checkin/Checkout).

\*   Dashboard Utama \& Reporting.

\*   Employee Self-Service (Request Cuti, Lihat Profil).

\*   UAT \& Bug Fixing.



---



\## 8. Kriteria Keberhasilan (Acceptance Criteria)

1\.  \*\*Integritas Data:\*\* Data karyawan di HR muncul dan dapat dipilih di modul Inventory, Mess, dan Building.

2\.  \*\*Audit:\*\* Setiap perubahan data profil karyawan tercatat di log audit dengan jelas (sebelum vs sesudah).

3\.  \*\*Flow Login:\*\* User login dengan NIK -> Masuk Welcome Page -> Klik Modul -> Masuk Dashboard Modul.

4\.  \*\*Import:\*\* Berhasil melakukan import 500+ data karyawan dari Excel tanpa \*timeout\* atau \*error\* data korup.

5\.  \*\*Offline:\*\* Halaman utama dapat dibuka kembali saat internet dimatikan (Service Worker aktif).



---



\*Dokumen ini bersifat mengikat sebagai acuan pengembangan. Perubahan fitur harus melalui persetujuan Change Request.\*

