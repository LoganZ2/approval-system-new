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
  Logger
} from '@nestjs/common';
import { LeaveService } from '../services/leave.service';
import { Application, PendingApproval } from '../types';
import axios, { get, post, request } from 'axios';
import * as cloud from "wx-server-sdk";

const axiosWx = axios.create({baseURL: "https://api.weixin.qq.com"});

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {

  }

  @Get("/applications")
  async selectApplicationByUserId(@Query("userId") userId: Number): Promise<Application[]> {
    const result = await this.leaveService.selectApplicationByUserId(userId);
    return result;
  }

  @Get("/pending-approvals")
  async selectPendingApprovalByUserId(@Query("userId") userId: Number): Promise<PendingApproval[]> {
    const result = await this.leaveService.selectPendingApprovalByUserId(userId);
    return result;
  }


  // 建议在文件顶部引入 Logger (如果是 NestJS 标准项目)
  // import { Logger } from '@nestjs/common'; 

  @Get("/test-send")
  async testSend(@Headers('x-wx-openid') openid: string) {
    // 如果你在 NestJS 类中，建议实例化一个 logger，或者是直接用 console
    // const logger = new Logger('WeChatService'); 

    let accessToken = '';

    // ==========================================
    // 第一步：获取 Access Token
    // ==========================================
    try {
      const tokenRes = await axiosWx.get("/cgi-bin/token", {
        params: {
          grant_type: "client_credential",
          appid: process.env.appid,
          secret: process.env.secret,
        }
      });

      // 检查微信业务层面是否报错 (HTTP 200 但返回 errcode)
      if (tokenRes.data && tokenRes.data.errcode && tokenRes.data.errcode !== 0) {
        console.error(`【报错位置：获取Token接口】微信返回业务错误:`, tokenRes.data);
        return { 
          status: 'error', 
          step: 'get_token', 
          message: '微信业务报错', 
          details: tokenRes.data 
        };
      }

      if (!tokenRes.data.access_token) {
        throw new Error(`未获取到 access_token，返回数据异常: ${JSON.stringify(tokenRes.data)}`);
      }

      accessToken = tokenRes.data.access_token;

    } catch (error) {
      // 处理 Token 接口的网络/代码层面异常
      this.logAxiosError(error, '获取AccessToken阶段'); // 调用底下的辅助解析函数
      return { status: 'error', step: 'get_token', message: error.message };
    }

    // ==========================================
    // 第二步：发送订阅消息
    // ==========================================
    try {
      const sendRes = await axiosWx.post("/cgi-bin/message/subscribe/send", {
        template_id: "v89d550adOnkXBOIHJcfCntqp5jOTWMZhEYLAhSRZJI",
        touser: openid,
        data: {
          phrase2: { DATA: "phr2" },
          date3: { DATA: "dt3" },
          date4: { DATA: "dt4" },
          phrase5: { DATA: "phr2" }, // 注意：这里你原本写的是 phr2，确认是否意图如此
        },
        miniprogram_state: "developer",
        lang: "zh_CN"
      }, {
        params: {
          access_token: accessToken
        }
      });

      // 检查发送消息的业务错误
      if (sendRes.data && sendRes.data.errcode && sendRes.data.errcode !== 0) {
        console.error(`【报错位置：发送消息接口】微信返回业务错误:`, sendRes.data);
        return { 
          status: 'error', 
          step: 'send_message', 
          message: '发送失败', 
          details: sendRes.data 
        }; // 这里可以直接返回微信的错误给前端看
      }

      return sendRes.data;

    } catch (error) {
      // 处理 发送 接口的网络/代码层面异常
      this.logAxiosError(error, '发送订阅消息阶段');
      return { status: 'error', step: 'send_message', message: error.message };
    }
  }

  /**
   * 这是一个辅助函数，用来把看不懂的 Axios 错误变成人话
   * 你可以把它放在这个 Controller 类里面作为一个 private 方法
   */
  private logAxiosError(error: any, stageName: string) {
    console.log(`\n============== ❌ 错误发生在：[${stageName}] ==============`);
    
    if (error.response) {
      // 请求已发出，服务器也回复了，但是状态码不是 2xx
      console.error(`1. HTTP状态码: ${error.response.status}`);
      console.error(`2. 接口返回详情:`, JSON.stringify(error.response.data, null, 2));
      console.error(`3. 请求头/参数:`, error.config?.headers || 'N/A');
    } else if (error.request) {
      // 请求发出了，但是没有收到回应 (由网络问题、超时引起)
      console.error(`错误类型: 网络请求无响应 (可能是超时或DNS解析失败)`);
      console.error(`原生请求对象:`, error.request);
    } else {
      // 设置请求时发生了一些事情，触发了错误
      console.error(`错误类型: 代码逻辑/配置错误`);
      console.error(`错误信息: ${error.message}`);
    }
    console.log(`===========================================================\n`);
  }
}