import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';

@Module({
  imports: [
    // Import TypeOrmModule and specify the User entity
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UserService], // Declare UserService as a provider
  controllers: [UserController], // Declare UserController as a controller
})
export class UserModule {}
