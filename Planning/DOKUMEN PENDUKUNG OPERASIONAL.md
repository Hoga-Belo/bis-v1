Berikut adalah \*\*Dokumen Pendukung Operasional\*\* yang komprehensif, mencakup spesifikasi teknis untuk Template Excel, Desain Label Fisik, dan Matriks Keamanan. Dokumen ini siap diserahkan kepada Business Analyst atau Implementor.



---



\# DOKUMEN PENDUKUNG OPERASIONAL

\*\*Proyek:\*\* Bebang Sistem Informasi (BSI)

\*\*Versi:\*\* 1.0



---



\## 1. Spesifikasi Template Import Excel (`import\_karyawan\_master.xlsx`)



File ini dirancang multi-sheet untuk menangani relasi data (One-to-Many) seperti keluarga dan pendidikan.



\### Struktur File Excel

File `.xlsx` terdiri dari 4 Sheet utama:

1\.  \*\*READ\_ME:\*\* Petunjuk pengisian dan Kode Referensi (Read Only).

2\.  \*\*KARYAWAN\_HEAD:\*\* Data utama profil karyawan (1 Baris = 1 Karyawan).

3\.  \*\*KELUARGA\_DETAIL:\*\* Data pasangan/anak (Bisa banyak baris per NIK).

4\.  \*\*PENDIDIKAN\_DETAIL:\*\* Riwayat sekolah (Bisa banyak baris per NIK).



\### Spesifikasi Kolom \& Validasi



\#### Sheet 1: KARYAWAN\_HEAD

\*Kolom ini wajib menggunakan fitur "Data Validation > List" di Excel agar user hanya bisa memilih nilai yang valid.\*



| Header Kolom | Tipe Data | Validasi / Dropdown Source | Keterangan |

| :--- | :--- | :--- | :--- |

| \*\*NIK\*\* (Key) | Text | \*Unik, Wajib Diisi\* | Primary Key penghubung. |

| Nama Lengkap | Text | - | Sesuai KTP. |

| Divisi | Text | List: `\[Mining, Plant, HRGA, Finance]` | Wajib sesuai Master Data. |

| Departemen | Text | List: `\[IT, Recruitment, Payroll, Logistik]` | - |

| Jabatan | Text | List: `\[Operator, Staff, Supervisor, Manager]` | - |

| Status Karyawan | Text | List: `\[PKWT, PKWTT, Harian]` | - |

| Manager NIK | Text | \*Format NIK\* | NIK Atasan Langsung. |

| Tanggal Masuk | Date | `DD/MM/YYYY` | - |

| Tempat Lahir | Text | - | - |

| Tanggal Lahir | Date | `DD/MM/YYYY` | - |

| Jenis Kelamin | Text | List: `\[Laki-laki, Perempuan]` | - |

| Agama | Text | List: `\[Islam, Kristen, Katolik, Hindu, Budha]` | - |

| Golongan Darah | Text | List: `\[A, B, AB, O, -]` | - |

| No KTP | Text | \*16 Digit Angka\* | - |

| Email Pribadi | Text | \*Format Email\* | - |



\#### Sheet 2: KELUARGA\_DETAIL

\*Direlasikan menggunakan NIK.\*



| Header Kolom | Tipe Data | Validasi | Keterangan |

| :--- | :--- | :--- | :--- |

| \*\*Parent NIK\*\* | Text | \*Wajib ada di Sheet KARYAWAN\_HEAD\* | Foreign Key. |

| Nama Anggota | Text | - | Nama Istri/Anak. |

| Hubungan | Text | List: `\[Suami, Istri, Anak, Ayah, Ibu]` | - |

| Tanggal Lahir | Date | `DD/MM/YYYY` | - |

| Pendidikan | Text | List: `\[SD, SMP, SMA, S1, S2]` | - |



\### Proteksi File (Excel Security)

1\.  \*\*Locked Header:\*\* Baris 1 (Header) dikunci password agar tidak bisa diubah/dihapus user.

2\.  \*\*Data Validation:\*\* Kolom Divisi, Jabatan, dan Status menggunakan \*Named Range\* dari sheet Master Data tersembunyi untuk mencegah \*typo\* (misal: "Manger" vs "Manager").



---



\## 2. Desain Label QR Code (Asset Tagging)



Mengingat lokasi di \*\*Site Taliabu\*\* (Industrial/Mining environment), label harus informatif namun ringkas.



\### Spesifikasi Fisik

\*   \*\*Ukuran Label:\*\* 60mm x 30mm (Standar printer barcode industrial seperti Zebra/Argox).

\*   \*\*Material:\*\* \*Polyimide\* atau \*Silver PET\* (Tahan panas, air, dan goresan).

\*   \*\*Resolusi Cetak:\*\* 300 DPI (Agar QR Code terbaca jelas).



\### Layout Visual (Mockup)



```text

+--------------------------------------------------+

|  \[LOGO PT PSG]      PROPERTY OF PT PSG           |  <-- Header (3mm)

+----------------+---------------------------------+

|                |  INV-LAP-IT-2025-001            |  <-- Asset ID (Bold, Besar)

|   \[QR CODE]    |  -----------------------------  |

|  (20mm x 20mm) |  Laptop Dell Latitude 7490      |  <-- Nama Barang (Wrap text)

|                |  SN: 8H72F22                    |  <-- Serial Number (Kecil)

|                |  Dept: IT Support               |  <-- Lokasi/Dept

+----------------+---------------------------------+

|  JANGAN DILEPAS / DO NOT REMOVE                  |  <-- Footer (2mm)

+--------------------------------------------------+

```



\### Penjelasan Elemen:

1\.  \*\*Logo:\*\* Identitas kepemilikan perusahaan.

2\.  \*\*QR Code:\*\* Berisi URL langsung ke sistem, misal: `https://app.psg-taliabu.com/inv/scan/uuid-aset`. Saat discan HP, langsung membuka detail aset.

3\.  \*\*Human Readable ID:\*\* Kode inventaris (misal: `INV-LAP-IT...`) harus terbaca mata telanjang untuk stok opname manual jika scanner rusak.

4\.  \*\*Serial Number:\*\* Penting untuk validasi fisik (mencocokkan barang dengan label).



---



\## 3. Matriks Hak Akses (Role Permission Matrix)



Tabel berikut menentukan siapa boleh melakukan apa. Ini adalah acuan untuk setting \*Middleware\* di Backend.



\*\*Legenda:\*\*

\*   \*\*C\*\* = Create (Input data baru)

\*   \*\*R\*\* = Read (Melihat data)

\*   \*\*U\*\* = Update (Edit data)

\*   \*\*D\*\* = Delete (Hapus data - \*Soft Delete\*)

\*   \*\*A\*\* = Approve (Melakukan persetujuan)

\*   \*\*X\*\* = No Access



\### Tabel Matriks Akses



| Modul / Fitur | Super Admin | HR Manager | HR Staff | Storeman (Gudang) | GA / Mess | Karyawan (User) |

| :--- | :---: | :---: | :---: | :---: | :---: | :---: |

| \*\*1. MODUL HR\*\* | | | | | | |

| Dashboard HR | CRUD | R | R | X | X | X |

| Master Data (Jabatan/Divisi) | CRUD | R | R | R | R | X |

| \*\*Profil Karyawan (Data Diri)\*\* | CRUD | RU | RU | R (Basic) | R (Basic) | R (Self) |

| Profil Karyawan (Gaji/Bank) | CRUD | RU | RU | X | X | R (Self) |

| Absensi (Log Kehadiran) | CRUD | R | CRUD | X | X | C (Self) |

| Cuti (Pengajuan) | CRUD | A | R | X | X | C (Self) |

| \*\*2. MODUL INVENTORY\*\* | | | | | | |

| Dashboard Inventory | CRUD | R | X | R | X | X |

| Master Barang (Katalog) | CRUD | X | X | CRUD | R | R (Catalog) |

| Stok Masuk/Keluar | CRUD | X | X | CRUD | X | X |

| Assign Aset ke Karyawan | CRUD | R | R | C | X | R (Self) |

| \*\*3. MODUL MESS\*\* | | | | | | |

| Dashboard Mess | CRUD | R | X | X | R | X |

| Master Kamar | CRUD | X | X | X | CRUD | X |

| Check-in / Check-out | CRUD | R | R | X | CRUD | X |

| \*\*4. MODUL BUILDING\*\* | | | | | | |

| Master Gedung/Ruangan | CRUD | X | X | R | CRUD | R |

| Maintenance Request | CRUD | R | R | R | RU | C |

| \*\*5. SYSTEM \& AUDIT\*\* | | | | | | |

| User Management | CRUD | R | X | X | X | X |

| Audit Logs | R | X | X | X | X | X |

| Export Data (Excel/PDF) | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |



\### Catatan Keamanan Khusus:

1\.  \*\*Segregasi Tugas (SoD):\*\* \*Storeman\* bisa mengeluarkan barang, tapi \*HR\* yang memvalidasi bahwa barang tersebut sudah diterima karyawan (via data profil).

2\.  \*\*Sensitive Data:\*\* Gaji dan No Rekening hanya bisa dilihat oleh \*Super Admin\* dan \*HR Team\*. Role lain (Gudang/GA) hanya bisa melihat Nama, NIK, dan Jabatan untuk keperluan operasional.

3\.  \*\*Self Service:\*\* Karyawan hanya bisa \*Create\* (Pengajuan Cuti/Absen) dan \*Read\* (Data Sendiri), tidak bisa \*Update\* data master mereka sendiri (seperti mengganti Jabatan sendiri).



--- 



Dokumen ini menjadi lampiran wajib saat fase \*Development\* dan \*User Acceptance Test (UAT)\*.

