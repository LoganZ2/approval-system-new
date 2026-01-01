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
import * as https from "https";

const axiosWx = axios.create({httpsAgent: new https.Agent({
    rejectUnauthorized: false
  }), baseURL: "https://api.weixin.qq.com"});

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
    
    const result = await axiosWx.get("/cgi-bin/token", {
      params: {
        grant_type: "client_credential",
        appid: "wxf856b23502197227",
        secret: "b8f5352fea99559bff3ab4f9d9749a8c",
      }
    })
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
    return result.data
  }
}