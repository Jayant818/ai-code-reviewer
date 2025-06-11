import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res , UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './gaurds/local-auth/local-auth.guard';
import { GithubAuthGuard } from './gaurds/github-auth/github-auth.guard';
import { ConfigService } from '@nestjs/config';
import { RefreshJwtAuthGuard } from './gaurds/refresh-jwt-auth/refresh-jwt-auth.guard';
import { Public } from '@app/framework';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Req() req) {
    // also attach the JWT 
    return this.authService.login(req.user.id);
  }

  @Get("refreshToken")
  @UseGuards(RefreshJwtAuthGuard)
  async refreshToken(@Req() req) { 
    return this.authService.refreshToken(req.user.id);
  }

  @Public()
  @UseGuards(GithubAuthGuard)
  @Get('/github/login')
  async githubLogin() {}

  @UseGuards(GithubAuthGuard)
  @Get('/github/callback')
  async githubCallback(@Req() req, @Res() res) {
    // This will be called after the user is authenticated
    // and we can get the user data from the request


    // Now create JWT Access Token & Refresh token and send it to the client 
    const response = await this.authService.login(req.user._id);
    
    res.redirect(`
        ${this.configService.get<string>('FRONTEND_URL')}/${this.configService.get<string>('REDIRECT_LOGIN_URL')}?token=${response.accessToken}&refreshToken=${response.refreshToken}
      `)
  }

  @Get('logout')
  async logout(@Req() req) {
    await this.authService.logout(req.user.id);
  }


}
