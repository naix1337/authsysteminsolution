import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CryptoModule } from './crypto/crypto.module';
import { AuthModule } from './auth/auth.module';
import { LoaderModule } from './loader/loader.module';
import { SecurityModule } from './security/security.module';
import { LicensingModule } from './licensing/licensing.module';
import { PermissionsModule } from './permissions/permissions.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        PrismaModule,
        RedisModule,
        CryptoModule,
        AuthModule,
        LoaderModule,
        SecurityModule,
        LicensingModule,
        PermissionsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
