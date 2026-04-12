# Frontend TodoFlow (Next.js)

Frontend ini adalah antarmuka pengguna untuk sistem TodoFlow. Aplikasi mencakup halaman autentikasi (login/register), dashboard todo, filter lanjutan, serta pencarian user untuk melihat todo publik.

## Latar Belakang

Pengguna membutuhkan antarmuka yang sederhana namun lengkap untuk:

- Mengelola tugas harian dengan cepat.
- Memantau progress tugas (selesai/belum).
- Menyaring data berdasarkan prioritas, status, kategori, dan deadline.
- Berbagi tugas tertentu sebagai todo publik.

## Solusi UI yang Dibangun

- Halaman login dan register terintegrasi dengan backend JWT.
- Dashboard todo dengan tab:
  - Daftar Todo
  - Buat/Edit Todo
  - Cari User
- Fitur filter dan pencarian real-time.
- Pagination data todo.
- Integrasi upload gambar ke endpoint backend.
- Manajemen token access/refresh di localStorage dengan auto-refresh saat 401.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI + komponen UI custom

## Konfigurasi Environment

Buat file .env.local di folder frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Menjalankan Frontend

```bash
pnpm install
pnpm dev
```

Aplikasi berjalan di http://localhost:3001 atau port yang dipilih Next.js.

## Integrasi API

Frontend menggunakan API client pada lib/api-client.ts untuk mengakses endpoint:

- /auth/register
- /auth/login
- /auth/refresh
- /todos
- /users/search
- /users/:id/todos
- /upload

Pastikan backend sudah berjalan sebelum membuka frontend.

## Catatan Penggunaan

- Token disimpan di localStorage.
- Saat access token kadaluarsa, frontend mencoba refresh token otomatis.
- Jika refresh gagal, pengguna akan dianggap logout.

## Build Production

```bash
pnpm build
pnpm start
```
