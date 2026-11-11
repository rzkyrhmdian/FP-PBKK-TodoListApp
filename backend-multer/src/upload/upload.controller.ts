import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is not valid or missing');
    }

    return {
      imagePath: `uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Delete(':filename')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Param('filename') filename: string) {
    if (!filename) {
      throw new BadRequestException('Nama berkas wajib diisi');
    }

    const deleted = await this.uploadService.deleteFile(filename);
    if (!deleted) {
      throw new NotFoundException(`Berkas ${filename} tidak ditemukan pada penyimpanan`);
    }

    return {
      message: 'Berkas berhasil dihapus',
      filename,
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return await this.uploadService.getStorageStats();
  }

  @Post('cleanup')
  @UseGuards(JwtAuthGuard)
  async cleanupOrphanFiles() {
    return await this.uploadService.cleanOrphanFiles(0); // Bersihkan file orphan yang tidak terikat di DB
  }
}
