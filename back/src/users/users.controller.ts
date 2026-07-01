import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UserEntity } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto, @CurrentUser() user: UserEntity) {
    return this.usersService.updateRole(id, user, dto.role);
  }

  @Patch('me/password')
  async updatePassword(@Body() dto: UpdatePasswordDto, @CurrentUser() user: UserEntity) {
    await this.usersService.updatePassword(user, dto.currentPassword, dto.newPassword);
    return { message: 'Password updated' };
  }

  @Patch('me/email')
  async updateEmail(@Body() dto: UpdateEmailDto, @CurrentUser() user: UserEntity) {
    await this.usersService.updateEmail(user, dto.newEmail, dto.password);
    return { message: 'Email updated' };
  }
}
