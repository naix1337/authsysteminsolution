import { Module } from '@nestjs/common';
import { LicensingService } from './licensing.service';

@Module({
    providers: [LicensingService],
    exports: [LicensingService],
})
export class LicensingModule { }
