import { Module } from '@nestjs/common';
import { LoaderService } from './loader.service';
import { LoaderController } from './loader.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [LoaderController],
    providers: [LoaderService],
    exports: [LoaderService],
})
export class LoaderModule { }
