import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CryptoService } from '../crypto/crypto.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { v4 as uuidv4 } from 'uuid';

export interface JwtPayload {
    sub: string;
    username: string;
    sessionId: string;
    deviceFingerprint: string;
    iat?: number;
    exp?: number;
}

export interface SessionMetadata {
    userId: string;
    deviceFingerprint: string;
    ipAddress: string;
    timestamp: number;
    userAgent?: string;
}

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private redisService: RedisService,
        private cryptoService: CryptoService,
    ) { }

    async register(dto: RegisterDto) {
        // Check if user exists
        const existingUser = await this.prisma.user.findFirst({
            where: {
                OR: [{ username: dto.username }, { email: dto.email }],
            },
        });

        if (existingUser) {
            throw new UnauthorizedException('Username or email already exists');
        }

        // Hash password
        const hashedPassword = await this.cryptoService.hashPassword(dto.password);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                username: dto.username,
                email: dto.email,
                password: hashedPassword,
            },
        });

        // Create default profile
        await this.prisma.userProfile.create({
            data: {
                userId: user.id,
                displayName: dto.username,
            },
        });

        // Assign default role
        const regularRole = await this.prisma.role.findUnique({
            where: { name: 'REGULAR_USER' },
        });

        if (regularRole) {
            await this.prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: regularRole.id,
                },
            });
        }

        // Log registration
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'USER_REGISTER',
                ipAddress: '0.0.0.0',
                details: `User ${user.username} registered`,
            },
        });

        return {
            id: user.id,
            username: user.username,
            email: user.email,
        };
    }

    async login(
        dto: LoginDto,
        deviceFingerprint: string,
        ipAddress: string,
        userAgent?: string,
    ) {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { username: dto.username },
            include: { roles: { include: { role: true } } },
        });

        if (!user || user.isBanned) {
            throw new UnauthorizedException('Invalid credentials or account banned');
        }

        // Verify password
        const isPasswordValid = await this.cryptoService.verifyPassword(
            dto.password,
            user.password,
        );

        if (!isPasswordValid) {
            // Log failed attempt
            await this.logSecurityEvent(
                user.id,
                'MULTIPLE_FAILED_LOGINS',
                ipAddress,
            );
            throw new UnauthorizedException('Invalid credentials');
        }

        // Create session
        const sessionId = uuidv4();
        const tokens = await this.createSession(
            user.id,
            sessionId,
            deviceFingerprint,
            ipAddress,
            userAgent,
        );

        // Log successful login
        await this.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'USER_LOGIN',
                ipAddress,
                userAgent,
                details: 'Successful login',
            },
        });

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                roles: user.roles.map((r) => r.role.name),
            },
            ...tokens,
        };
    }

    async createSession(
        userId: string,
        sessionId: string,
        deviceFingerprint: string,
        ipAddress: string,
        userAgent?: string,
    ) {
        const accessToken = await this.generateAccessToken(
            userId,
            sessionId,
            deviceFingerprint,
        );
        const refreshToken = await this.generateRefreshToken(userId);

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // Store session in database
        await this.prisma.session.create({
            data: {
                id: sessionId,
                userId,
                token: sessionId,
                deviceFingerprint,
                ipAddress,
                userAgent,
                expiresAt,
            },
        });

        // Store session metadata in Redis (enhanced binding)
        const sessionMetadata: SessionMetadata = {
            userId,
            deviceFingerprint,
            ipAddress,
            timestamp: Date.now(),
            userAgent,
        };
        await this.redisService.setSession(sessionId, sessionMetadata, 3600);

        return { accessToken, refreshToken };
    }

    async generateAccessToken(
        userId: string,
        sessionId: string,
        deviceFingerprint: string,
    ): Promise<string> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        const payload: JwtPayload = {
            sub: userId,
            username: user.username,
            sessionId,
            deviceFingerprint,
        };

        return this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRATION', '15m'),
        });
    }

    async generateRefreshToken(userId: string): Promise<string> {
        const token = this.cryptoService.generateSecureRandom(64);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await this.prisma.refreshToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });

        return token;
    }

    async refresh(refreshToken: string) {
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!tokenRecord || tokenRecord.isRevoked) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (new Date() > tokenRecord.expiresAt) {
            throw new UnauthorizedException('Refresh token expired');
        }

        // Revoke old token
        await this.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { isRevoked: true },
        });

        // Create new session (simplified - would need device info in real scenario)
        const sessionId = uuidv4();
        const newAccessToken = await this.generateAccessToken(
            tokenRecord.userId,
            sessionId,
            'refresh',
        );
        const newRefreshToken = await this.generateRefreshToken(tokenRecord.userId);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    async validateSession(
        sessionId: string,
        deviceFingerprint: string,
        ipAddress: string,
    ): Promise<boolean> {
        // Get session metadata from Redis
        const sessionData = await this.redisService.getSession<SessionMetadata>(
            sessionId,
        );

        if (!sessionData) {
            return false;
        }

        // Validate device fingerprint
        if (sessionData.deviceFingerprint !== deviceFingerprint) {
            await this.logSecurityEvent(
                sessionData.userId,
                'DEVICE_CHANGE',
                ipAddress,
            );
            return false;
        }

        // Validate IP (with tolerance for minor changes)
        if (sessionData.ipAddress !== ipAddress) {
            const riskScore = await this.calculateIPChangeRisk(
                sessionData.ipAddress,
                ipAddress,
            );
            if (riskScore > 70) {
                await this.logSecurityEvent(
                    sessionData.userId,
                    'IP_CHANGE',
                    ipAddress,
                );
                return false;
            }
        }

        // Validate timestamp (session not too old)
        const age = Date.now() - sessionData.timestamp;
        if (age > 3600000) {
            // 1 hour
            return false;
        }

        return true;
    }

    async logout(sessionId: string) {
        await this.prisma.session.update({
            where: { id: sessionId },
            data: { isActive: false },
        });
        await this.redisService.delSession(sessionId);
    }

    private async calculateIPChangeRisk(
        oldIP: string,
        newIP: string,
    ): Promise<number> {
        // Simple risk calculation - in production, use GeoIP
        if (oldIP === newIP) return 0;

        // Check if IPs are in same subnet
        const oldParts = oldIP.split('.');
        const newParts = newIP.split('.');

        let matchingOctets = 0;
        for (let i = 0; i < 4; i++) {
            if (oldParts[i] === newParts[i]) matchingOctets++;
        }

        // More matching octets = lower risk
        return 100 - matchingOctets * 25;
    }

    private async logSecurityEvent(
        userId: string,
        type: string,
        ipAddress: string,
    ) {
        await this.prisma.securityEvent.create({
            data: {
                userId,
                type: type as any,
                description: `Security event: ${type}`,
                ipAddress,
                severity: 7,
            },
        });
    }
}
