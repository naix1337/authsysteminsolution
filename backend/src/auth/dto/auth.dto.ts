import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'user123' })
    @IsString()
    @MinLength(3)
    username: string;

    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ required: false })
    @IsString()
    licenseKey?: string;
}

export class LoginDto {
    @ApiProperty({ example: 'user123' })
    @IsString()
    username: string;

    @ApiProperty({ example: 'SecurePass123!' })
    @IsString()
    password: string;
}

export class RefreshTokenDto {
    @ApiProperty()
    @IsString()
    refreshToken: string;
}
