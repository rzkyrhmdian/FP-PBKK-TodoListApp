import { 
  Controller, 
  Get, 
  Patch, 
  Post, 
  Body, 
  Param, 
  Query, 
  Request, 
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

interface RequestWithUser extends Request {
  user: {
    id: string;
    username: string;
    email: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET CURRENT USER PROFILE & STATS (Fase 1.5)
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: RequestWithUser) {
    return this.usersService.getProfile(req.user.id);
  }

  // UPDATE CURRENT USER PROFILE (Fase 1.5)
  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.id, updateProfileDto);
  }

  // CHANGE PASSWORD (Fase 1.5)
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(req.user.id, changePasswordDto);
  }

  @Get('search')
  searchUsers(@Query('search') search: string) {
    return this.usersService.searchUsers(search);
  }

  @Get(':id/todos')
  getUserPublicTodos(@Param('id') id: string) {
    return this.usersService.getUserPublicTodos(id);
  }
}
