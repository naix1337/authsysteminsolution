import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_SECRET'),
            ignoreExpiration: false,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: {
                roles: {
                    include: { role: true },
                },
            },
        });

        if (!user || user.isBanned) {
            throw new UnauthorizedException('User not found or banned');
        }

        return {
            userId: payload.sub,
            username: payload.username,
            sessionId: payload.sessionId,
            deviceFingerprint: payload.deviceFingerprint,
            roles: user.roles.map((r) => r.role.name),
        };
    }
}
