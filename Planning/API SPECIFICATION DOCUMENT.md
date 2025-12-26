Berikut adalah \*\*Dokumen Spesifikasi API (API Specification Document)\*\* untuk aplikasi \*\*Bebang Sistem Informasi\*\*.



Dokumen ini disusun menggunakan standar \*\*RESTful API\*\* yang dapat langsung diterjemahkan ke dalam format \*\*OpenAPI 3.0 (Swagger)\*\*. Dokumen ini menjadi kontrak mati antara tim Backend dan Frontend.



---



\# API SPECIFICATION DOCUMENT

\*\*Version:\*\* 1.0

\*\*Base URL:\*\* `https://api.bebang-system.com/api/v1`

\*\*Content-Type:\*\* `application/json`

\*\*Auth Mechanism:\*\* Bearer Token (JWT)



---



\## 1. Standar Respon (Response Envelope)

Semua endpoint \*\*WAJIB\*\* mengembalikan format JSON yang konsisten untuk memudahkan frontend parsing.



\### Sukses (200 OK, 201 Created)

```json

{

&nbsp; "success": true,

&nbsp; "message": "Data berhasil diambil",

&nbsp; "data": { ... },     // Object atau Array data

&nbsp; "meta": {            // Opsional (hanya untuk list/pagination)

&nbsp;   "page": 1,

&nbsp;   "limit": 10,

&nbsp;   "total\_items": 500,

&nbsp;   "total\_pages": 50

&nbsp; }

}

```



\### Error (400, 401, 403, 404, 500)

```json

{

&nbsp; "success": false,

&nbsp; "message": "Validasi gagal",

&nbsp; "error\_code": "VALIDATION\_ERROR",

&nbsp; "errors": {          // Detail field yang error

&nbsp;   "nik": \["NIK sudah terdaftar"],

&nbsp;   "email": \["Format email tidak valid"]

&nbsp; }

}

```



---



\## 2. Modul: Authentication \& Profile (`/auth`)



\### Login

\*   \*\*Endpoint:\*\* `POST /auth/login`

\*   \*\*Desc:\*\* Masuk menggunakan NIK dan Password.

\*   \*\*Request Body:\*\*

&nbsp;   ```json

&nbsp;   {

&nbsp;     "username": "2023001",  // NIK

&nbsp;     "password": "password123"

&nbsp;   }

&nbsp;   ```

\*   \*\*Response:\*\*

&nbsp;   ```json

&nbsp;   {

&nbsp;     "success": true,

&nbsp;     "data": {

&nbsp;       "access\_token": "eyJhbGciOiJIUz...",

&nbsp;       "token\_type": "Bearer",

&nbsp;       "expires\_in": 3600,

&nbsp;       "user": {

&nbsp;         "id": "uuid-user",

&nbsp;         "nik": "2023001",

&nbsp;         "nama": "Budi Santoso",

&nbsp;         "roles": \["HR\_ADMIN", "EMPLOYEE"]

&nbsp;       }

&nbsp;     }

&nbsp;   }

&nbsp;   ```



\### Get My Profile (Self Service)

\*   \*\*Endpoint:\*\* `GET /auth/me`

\*   \*\*Desc:\*\* Mengambil data user yang sedang login beserta permission-nya.

\*   \*\*Headers:\*\* `Authorization: Bearer {token}`



---



\## 3. Modul: Human Resources (`/hr`)



\### List Karyawan (Pagination \& Filter)

\*   \*\*Endpoint:\*\* `GET /hr/employees`

\*   \*\*Query Params:\*\*

&nbsp;   \*   `page=1`

&nbsp;   \*   `limit=20`

&nbsp;   \*   `search=Budi` (Cari nama/NIK)

&nbsp;   \*   `department\_id=5`

&nbsp;   \*   `status=ACTIVE`

\*   \*\*Response:\*\*

&nbsp;   ```json

&nbsp;   {

&nbsp;     "data": \[

&nbsp;       {

&nbsp;         "id": "uuid-emp-1",

&nbsp;         "nik": "2023001",

&nbsp;         "nama\_lengkap": "Budi Santoso",

&nbsp;         "jabatan": "Senior Staff",

&nbsp;         "departemen": "IT",

&nbsp;         "foto\_url": "https://cdn.../foto.jpg"

&nbsp;       }

&nbsp;     ],

&nbsp;     "meta": { ... }

&nbsp;   }

&nbsp;   ```



\### Detail Karyawan Lengkap

\*   \*\*Endpoint:\*\* `GET /hr/employees/{id}`

\*   \*\*Desc:\*\* Mengambil data lengkap (Profile, Keluarga, Kontrak) sesuai tab di UI.

\*   \*\*Response:\*\*

&nbsp;   ```json

&nbsp;   {

&nbsp;     "data": {

&nbsp;       "id": "uuid-emp-1",

&nbsp;       "head": { "nik": "...", "nama": "..." },

&nbsp;       "personal\_info": { "ktp": "...", "alamat": "..." },

&nbsp;       "employment": { "tanggal\_masuk": "2020-01-01", "status": "Tetap" },

&nbsp;       "families": \[ ... ],

&nbsp;       "educations": \[ ... ]

&nbsp;     }

&nbsp;   }

&nbsp;   ```



\### Create Karyawan

\*   \*\*Endpoint:\*\* `POST /hr/employees`

\*   \*\*Request Body:\*\* (Sesuai form input yang kompleks)

&nbsp;   ```json

&nbsp;   {

&nbsp;     "nik": "2025001",

&nbsp;     "nama\_lengkap": "Siti Aminah",

&nbsp;     "jabatan\_id": 10,

&nbsp;     "departemen\_id": 5,

&nbsp;     "personal\_info": {

&nbsp;       "nik\_ktp": "3201...",

&nbsp;       "alamat": "Jl. Mawar..."

&nbsp;     }

&nbsp;   }

&nbsp;   ```



---



\## 4. Modul: Inventory Management (`/inventory`)



\### List Aset Karyawan (Integrasi HR <-> Inv)

\*   \*\*Endpoint:\*\* `GET /hr/employees/{id}/assets`

\*   \*\*Desc:\*\* Menampilkan daftar barang yang sedang dipegang oleh karyawan tertentu.

\*   \*\*Response:\*\*

&nbsp;   ```json

&nbsp;   {

&nbsp;     "data": \[

&nbsp;       {

&nbsp;         "id": "uuid-asset-1",

&nbsp;         "kode\_inventaris": "INV/LAP/001",

&nbsp;         "nama\_barang": "Laptop Dell Latitude",

&nbsp;         "serial\_number": "SN123456",

&nbsp;         "tanggal\_terima": "2024-01-10",

&nbsp;         "kondisi": "BAIK"

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   ```



\### Scan QR Aset

\*   \*\*Endpoint:\*\* `GET /inventory/assets/scan/{qr\_code}`

\*   \*\*Desc:\*\* Mengambil detail aset berdasarkan kode QR/Barcode.

\*   \*\*Response:\*\*

&nbsp;   ```json

&nbsp;   {

&nbsp;     "data": {

&nbsp;       "id": "uuid-asset-99",

&nbsp;       "nama\_produk": "AC Split 1PK",

&nbsp;       "brand": "Daikin",

&nbsp;       "status\_aset": "IN\_USE",

&nbsp;       "lokasi\_sekarang": {

&nbsp;         "tipe": "RUANGAN",

&nbsp;         "nama": "Meeting Room Lt. 2"

&nbsp;       },

&nbsp;       "history": \[ ... ] // 5 history terakhir

&nbsp;     }

&nbsp;   }

&nbsp;   ```



\### Mutasi Barang (Handover)

\*   \*\*Endpoint:\*\* `POST /inventory/transactions/handover`

\*   \*\*Desc:\*\* Menyerahkan barang dari gudang ke karyawan.

\*   \*\*Request Body:\*\*

&nbsp;   ```json

&nbsp;   {

&nbsp;     "asset\_ids": \["uuid-asset-1", "uuid-asset-2"],

&nbsp;     "recipient\_type": "EMPLOYEE",

&nbsp;     "recipient\_id": "uuid-karyawan-target",

&nbsp;     "notes": "Pemberian aset karyawan baru",

&nbsp;     "tanda\_tangan\_url": "https://..." // URL gambar TTD digital

&nbsp;   }

&nbsp;   ```



---



\## 5. Modul: Building Management (`/building`)



\### List Ruangan \& Kapasitas

\*   \*\*Endpoint:\*\* `GET /building/rooms`

\*   \*\*Query Params:\*\* `gedung\_id={id}`

\*   \*\*Response:\*\*

&nbsp;   ```json

&nbsp;   {

&nbsp;     "data": \[

&nbsp;       {

&nbsp;         "id": "uuid-room-1",

&nbsp;         "nama": "Ruang Server",

&nbsp;         "lantai": "Lantai 1",

&nbsp;         "kapasitas": 5,

&nbsp;         "jumlah\_aset": 12, // Count aset di ruangan ini

&nbsp;         "pic\_name": "Budi Santoso"

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   ```



\### Aset dalam Ruangan

\*   \*\*Endpoint:\*\* `GET /building/rooms/{id}/assets`

\*   \*\*Desc:\*\* Menampilkan apa saja yang ada di ruangan ini (Meja, Kursi, AC).



---



\## 6. Modul: Mess Management (`/mess`)



\### Cek Ketersediaan Kamar

\*   \*\*Endpoint:\*\* `GET /mess/rooms/availability`

\*   \*\*Query Params:\*\* `gender=L` (Filter kamar khusus pria)

\*   \*\*Response:\*\*

&nbsp;   ```json

&nbsp;   {

&nbsp;     "data": \[

&nbsp;       {

&nbsp;         "id": "uuid-kamar-101",

&nbsp;         "nomor": "A-101",

&nbsp;         "tipe": "Double Bed",

&nbsp;         "kapasitas": 2,

&nbsp;         "terisi": 1,

&nbsp;         "sisa": 1

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   ```



\### Check-In Penghuni

\*   \*\*Endpoint:\*\* `POST /mess/check-in`

\*   \*\*Request Body:\*\*

&nbsp;   ```json

&nbsp;   {

&nbsp;     "kamar\_id": "uuid-kamar-101",

&nbsp;     "karyawan\_id": "uuid-karyawan-budi",

&nbsp;     "tanggal\_masuk": "2025-06-01",

&nbsp;     "rencana\_keluar": "2025-06-30"

&nbsp;   }

&nbsp;   ```



---



\## 7. Modul: Audit Trail (`/audit`)



\### Lihat Log Aktivitas

\*   \*\*Endpoint:\*\* `GET /audit/logs`

\*   \*\*Query Params:\*\* `module=HR\&user\_id=...\&date\_start=...`

\*   \*\*Permission:\*\* Hanya Super Admin.

\*   \*\*Response:\*\*

&nbsp;   ```json

&nbsp;   {

&nbsp;     "data": \[

&nbsp;       {

&nbsp;         "timestamp": "2025-01-01 10:00:00",

&nbsp;         "user": "Admin HR",

&nbsp;         "action": "UPDATE",

&nbsp;         "module": "HR",

&nbsp;         "description": "Mengubah Gaji Pokok Karyawan A",

&nbsp;         "changes": {

&nbsp;           "old": { "gaji": 5000000 },

&nbsp;           "new": { "gaji": 5500000 }

&nbsp;         }

&nbsp;       }

&nbsp;     ]

&nbsp;   }

&nbsp;   ```



---



\## 8. Snippet OpenAPI (Swagger YAML)

Untuk memudahkan developer backend, berikut adalah kerangka awal `swagger.yaml`:



```yaml

openapi: 3.0.0

info:

&nbsp; title: Bebang Sistem Informasi API

&nbsp; description: API Enterprise untuk HR, Inventory, Mess, dan Building Management.

&nbsp; version: 1.0.0

servers:

&nbsp; - url: https://api.bebang-system.com/api/v1

&nbsp;   description: Production Server

&nbsp; - url: http://localhost:3000/api/v1

&nbsp;   description: Local Dev Server



components:

&nbsp; securitySchemes:

&nbsp;   bearerAuth:

&nbsp;     type: http

&nbsp;     scheme: bearer

&nbsp;     bearerFormat: JWT



paths:

&nbsp; /auth/login:

&nbsp;   post:

&nbsp;     summary: Login User

&nbsp;     requestBody:

&nbsp;       required: true

&nbsp;       content:

&nbsp;         application/json:

&nbsp;           schema:

&nbsp;             type: object

&nbsp;             properties:

&nbsp;               username:

&nbsp;                 type: string

&nbsp;               password:

&nbsp;                 type: string

&nbsp;     responses:

&nbsp;       '200':

&nbsp;         description: Login Sukses

&nbsp;         content:

&nbsp;           application/json:

&nbsp;             schema:

&nbsp;               $ref: '#/components/schemas/LoginResponse'



&nbsp; /hr/employees/{id}/assets:

&nbsp;   get:

&nbsp;     summary: Get Assets assigned to Employee

&nbsp;     security:

&nbsp;       - bearerAuth: \[]

&nbsp;     parameters:

&nbsp;       - name: id

&nbsp;         in: path

&nbsp;         required: true

&nbsp;         schema:

&nbsp;           type: string

&nbsp;           format: uuid

&nbsp;     responses:

&nbsp;       '200':

&nbsp;         description: List Asset

&nbsp;         content:

&nbsp;            application/json:

&nbsp;              schema:

&nbsp;                type: object

&nbsp;                properties:

&nbsp;                  data:

&nbsp;                    type: array

&nbsp;                    items:

&nbsp;                      $ref: '#/components/schemas/AssetItem'



components:

&nbsp; schemas:

&nbsp;   LoginResponse:

&nbsp;     type: object

&nbsp;     properties:

&nbsp;       success:

&nbsp;         type: boolean

&nbsp;       data:

&nbsp;         type: object

&nbsp;         properties:

&nbsp;           access\_token:

&nbsp;             type: string

&nbsp;   

&nbsp;   AssetItem:

&nbsp;     type: object

&nbsp;     properties:

&nbsp;       id:

&nbsp;         type: string

&nbsp;       nama\_barang:

&nbsp;         type: string

&nbsp;       serial\_number:

&nbsp;         type: string

```



Dokumen ini sudah cukup untuk Frontend Developer membuat \*\*Mock Server\*\* dan Backend Developer membuat \*\*Controller \& DTO\*\*.

