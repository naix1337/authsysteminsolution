import { Module } from '@nestjs/common';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';

@Module({
    providers: [RateLimitMiddleware],
    exports: [RateLimitMiddleware],
})
export class SecurityModule { }
