import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('upload')
export class UploadController {
  
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image')) 
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    
    if (!file) {
      throw new BadRequestException('File is not valid or missing');
    }

    return { 
      imagePath: `uploads/${file.filename}` 
    };
  }
}