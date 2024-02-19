import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    // Import PassportModule and configure it to use JWT authentication
    PassportModule.register({ defaultStrategy: "jwt"}),

    // Import JwtModule and configure it asynchronously using the ConfigService
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.getOrThrow<string>("JWT_SECRET"),
          signOptions: {
            expiresIn: configService.getOrThrow<string | number>("JWT_EXPIRE")
          }
        };
      }
    }),

    // Import TypeOrmModule and specify the User entity
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AuthService, JwtStrategy], // Provide AuthService and JwtStrategy
  controllers: [AuthController], // Declare AuthController
  exports: [JwtStrategy, PassportModule] // Export JwtStrategy and PassportModule for use in other modules
})
export class AuthModule {}
