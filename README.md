# Final Project PBKK - TodoFlow

TodoFlow adalah aplikasi manajemen tugas berbasis web dengan arsitektur fullstack:

- Frontend: Next.js + React + Tailwind CSS
- Backend: NestJS + Prisma + SQLite
- Fitur utama: autentikasi JWT, CRUD todo, upload gambar, filter/pencarian, visibilitas publik, dan reminder email otomatis.

## Latar Belakang Masalah

Mahasiswa sering mengelola tugas kuliah, pekerjaan, dan aktivitas pribadi dari banyak sumber. Masalah yang umum terjadi:

- Deadline terlewat karena tidak ada pengingat terpusat.
- Daftar tugas cepat menumpuk dan sulit difilter.
- Sulit membedakan tugas pribadi dan tugas yang ingin dibagikan.
- Tidak ada ringkasan progress yang jelas.

## Solusi yang Dibangun

Proyek ini menyediakan aplikasi todo terintegrasi yang menyelesaikan masalah di atas melalui:

- Sistem akun pengguna dengan login/register dan token refresh.
- Dashboard todo dengan fitur tambah, ubah, hapus, tandai selesai.
- Filter dan pencarian berdasarkan judul/deskripsi, prioritas, status, kategori, visibilitas, dan due date.
- Pagination untuk menjaga performa saat data banyak.
- Upload gambar untuk lampiran visual pada todo.
- Todo publik dan fitur melihat todo publik user lain.
- Scheduler backend yang mengirim reminder email harian untuk tugas yang jatuh tempo besok.

## Arsitektur Singkat

```text
frontend (Next.js)
		|
		| HTTP API + JWT
		v
backend-multer (NestJS)
		|
		| Prisma ORM
		v
SQLite (prisma/dev.db)
```

## Struktur Folder

- backend-multer: service API, auth, todo, upload, scheduler, dan mailer.
- frontend: antarmuka pengguna (login/register/dashboard todo).
- Docs: aset dokumentasi, screenshot, dan file "Dokumentasi FP PBKK.pdf".

## Cara Menjalankan Aplikasi

### Prasyarat

- Node.js 18+
- pnpm

### 1. Jalankan Backend

1. Masuk ke folder backend:

```bash
cd backend-multer
```

2. Install dependency:

```bash
pnpm install
```

3. Siapkan file environment (.env) di folder backend-multer:

```env
PORT=3000
JWT_SECRET=test_jwt_secret

MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=your_email@gmail.com
```

4. Sinkronkan skema database SQLite:

```bash
npx prisma generate
npx prisma db push
```

5. Jalankan backend:

```bash
pnpm run start:dev
```

Backend default di http://localhost:3000

### 2. Jalankan Frontend

1. Buka terminal baru lalu masuk ke folder frontend:

```bash
cd frontend
```

2. Install dependency:

```bash
pnpm install
```

3. Buat file .env.local di folder frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. Jalankan frontend:

```bash
pnpm dev
```

Frontend default di http://localhost:3001 atau port yang diberikan Next.js.

## Endpoint Utama Backend

- Auth
	- POST /auth/register
	- POST /auth/login
	- POST /auth/refresh
	- POST /auth/logout
- Todo
	- POST /todos
	- GET /todos
	- GET /todos/:id
	- PATCH /todos/:id
	- DELETE /todos/:id
- User
	- GET /users/search?search=...
	- GET /users/:id/todos
- Upload
	- POST /upload (multipart/form-data, field: image)

## README Per Sub-Proyek

- Backend detail: backend-multer/README.md
- Frontend detail: frontend/README.md
