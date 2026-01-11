import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/leave/services/user.service';

@Injectable()
export class RegisteredGuard implements CanActivate {

  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const openid = request.headers['x-wx-openid']; 

    if (!openid) {
      throw new UnauthorizedException('未提供身份标识');
    }

    const user = await this.userService.check(openid)

    if (!user) {
        throw new UnauthorizedException('用户未注册'); 
    }

    return true;
  }
}