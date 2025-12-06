import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Lista: Precisa estar Logado (Auth) E ser Admin
  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Deletar: Precisa estar Logado (Auth) E ser Admin
  @UseGuards(AuthGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
