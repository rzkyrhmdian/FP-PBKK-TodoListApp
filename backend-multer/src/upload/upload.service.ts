import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadsDir = path.resolve(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    // Pastikan direktori uploads tersedia saat inisialisasi
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async deleteFile(filePathOrName: string): Promise<boolean> {
    if (!filePathOrName) return false;

    try {
      // Ambil hanya nama berkas murni (membersihkan awalan 'uploads/', './', '../', dsb.)
      const cleanFileName = path.basename(filePathOrName.trim());
      if (!cleanFileName) return false;

      const targetPath = path.resolve(this.uploadsDir, cleanFileName);

      // Verifikasi Path Traversal: path target wajib berada di dalam folder uploads
      if (!targetPath.startsWith(this.uploadsDir)) {
        this.logger.warn(`Peringatan Keamanan: Upaya path traversal terdeteksi pada path: ${filePathOrName}`);
        throw new BadRequestException('Akses jalur berkas tidak diizinkan');
      }

      // Periksa apakah berkas fisik ada di disk
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath);
        this.logger.log(`Berkas fisik berhasil dihapus dari disk: ${cleanFileName}`);
        return true;
      } else {
        this.logger.warn(`Berkas fisik tidak ditemukan di disk saat akan dihapus: ${cleanFileName}`);
        return false;
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Gagal menghapus berkas ${filePathOrName}:`, error);
      return false;
    }
  }

  // Memindai direktori uploads dan menghapus berkas orphan (berkas yang tidak ditautkan ke Todo manapun di database).   
  async cleanOrphanFiles(minAgeMinutes = 30): Promise<{ scanned: number; deleted: number; files: string[] }> {
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        return { scanned: 0, deleted: 0, files: [] };
      }

      //  Ambil seluruh nama file yang ada di folder uploads disk
      const diskFiles = await fs.promises.readdir(this.uploadsDir);

      // Query seluruh imagePath yang tersimpan di database
      const todos = await this.prisma.todo.findMany({
        where: {
          imagePath: { not: null },
        },
        select: { imagePath: true },
      });

      // Normalisasi daftar nama file dari database ke dalam Set untuk pencarian O(1)
      const dbFileSet = new Set<string>();
      for (const t of todos) {
        if (t.imagePath) {
          dbFileSet.add(path.basename(t.imagePath));
        }
      }

      const now = Date.now();
      const minAgeMs = minAgeMinutes * 60 * 1000;
      const deletedFiles: string[] = [];

      for (const file of diskFiles) {
        const filePath = path.join(this.uploadsDir, file);
        const stats = await fs.promises.stat(filePath);

        // Abaikan jika ternyata berupa subdirektori
        if (stats.isDirectory()) continue;

        // Jika file di disk tidak ada di database dan sudah melebihi batas umur minimal
        if (!dbFileSet.has(file)) {
          const fileAge = now - stats.mtimeMs;
          if (fileAge > minAgeMs) {
            await fs.promises.unlink(filePath);
            deletedFiles.push(file);
            this.logger.log(`Orphan file berhasil dibersihkan: ${file} (umur: ${Math.round(fileAge / 60000)} menit)`);
          }
        }
      }

      this.logger.log(`Pembersihan berkas orphan selesai. Total scan: ${diskFiles.length}, Terhapus: ${deletedFiles.length}`);
      return {
        scanned: diskFiles.length,
        deleted: deletedFiles.length,
        files: deletedFiles,
      };
    } catch (error) {
      this.logger.error('Gagal menjalankan pembersihan berkas orphan:', error);
      return { scanned: 0, deleted: 0, files: [] };
    }
  }

  // Menghitung total berkas dan kapasitas penyimpanan yang digunakan.
  async getStorageStats(): Promise<{ totalFiles: number; totalSizeBytes: number }> {
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        return { totalFiles: 0, totalSizeBytes: 0 };
      }

      const files = await fs.promises.readdir(this.uploadsDir);
      let totalSize = 0;
      let count = 0;

      for (const file of files) {
        const filePath = path.join(this.uploadsDir, file);
        const stats = await fs.promises.stat(filePath);
        if (stats.isFile()) {
          totalSize += stats.size;
          count++;
        }
      }

      return { totalFiles: count, totalSizeBytes: totalSize };
    } catch (error) {
      this.logger.error('Gagal membaca statistik penyimpanan:', error);
      return { totalFiles: 0, totalSizeBytes: 0 };
    }
  }
}

