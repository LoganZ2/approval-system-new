import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Headers
} from '@nestjs/common';
import { User } from '../types';
import axios, { get, post, request } from 'axios';
import * as https from "https";
import { UserService } from '../services/user.service';

const axiosWx = axios.create({httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }), baseURL: "https://api.weixin.qq.com"});

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {

  }

  @Get("/check")
  async check(@Headers('x-wx-openid') openid: string) {
    return await this.userService.check(openid);
  }

  @Post("/register")
  async register(@Headers('x-wx-openid') openid: string, @Body() user: User) {
    await this.userService.register(openid, user);
  }
}