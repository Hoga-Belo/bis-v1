Berikut adalah \*\*Dokumen Desain UI/UX (Visual Design Document)\*\* yang komprehensif untuk aplikasi \*\*Bebang Sistem Informasi\*\*.



Dokumen ini dirancang untuk menjadi panduan bagi \*\*UI/UX Designer\*\* dalam membuat mockup di Figma/Adobe XD, dan bagi \*\*Frontend Developer\*\* dalam mengimplementasikan komponen menggunakan framework (seperti React + Ant Design/Mantine).



---



\# UI/UX DESIGN DOCUMENT

\*\*Project:\*\* Bebang Sistem Informasi (BSI)

\*\*Theme:\*\* Enterprise, Clean, Modern, Professional

\*\*Target Device:\*\* Desktop (Admin) \& Mobile (Employee PWA)



---



\## 1. Sitemap \& Navigasi



Mengingat aplikasi ini memiliki banyak modul yang kompleks, struktur navigasi \*\*tidak boleh\*\* menumpuk semua menu di satu sidebar panjang. Kita akan menggunakan pendekatan \*\*"Portal \& Module Based"\*\*.



\### 1.1. Flow Navigasi Utama

\*   \*\*Level 0 (Auth):\*\* Login Page.

\*   \*\*Level 1 (Portal):\*\* "Welcome Page" (Launcher).

\*   \*\*Level 2 (Module):\*\* Dashboard spesifik per modul dengan Sidebar sendiri.



\### 1.2. Struktur Menu (Sitemap)



```mermaid

graph TD

&nbsp;   Login\[Login Page] --> Portal\[Welcome Page / App Launcher]

&nbsp;   

&nbsp;   Portal --> HR\[Modul HR]

&nbsp;   Portal --> INV\[Modul Inventory]

&nbsp;   Portal --> MESS\[Modul Mess]

&nbsp;   Portal --> BLD\[Modul Building]

&nbsp;   Portal --> UAM\[Modul Access]

&nbsp;   

&nbsp;   subgraph "Modul HR (Sidebar)"

&nbsp;       HR --> HR\_Dash\[Dashboard HR]

&nbsp;       HR --> HR\_Emp\[Manajemen Karyawan]

&nbsp;       HR --> HR\_Org\[Struktur Organisasi (Tree)]

&nbsp;       HR --> HR\_Abs\[Absensi \& Cuti]

&nbsp;       HR --> HR\_Set\[Master Data HR]

&nbsp;   end



&nbsp;   subgraph "Modul Inventory (Sidebar)"

&nbsp;       INV --> INV\_Dash\[Dashboard Stok]

&nbsp;       INV --> INV\_Items\[Data Barang]

&nbsp;       INV --> INV\_In\[Barang Masuk]

&nbsp;       INV --> INV\_Out\[Barang Keluar]

&nbsp;       INV --> INV\_Opname\[Stock Opname]

&nbsp;   end

&nbsp;   

&nbsp;   %% Global Navigation Element

&nbsp;   HR -.->|Tombol 'Apps' di Header| Portal

&nbsp;   INV -.->|Tombol 'Apps' di Header| Portal

```



\### 1.3. Navigasi User Interface

1\.  \*\*Welcome Page (Portal):\*\* Grid layout berisi kartu ikon besar (Card) untuk setiap modul (HR, Inventory, Mess, dll).

2\.  \*\*Module Layout (Desktop):\*\*

&nbsp;   \*   \*\*Sidebar Kiri (Collapsible):\*\* Menu spesifik modul tersebut.

&nbsp;   \*   \*\*Top Bar (Header):\*\*

&nbsp;       \*   \*\*Kiri:\*\* Logo Kecil + Breadcrumbs.

&nbsp;       \*   \*\*Kanan:\*\* Tombol "App Switcher" (Grid Icon) untuk kembali ke Welcome Page, Notifikasi, dan Profil User.

3\.  \*\*Module Layout (Mobile/PWA):\*\*

&nbsp;   \*   \*\*Bottom Navigation Bar:\*\* Untuk menu utama (Home, Scan QR, Profile).

&nbsp;   \*   \*\*Hamburger Menu:\*\* Untuk menu sekunder.



---



\## 2. Wireframes (Low-Fidelity)



Bagian ini menjelaskan tata letak (layout) untuk halaman-halaman krusial yang kompleks.



\### 2.1. Layout: Form Profil Karyawan (Complex Form)

Masalah utama adalah banyaknya field data. Solusinya adalah \*\*Sticky Header + Tabs Navigation\*\*.



\*   \*\*Header Area (Sticky/Tetap):\*\*

&nbsp;   \*   \*\*Kiri:\*\* Foto Profil (Avatar Besar 120x120px).

&nbsp;   \*   \*\*Tengah:\*\* Nama Lengkap (H1), NIK (H2), Jabatan \& Departemen (Badges).

&nbsp;   \*   \*\*Kanan:\*\* Action Buttons (Edit, Print Biodata, Mutasi).

\*   \*\*Content Area (Scrollable):\*\*

&nbsp;   \*   Menggunakan \*\*Tabs\*\* horizontal di bawah header:

&nbsp;       1.  \*Personal Info\* (Biodata, Alamat, Kontak).

&nbsp;       2.  \*Kepegawaian\* (Kontrak, Pangkat, Golongan).

&nbsp;       3.  \*Keluarga\* (Pasangan, Anak, Darurat).

&nbsp;       4.  \*Payroll\* (Bank, BPJS, Pajak).

&nbsp;       5.  \*Inventaris\* (Aset yang dipegang - Read Only dari Modul Inventory).

&nbsp;       6.  \*Dokumen\* (Upload KTP, Ijazah).



\### 2.2. Layout: Tree-View Struktur Organisasi

Masalah utama adalah keterbacaan hirarki. Solusinya adalah \*\*Interactive Nodes\*\*.



\*   \*\*Canvas:\*\* Area luas dengan kemampuan \*Pan \& Zoom\*.

\*   \*\*Node Card:\*\* Setiap kotak jabatan berisi:

&nbsp;   \*   Foto Kecil.

&nbsp;   \*   Nama Jabatan (Bold).

&nbsp;   \*   Nama Pejabat (Regular).

&nbsp;   \*   Indikator Jumlah Bawahan (Badge kecil).

\*   \*\*Interaksi:\*\*

&nbsp;   \*   Klik tanda `(+)` di bawah node untuk \*expand\* bawahan.

&nbsp;   \*   Klik tanda `(-)` untuk \*collapse\*.

&nbsp;   \*   Klik kanan pada node untuk menu konteks: "Lihat Detail", "Tambah Bawahan", "Edit Posisi".

\*   \*\*Sidebar Kanan (Floating):\*\* Detail properti dari node yang sedang diklik/dipilih.



\### 2.3. Layout: Mobile PWA (Karyawan Self-Service)

\*   \*\*Home Screen:\*\*

&nbsp;   \*   \*\*Top:\*\* Salam "Halo, \[Nama]", Status Absen hari ini.

&nbsp;   \*   \*\*Center (Quick Action):\*\* Tombol Besar "Clock In/Out", "Scan Aset", "Ajukan Cuti".

&nbsp;   \*   \*\*Bottom:\*\* List Berita/Pengumuman Terbaru.



---



\## 3. High-Fidelity Mockups \& Visual Style



\### 3.1. Color Palette (Branding PT Prima Sarana Gemilang)

Diasumsikan warna korporat adalah Biru (Professional/Trust) dengan aksen Oranye/Kuning (Mining/Industrial/Safety).



\*   \*\*Primary Blue:\*\* `#0056B3` (Header, Active States, Primary Buttons).

\*   \*\*Secondary Navy:\*\* `#1A365D` (Sidebar Background, Text Headings).

\*   \*\*Accent Orange:\*\* `#F59E0B` (Warnings, Call to Action, Important Highlights).

\*   \*\*Success Green:\*\* `#10B981` (Status Aktif, Approved, Stock Aman).

\*   \*\*Danger Red:\*\* `#EF4444` (Delete, Error, Stock Kritis, Status Non-Aktif).

\*   \*\*Background:\*\* `#F3F4F6` (Light Grey - agar mata tidak cepat lelah).

\*   \*\*Surface:\*\* `#FFFFFF` (White - Card Background).



\### 3.2. Dashboard Visuals

Dashboard harus informatif, bukan sekadar hiasan.



\*   \*\*Inventory Dashboard:\*\*

&nbsp;   \*   \*Metric Cards:\* Total Aset (Nilai Rp), Low Stock Items (Merah), Barang Masuk Hari Ini.

&nbsp;   \*   \*Chart:\* Bar Chart "Pergerakan Barang per Bulan".

\*   \*\*Mess Dashboard:\*\*

&nbsp;   \*   \*Visual:\* Denah sederhana atau \*\*Donut Chart\*\* "Okupansi Mess" (Terisi vs Kosong).

&nbsp;   \*   \*List:\* 5 Penghuni Terakhir Check-in.

\*   \*\*HR Dashboard:\*\*

&nbsp;   \*   \*Chart:\* Line Chart "Trend Kehadiran Karyawan".

&nbsp;   \*   \*List:\* Karyawan yang Kontraknya akan habis dalam 30 hari (Alert Box).



---



\## 4. Design System / Component Library



Untuk mempercepat development dan konsistensi, gunakan aturan komponen berikut (rekomendasi mengadopsi \*\*Ant Design\*\* atau \*\*Mantine\*\*):



\### 4.1. Typography

\*   \*\*Font Family:\*\* `Inter` atau `Roboto` (Google Fonts) - Bersih dan mudah dibaca di layar kecil.

\*   \*\*H1 (Page Title):\*\* 24px, Bold, Color `#1A365D`.

\*   \*\*H2 (Section Title):\*\* 18px, SemiBold.

\*   \*\*Body Text:\*\* 14px, Regular, Color `#374151`.

\*   \*\*Caption/Label:\*\* 12px, Color `#6B7280`.



\### 4.2. Buttons

\*   \*\*Primary:\*\* Background Biru (`#0056B3`), Text Putih, Radius 6px. (Simpan, Login, Tambah).

\*   \*\*Secondary:\*\* Border Abu-abu, Text Hitam. (Batal, Kembali, Export).

\*   \*\*Danger:\*\* Background Merah/Text Merah. (Hapus, Reject).

\*   \*\*Icon Button:\*\* Untuk aksi di dalam tabel (Edit, Delete, View).



\### 4.3. Status Badges (Penting!)

Konsistensi warna status di seluruh modul:

\*   \*\*Hijau (Success):\*\* `Aktif`, `Hadir`, `Approved`, `Available`.

\*   \*\*Kuning (Warning):\*\* `Pending`, `Maintenance`, `Low Stock`.

\*   \*\*Merah (Error):\*\* `Non-Aktif`, `Absent`, `Rejected`, `Rusak`, `Out of Stock`.

\*   \*\*Biru (Info):\*\* `Draft`, `Processing`, `Terisi`.

\*   \*\*Abu-abu (Default):\*\* `Unknown`, `Archived`.



\### 4.4. Input Fields

\*   \*\*Text Input:\*\* Border 1px solid `#D1D5DB`. Focus border Biru.

\*   \*\*Select/Dropdown:\*\* Wajib mendukung \*\*Searchable\*\* (bisa ketik untuk cari) karena data karyawan/barang ribuan.

\*   \*\*Date Picker:\*\* Format `DD/MM/YYYY`.



\### 4.5. Feedback \& Loading

\*   \*\*Skeleton Loader:\*\* Saat data sedang diambil, tampilkan bayangan abu-abu (skeleton) berbentuk baris tabel/kartu, bukan sekadar spinner berputar (agar terasa lebih cepat).

\*   \*\*Toast Notification:\*\* Muncul di pojok kanan atas (Sukses Simpan / Gagal).



---



\## 5. Implementasi ke Code (Panduan Dev)



\*   \*\*CSS Framework:\*\* Tailwind CSS (sangat disarankan untuk kustomisasi cepat) atau native styling dari UI Library (AntD/Mantine).

\*   \*\*Icon Set:\*\* Phosphor Icons atau Tabler Icons (garis tegas, terlihat profesional).

\*   \*\*Dark Mode:\*\* Untuk fase awal (MVP), fokus pada \*\*Light Mode\*\* terlebih dahulu. Dark mode bisa menjadi fitur tambahan di kemudian hari.



Dokumen ini sudah cukup untuk diserahkan kepada desainer untuk mulai membuat mockup visual.

