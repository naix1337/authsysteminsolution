import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface EncryptedPayload {
    iv: string;
    encrypted: string;
    tag: string;
}

export interface SignedRequest {
    payload: string;
    signature: string;
    nonce: string;
    timestamp: number;
}

@Injectable()
export class CryptoService {
    private readonly algorithm = 'aes-256-gcm';
    private readonly signAlgorithm = 'sha256';

    /**
     * Generate RSA key pair (4096-bit)
     */
    generateRSAKeyPair(): { publicKey: string; privateKey: string } {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
        });

        return { publicKey, privateKey };
    }

    /**
     * Encrypt data with AES-256-GCM
     */
    encryptPayload(data: string, key: string): EncryptedPayload {
        const iv = crypto.randomBytes(16);
        const keyBuffer = Buffer.from(key, 'base64');

        const cipher = crypto.createCipheriv(this.algorithm, keyBuffer, iv);

        let encrypted = cipher.update(data, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const tag = cipher.getAuthTag();

        return {
            iv: iv.toString('base64'),
            encrypted: encrypted,
            tag: tag.toString('base64'),
        };
    }

    /**
     * Decrypt AES-256-GCM encrypted payload
     */
    decryptPayload(payload: EncryptedPayload, key: string): string {
        const iv = Buffer.from(payload.iv, 'base64');
        const tag = Buffer.from(payload.tag, 'base64');
        const keyBuffer = Buffer.from(key, 'base64');

        const decipher = crypto.createDecipheriv(this.algorithm, keyBuffer, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(payload.encrypted, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    /**
     * Encrypt with RSA public key
     */
    rsaEncrypt(data: string, publicKey: string): string {
        const buffer = Buffer.from(data, 'utf8');
        const encrypted = crypto.publicEncrypt(
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            buffer,
        );
        return encrypted.toString('base64');
    }

    /**
     * Decrypt with RSA private key
     */
    rsaDecrypt(encryptedData: string, privateKey: string): string {
        const buffer = Buffer.from(encryptedData, 'base64');
        const decrypted = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: 'sha256',
            },
            buffer,
        );
        return decrypted.toString('utf8');
    }

    /**
     * Sign data with HMAC-SHA256
     */
    signRequest(data: string, secret: string): string {
        const hmac = crypto.createHmac(this.signAlgorithm, secret);
        hmac.update(data);
        return hmac.digest('base64');
    }

    /**
     * Verify HMAC signature
     */
    verifySignature(data: string, signature: string, secret: string): boolean {
        const expectedSignature = this.signRequest(data, secret);
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature),
        );
    }

    /**
     * Generate cryptographically secure random nonce
     */
    generateNonce(length: number = 32): string {
        return crypto.randomBytes(length).toString('base64');
    }

    /**
     * Generate AES-256 key
     */
    generateAESKey(): string {
        return crypto.randomBytes(32).toString('base64');
    }

    /**
     * Generate secure random string
     */
    generateSecureRandom(length: number = 16): string {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Hash data with SHA-256
     */
    hash(data: string): string {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Hash password with bcrypt
     */
    async hashPassword(password: string): Promise<string> {
        const bcrypt = require('bcrypt');
        return bcrypt.hash(password, 12);
    }

    /**
     * Verify password with bcrypt
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        const bcrypt = require('bcrypt');
        return bcrypt.compare(password, hash);
    }

    /**
     * Validate timestamp (within ±5 minutes)
     */
    isTimestampValid(timestamp: number): boolean {
        const now = Date.now();
        const diff = Math.abs(now - timestamp);
        const fiveMinutes = 5 * 60 * 1000;
        return diff <= fiveMinutes;
    }

    /**
     * Create signed request object
     */
    createSignedRequest(payload: any, secret: string): SignedRequest {
        const nonce = this.generateNonce();
        const timestamp = Date.now();
        const data = JSON.stringify(payload);

        const toSign = `${data}${nonce}${timestamp}`;
        const signature = this.signRequest(toSign, secret);

        return {
            payload: data,
            signature,
            nonce,
            timestamp,
        };
    }

    /**
     * Verify signed request
     */
    verifySignedRequest(
        request: SignedRequest,
        secret: string,
    ): { valid: boolean; payload?: any; error?: string } {
        // Check timestamp
        if (!this.isTimestampValid(request.timestamp)) {
            return { valid: false, error: 'Request timestamp expired' };
        }

        // Verify signature
        const toSign = `${request.payload}${request.nonce}${request.timestamp}`;
        if (!this.verifySignature(toSign, request.signature, secret)) {
            return { valid: false, error: 'Invalid signature' };
        }

        try {
            const payload = JSON.parse(request.payload);
            return { valid: true, payload };
        } catch (error) {
            return { valid: false, error: 'Invalid payload format' };
        }
    }
}
