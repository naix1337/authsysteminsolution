import { Controller, Post, Get, Body, Ip, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoaderService } from './loader.service';
import { HandshakeDto, LoaderLoginDto, HeartbeatDto } from './dto/loader.dto';

@ApiTags('loader')
@Controller('loader')
export class LoaderController {
    constructor(private loaderService: LoaderService) { }

    @Post('handshake')
    @ApiOperation({ summary: 'Initial handshake for C++ loader' })
    async handshake(@Body() dto: HandshakeDto, @Ip() ip: string) {
        return this.loaderService.handshake(
            dto.clientVersion,
            dto.deviceFingerprint,
            ip,
        );
    }

    @Post('login')
    @ApiOperation({ summary: 'Login from C++ loader' })
    async login(@Body() dto: LoaderLoginDto, @Ip() ip: string) {
        return this.loaderService.loaderLogin(
            dto.username,
            dto.password,
            dto.deviceFingerprint,
            dto.signedChallenge,
            '', // nonce from body
            ip,
        );
    }

    @Post('heartbeat')
    @ApiOperation({ summary: 'Heartbeat from C++ loader' })
    async heartbeat(@Body() dto: HeartbeatDto, @Ip() ip: string) {
        return this.loaderService.heartbeat(
            dto.sessionToken,
            dto.nonce,
            dto.timestamp,
            dto.signature,
            ip,
        );
    }

    @Get('ban-status/:userId')
    @ApiOperation({ summary: 'Get ban status' })
    async getBanStatus(@Param('userId') userId: string) {
        return this.loaderService.getBanStatus(userId);
    }
}
