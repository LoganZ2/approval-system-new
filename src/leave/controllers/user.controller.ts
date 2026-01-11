import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
  UseGuards
} from '@nestjs/common';
import { User } from '../types';
import axios, { get, post, request } from 'axios';
import * as https from "https";
import { UserService } from '../services/user.service';
import { RegisteredGuard } from 'src/common/guards/registered.guard';

const axiosWx = axios.create({httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }), baseURL: "https://api.weixin.qq.com"});

@Controller('user')
@UseGuards(RegisteredGuard)
export class UserController {
  constructor(private readonly userService: UserService) {

  }

  @Get("/detail")
  async detail(@Headers('x-wx-openid') openid: string) {
    return await this.userService.detail(openid);;
  }

  @Post("/register")
  async register(@Headers('x-wx-openid') openid: string, @Body() user: User) {
    await this.userService.register(openid, user);
  }

  @Get("/department-list")
  departmentList() {
    return [
        '出口部',
        '有色部',
        '物流部',
        '综合部'
    ]
  }
}