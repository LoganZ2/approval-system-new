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
import { Application, ApproveInfo, LeaveType, PendingApproval } from '../types';
import axios from 'axios';
import * as https from "https";

// const axiosWx = axios.create({httpsAgent: new https.Agent({
//     rejectUnauthorized: false
//   }), baseURL: "https://api.weixin.qq.com"});

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {

  }

  @Get("/applications")
  async selectApplicationByUserId(@Headers('x-wx-openid') openid: string): Promise<Application[]> {
    const result = await this.leaveService.selectApplicationByOpenid(openid);
    return result;
  }

  @Get("/pending-approvals")
  async selectPendingApprovalByOpenid(@Headers('x-wx-openid') openid: string): Promise<PendingApproval[]> {
    const result = await this.leaveService.selectPendingApprovalByOpenid(openid);
    return result;
  }

  @Post("/apply")
  async apply(@Headers('x-wx-openid') openid: string, @Body() application: Application) {
    await this.leaveService.apply(openid, application);
  }

  @Post("/approve")
  async approve(@Headers('x-wx-openid') openid: string, @Body() approveInfo: ApproveInfo) {
    await this.leaveService.approve(openid, approveInfo);
  }



  // @Get("/test-send")
  // async testSend(@Headers('x-wx-openid') openid: string) {
    
  //   const result = await axiosWx.get("/cgi-bin/token", {
  //     params: {
  //       grant_type: "client_credential",
  //       appid: process.env.appid,
  //       secret: process.env.secret,
  //     }
  //   })
  //   if (result.data.access_token) {
  //     const sendRes = await axiosWx.post("/cgi-bin/message/subscribe/send", {
  //       template_id: "v89d550adOnkXBOIHJcfCntqp5jOTWMZhEYLAhSRZJI",
  //       touser: openid,
  //       data: {
  //         phrase2: {
  //           value: "事假"
  //         },
  //         date3: {
  //           value: "2019-01-05"
  //         },
  //         date4: {
  //           value: "2019-01-07"
  //         },
  //         phrase5: {
  //           value: "待审批"
  //         },
  //       },
  //       miniprogram_state: "developer",
  //       lang: "zh_CN"
  //     }, {
  //       params: {
  //         access_token: result.data.access_token
  //       }
  //     })
  //     return sendRes.data;
  //   }
  //   return result.data
  // }
}