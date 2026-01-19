import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HandshakeDto {
    @ApiProperty()
    @IsString()
    clientVersion: string;

    @ApiProperty()
    @IsString()
    deviceFingerprint: string;
}

export class LoaderLoginDto {
    @ApiProperty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsString()
    deviceFingerprint: string;

    @ApiProperty()
    @IsString()
    signedChallenge: string;
}

export class HeartbeatDto {
    @ApiProperty()
    @IsString()
    sessionToken: string;

    @ApiProperty()
    @IsString()
    nonce: string;

    @ApiProperty()
    timestamp: number;

    @ApiProperty()
    @IsString()
    signature: string;
}
