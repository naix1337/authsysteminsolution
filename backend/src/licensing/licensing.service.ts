import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LicenseType, LicenseStatus } from '@prisma/client';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class LicensingService {
    constructor(
        private prisma: PrismaService,
        private cryptoService: CryptoService,
    ) { }

    async generateKey(type: LicenseType, maxDevices: number = 1, durationDays?: number) {
        const key = this.generateLicenseKey();

        let expiresAt: Date | null = null;
        if (type === 'TRIAL' || type === 'SUBSCRIPTION') {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + (durationDays || 30));
        }

        const license = await this.prisma.license.create({
            data: {
                key,
                type,
                status: 'ACTIVE',
                maxDevices,
                expiresAt,
            },
        });

        return license;
    }

    async activateLicense(
        licenseKey: string,
        userId: string,
        deviceFingerprint: string,
        ipAddress: string,
    ) {
        const license = await this.prisma.license.findUnique({
            where: { key: licenseKey },
            include: { activations: true },
        });

        if (!license) {
            throw new Error('Invalid license key');
        }

        if (license.status !== 'ACTIVE') {
            throw new Error(`License is ${license.status.toLowerCase()}`);
        }

        if (license.expiresAt && new Date() > license.expiresAt) {
            await this.prisma.license.update({
                where: { id: license.id },
                data: { status: 'EXPIRED' },
            });
            throw new Error('License expired');
        }

        if (license.activations.length >= license.maxDevices) {
            throw new Error('Maximum devices reached');
        }

        // Check if already activated on this device
        const existing = license.activations.find(
            (a) => a.deviceFingerprint === deviceFingerprint && a.isActive,
        );
        if (existing) {
            return { message: 'Already activated on this device' };
        }

        // Activate
        await this.prisma.licenseActivation.create({
            data: {
                licenseId: license.id,
                deviceFingerprint,
                ipAddress,
            },
        });

        // Assign to user if not already
        if (!license.userId) {
            await this.prisma.license.update({
                where: { id: license.id },
                data: { userId, activatedAt: new Date() },
            });
        }

        return { message: 'License activated successfully' };
    }

    async validateLicense(userId: string) {
        const license = await this.prisma.license.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
            },
        });

        if (!license) {
            return { valid: false, reason: 'No active license' };
        }

        if (license.expiresAt && new Date() > license.expiresAt) {
            await this.prisma.license.update({
                where: { id: license.id },
                data: { status: 'EXPIRED' },
            });
            return { valid: false, reason: 'License expired' };
        }

        return { valid: true, license };
    }

    private generateLicenseKey(): string {
        const parts = [];
        for (let i = 0; i < 4; i++) {
            const part = this.cryptoService
                .generateSecureRandom(4)
                .toUpperCase()
                .substring(0, 4);
            parts.push(part);
        }
        return parts.join('-');
    }
}
