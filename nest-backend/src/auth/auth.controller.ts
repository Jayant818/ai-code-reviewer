import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res , UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './gaurds/local-auth/local-auth.guard';
import { GithubAuthGuard } from './gaurds/github-auth/github-auth.guard';
import { ConfigService } from '@nestjs/config';
import { RefreshJwtAuthGuard } from './gaurds/refresh-jwt-auth/refresh-jwt-auth.guard';
import { Public } from '@app/framework';
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from 'src/common/constants';
 
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
    return this.authService.login(req.user.id,req.user.org,req.user.username);
  }

  @Get("refreshToken")
  @UseGuards(RefreshJwtAuthGuard)
  async refreshToken(@Req() req) { 
    return this.authService.refreshToken(req.user.id,req.user.org,req.user.username);
  }

  @Public()
  @UseGuards(GithubAuthGuard)
  @Get('/github/login')
  async githubLogin() {}

  @Public()
  @UseGuards(GithubAuthGuard)
  @Get('/github/callback')
  async githubCallback(@Req() req, @Res() res) {
    // This will be called after the user is authenticated
    // and we can get the user data from the request

    // Now create JWT Access Token & Refresh token and send it to the client 
    const response = await this.authService.login(req.user._id,req.user.org,req.user.username);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL')?.trim();

    const redirectPath = this.configService.get<string>('REDIRECT_LOGIN_URL')?.trim();

   res.cookie(ACCESS_TOKEN_COOKIE_NAME, response.accessToken,
      this.authService.generateCookieOptions({
      domain: this.configService.get<string>('DOMAIN_NAME'),
      httpOnly: false,
      expires: new Date(Date.now() + 15 * 60_000), // 15 minutes
      path: '/',
      })
    );

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, response.refreshToken,
      this.authService.generateCookieOptions({
        domain: this.configService.get<string>('DOMAIN_NAME'),
        httpOnly: false,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        path: '/',
      })
    );

    // const redirectUrl = `${frontendUrl}/${redirectPath}`;
      const redirectUrl = 'http://localhost:3000/auth/callback/github';
    res.redirect(redirectUrl);
  }

  @Get('logout')
  async logout(@Req() req,@Res() res) {
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
    await this.authService.logout(req.user.id);
  }


}
