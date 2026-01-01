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



  @Get("/test-send")
  async testSend(@Headers('x-wx-openid') openid: String) {
    let result;
    try {
      result = await axiosWx.get("/cgi-bin/token", {
        params: {
          grant_type: "client_credential",
          appid: process.env.appid,
          secret: process.env.secret,
        }
      })
    } catch(error) {
      console.log("token")
        // error 是 AxiosError 实例
  console.log('错误类型:', error.constructor.name); // AxiosError
  
  // 检查是否为 Axios 错误
  if (axios.isAxiosError(error)) {
    console.log('这是一个 Axios 错误');
    
    // 错误类型判断
    if (error.response) {
      // 服务器返回了错误状态码 (4xx, 5xx)
      console.log('状态码:', error.response.status);
      console.log('响应数据:', error.response.data);
      console.log('响应头:', error.response.headers);
      
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.log('请求已发送但无响应');
      console.log('请求对象:', error.request);
      
    } else {
      // 请求配置出错
      console.log('请求配置错误:', error.message);
    }
    
    // 错误代码
    console.log('错误代码:', error.code); // 如: 'ECONNABORTED', 'ERR_NETWORK'
    console.log('错误信息:', error.message);
  } else {
    // 非 Axios 错误
    console.log('非 Axios 错误:', error);
  }
    }

    try {
      if (result.data.access_token) {
        const sendRes = await axiosWx.post("/cgi-bin/message/subscribe/send", {
          template_id: "v89d550adOnkXBOIHJcfCntqp5jOTWMZhEYLAhSRZJI",
          touser: openid,
          data: {
            phrase2: {
              DATA: "phr2"
            },
            date3: {
              DATA: "dt3"
            },
            date4: {
              DATA: "dt4"
            },
            phrase5: {
              DATA: "phr2"
            },
          },
          miniprogram_state: "developer",
          lang: "zh_CN"
        }, {
          params: {
            access_token: result.data.access_token
          }
        })
        return sendRes.data;
      }
    } catch(error) {
        // error 是 AxiosError 实例
  console.log('错误类型:', error.constructor.name); // AxiosError
  
  // 检查是否为 Axios 错误
  if (axios.isAxiosError(error)) {
    console.log('这是一个 Axios 错误');
    
    // 错误类型判断
    if (error.response) {
      // 服务器返回了错误状态码 (4xx, 5xx)
      console.log('状态码:', error.response.status);
      console.log('响应数据:', error.response.data);
      console.log('响应头:', error.response.headers);
      
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.log('请求已发送但无响应');
      console.log('请求对象:', error.request);
      
    } else {
      // 请求配置出错
      console.log('请求配置错误:', error.message);
    }
    
    // 错误代码
    console.log('错误代码:', error.code); // 如: 'ECONNABORTED', 'ERR_NETWORK'
    console.log('错误信息:', error.message);
  } else {
    // 非 Axios 错误
    console.log('非 Axios 错误:', error);
  }
    }

    return result.data
  }
}