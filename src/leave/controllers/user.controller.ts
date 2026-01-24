import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../services/user.service';
import { RegisteredGuard } from 'src/common/guards/registered.guard';
import { UpdateInfoRequestResult } from '../types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/detail')
  @UseGuards(RegisteredGuard)
  async detail(@Headers('x-wx-openid') openid: string) {
    return await this.userService.detail(openid);
  }

  @Post('/register')
  async register(
    @Headers('x-wx-openid') openid: string,
    @Body() user: RegisterUserDto,
  ) {
    await this.userService.register(openid, user);
  }

  @Post('/update')
  async updateUser(
    @Headers('x-wx-openid') openid: string,
    @Body() user: UpdateUserDto,
  ) {
    await this.userService.update(openid, user);
  }

  @Get('/department-list')
  departmentList() {
    return ['出口部', '有色部', '物流部', '综合部', '人力部'];
  }

  @Get('/update-info-requests')
  async updateInfoRequests(@Headers("x-wx-openid") openid: string) {
    return await this.userService.updateInfoRequests(openid)
  }

  @Post('/update/approve')
  async approveUpdateInfoRequest(@Headers("x-wx-openid") openid: string, @Body() result: UpdateInfoRequestResult) {
    await this.userService.approveUpdateInfoRequest(openid, result)
  }
}
