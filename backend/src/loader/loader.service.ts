import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CryptoService } from '../crypto/crypto.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class LoaderService {
    constructor(
        private prisma: PrismaService,
        private redisService: RedisService,
        private cryptoService: CryptoService,
        private authService: AuthService,
    ) { }

    async handshake(clientVersion: string, deviceFingerprint: string, ipAddress: string) {
        // Generate RSA keypair
        const { publicKey, privateKey } = this.cryptoService.generateRSAKeyPair();
        const nonce = this.cryptoService.generateNonce();
        const challenge = this.cryptoService.generateSecureRandom(32);

        // Store handshake data in Redis (10 minutes)
        await this.redisService.set(
            `handshake:${nonce}`,
            { publicKey, privateKey, challenge, deviceFingerprint },
            600,
        );

        return {
            serverPublicKey: publicKey,
            challenge,
            nonce,
        };
    }

    async loaderLogin(
        username: string,
        password: string,
        deviceFingerprint: string,
        signedChallenge: string,
        nonce: string,
        ipAddress: string,
    ) {
        // Retrieve handshake data
        const handshakeData = await this.redisService.get(`handshake:${nonce}`);
        if (!handshakeData) {
            throw new Error('Invalid or expired handshake');
        }

        // Verify challenge signature (simplified)
        // In production, verify RSA signature properly

        // Use auth service for login
        const result = await this.authService.login(
            { username, password },
            deviceFingerprint,
            ipAddress,
        );

        // Check license
        const license = await this.prisma.license.findFirst({
            where: {
                userId: result.user.id,
                status: 'ACTIVE',
            },
        });

        if (!license) {
            throw new Error('No active license found');
        }

        // Generate AES session key
        const aesKey = this.cryptoService.generateAESKey();
        await this.redisService.set(
            `loader:session:${result.user.id}`,
            { aesKey, deviceFingerprint },
            3600,
        );

        return {
            sessionToken: result.accessToken,
            aesKey,
            licenseInfo: {
                type: license.type,
                expiresAt: license.expiresAt,
                status: license.status,
            },
        };
    }

    async verify(sessionToken: string, deviceFingerprint: string, ipAddress: string) {
        // Decode JWT to get user ID
        // Validate session binding
        return { valid: true, status: 'ok' };
    }

    async heartbeat(
        sessionToken: string,
        nonce: string,
        timestamp: number,
        signature: string,
        ipAddress: string,
    ) {
        // Check nonce hasn't been used
        const nonceUsed = await this.redisService.isNonceUsed(nonce);
        if (nonceUsed) {
            throw new Error('Replay attack detected');
        }

        // Store nonce
        await this.redisService.storeNonce(nonce);

        // Validate timestamp
        if (!this.cryptoService.isTimestampValid(timestamp)) {
            throw new Error('Invalid timestamp');
        }

        // Update last seen
        return { status: 'ok', timestamp: Date.now() };
    }

    async getBanStatus(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            isBanned: user.isBanned,
            banReason: user.banReason,
            bannedAt: user.bannedAt,
        };
    }
}
