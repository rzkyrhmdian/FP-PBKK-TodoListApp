# Backend TodoFlow (NestJS)

Backend ini menangani autentikasi pengguna, manajemen todo, upload gambar, pencarian user, akses todo publik, serta reminder email otomatis.

## Latar Belakang

Kebutuhan utama sistem adalah menyediakan API yang aman dan terstruktur untuk aplikasi todo multi-user, sekaligus mendukung fitur kolaboratif ringan (todo publik) dan notifikasi deadline.

## Solusi Teknis

- Framework: NestJS
- ORM: Prisma
- Database: SQLite
- Auth: JWT access token + refresh token
- Upload: Multer (penyimpanan ke folder uploads)
- Scheduler: @nestjs/schedule (cron harian)
- Email: Nodemailer via @nestjs-modules/mailer + template Handlebars

## Struktur Modul

- auth: register, login, refresh token, logout
- todos: CRUD todo + filter + pagination
- users: pencarian user + lihat todo publik user lain
- upload: upload file gambar untuk todo
- scheduler: cron job reminder deadline
- mail: service pengiriman email reminder

## Konfigurasi Environment

Buat file .env di folder backend-multer:

```env
PORT=3000
JWT_SECRET=test_jwt_secret

MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=your_email@gmail.com
```

## Instalasi dan Menjalankan

```bash
pnpm install
npx prisma generate
npx prisma db push
pnpm run start:dev
```

Server berjalan di http://localhost:3000

## Endpoint Utama

## Auth

- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

## Todo (butuh Authorization: Bearer token)

- POST /todos
- GET /todos
- GET /todos/:id
- PATCH /todos/:id
- DELETE /todos/:id

## User

- GET /users/search?search=...
- GET /users/:id/todos

## Upload

- POST /upload
  - Content-Type: multipart/form-data
  - Field file: image

## Filter Todo (GET /todos)

Parameter query yang didukung:

- search
- priority (high|medium|low)
- category
- isPublic (true|false)
- isCompleted (true|false)
- dueDate
- page

## Reminder Email

- Cron dijalankan setiap hari pukul 08:00 WIB.
- Sistem mencari todo yang due date-nya besok dan belum selesai.
- Jika user memiliki email, sistem mengirim email reminder otomatis.