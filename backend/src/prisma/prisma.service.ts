import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
        console.log('✅ Database connected');
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log('👋 Database disconnected');
    }

    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot clean database in production');
        }

        const models = Reflect.ownKeys(this).filter(
            (key) => key[0] !== '_' && key[0] !== '$',
        );

        return Promise.all(
            models.map((modelKey) => {
                const model = this[modelKey as any];
                if (model && typeof model.deleteMany === 'function') {
                    return model.deleteMany();
                }
            }),
        );
    }
}
