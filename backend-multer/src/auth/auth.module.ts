import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module'; 
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RtStrategy } from './strategy/rt.strategy';  
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'test_jwt_secret',
      signOptions: { expiresIn: '15m' },
    }), 
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    RtStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}