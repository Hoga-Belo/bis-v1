import { IsString, IsNotEmpty, MinLength, Matches, IsOptional } from 'class-validator';
import { Match } from '../../../common/decorators/match.decorator';

export class ChangePasswordDto {
  @IsString()
  @IsOptional()
  oldPassword?: string; // Optional jika isFirstLogin = true

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @Match('newPassword', { message: 'Confirm password must match new password' })
  confirmPassword: string;
}
