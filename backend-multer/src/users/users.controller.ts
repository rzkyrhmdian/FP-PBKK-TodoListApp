import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  searchUsers(@Query('search') search: string) {
    return this.usersService.searchUsers(search);
  }

  @Get(':id/todos')
  getUserPublicTodos(@Param('id') id: string) {
    return this.usersService.getUserPublicTodos(id);
  }
}
