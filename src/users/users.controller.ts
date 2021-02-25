import { Controller, Get, Post, Body, Put, Param, Delete, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto, UpdateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

const bodyParsePipe = new ValidationPipe({ transform: true, whitelist: true });

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body(bodyParsePipe) createUserDto: UserDto): Promise<void> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':nin')
  async findOne(@Param('nin') nin: string): Promise<User> {
    return this.usersService.findOne(nin);
  }

  @Put(':nin')
  update(
    @Param('nin') nin: string,
    @Body(bodyParsePipe) updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(nin, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
