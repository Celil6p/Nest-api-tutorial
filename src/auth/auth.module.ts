import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy, JwtStrategy } from './strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy,GoogleStrategy],
  imports: [JwtModule.register({})],
})
export class AuthModule {}
