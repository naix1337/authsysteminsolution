import { Controller, Post, Body, Req, Ip, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register new user' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login user' })
    async login(
        @Body() dto: LoginDto,
        @Req() req: Request,
        @Ip() ip: string,
    ) {
        const deviceFingerprint = req.headers['x-device-fingerprint'] as string || 'unknown';
        const userAgent = req.headers['user-agent'];

        return this.authService.login(dto, deviceFingerprint, ip, userAgent);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto.refreshToken);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout user' })
    async logout(@Req() req: any) {
        const sessionId = req.user?.sessionId;
        if (sessionId) {
            await this.authService.logout(sessionId);
        }
        return { message: 'Logged out successfully' };
    }

    @Get('verify')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Verify current session' })
    async verify(@Req() req: any) {
        return {
            valid: true,
            user: req.user,
        };
    }
}
