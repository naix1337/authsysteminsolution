import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
    constructor(private redisService: RedisService) { }

    async use(req: Request, res: Response, next: NextFunction) {
        const ip = req.ip || req.socket.remoteAddress;
        const key = `${ip}:${req.path}`;

        const requests = await this.redisService.incrementRateLimit(key, 60);

        if (requests > 100) {
            // 100 requests per minute
            return res.status(429).json({
                statusCode: 429,
                message: 'Too many requests',
            });
        }

        next();
    }
}
