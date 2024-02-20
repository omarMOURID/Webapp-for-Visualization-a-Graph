import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, Put, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { User, UserRole } from './user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { HasRoles } from 'src/auth/has-roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Request } from 'express';
import { PaginationSchema } from 'src/schema/pagination.schema';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

/**
 * Controller responsible for handling user-related operations.
 */
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}
    
    /**
     * Creates a new user.
     * @param createUserDto The data necessary to create a new user.
     * @returns The created user.
     * @permissions ADMIN
     */
    @Post()
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        const user = await this.userService.createUser(createUserDto); 
        return user;
    }

    /**
     * Updates the information of the current user.
     * @param request The incoming request.
     * @param updateUserDto The data to update the user.
     * @returns A Promise that resolves to void.
     * @permissions USER, ADMIN
     */
    @Put()
    @HasRoles(UserRole.USER, UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    async updateCurrentUser(@Req() request: Request, @Body() updateUserDto: UpdateUserDto): Promise<void> {
        const user: User = request.user as User;
        await this.userService.updateUser(user.id, updateUserDto);
        return;
    }

   /**
     * Updates the password of the current user.
     * @param request The incoming request containing the authenticated user.
     * @param updatePasswordDto The DTO containing the new password.
     * @returns A Promise that resolves to void.
     * @permissions USER, ADMIN
     */
    @Put("/password")
    @HasRoles(UserRole.USER, UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    async updateUserPassword(@Req() request: Request, @Body() updatePasswordDto: UpdatePasswordDto): Promise<void> {
        // Extract the authenticated user from the request
        const user: User = request.user as User;
        
        // Call the service method to update the password
        await this.userService.updatePassword(user.id, updatePasswordDto);

        return; // Return void as the response
    }

    /**
     * Updates the information of a specific user.
     * @param id The ID of the user to update.
     * @param updateUserDto The data to update the user.
     * @returns A Promise that resolves to void.
     * @permissions ADMIN
     */
    @Put(":id")
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    async updateUser(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto): Promise<void> {
        await this.userService.updateUser(id, updateUserDto);
        return;
    }

    /**
     * Retrieves information about the current user.
     * @param request The incoming request.
     * @param id The ID of the user (not used).
     * @returns The current user.
     * @permissions USER, ADMIN
     */
    @Get("current")
    @HasRoles(UserRole.USER, UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    async getCurrentUser(@Req() request: Request, @Param("id") id: string): Promise<User> {
        const user: User = request.user as User;
        return user;
    }

    /**
     * Retrieves information about a specific user by ID.
     * @param id The ID of the user to retrieve.
     * @returns The user with the specified ID.
     * @permissions ADMIN
     */
    @Get(":id")
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    async findUser(@Param("id") id: string): Promise<User> {
        return this.userService.findById(id);
    }

    /**
     * Retrieves a paginated list of users.
     * @param findUsersDto The pagination parameters.
     * @returns A paginated list of users.
     * @permissions ADMIN
     */
    @Get()
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    async findUsers(@Query() findUsersDto: FindUsersDto): Promise<PaginationSchema<User>> {
        return await this.userService.find(findUsersDto.page, findUsersDto.size);
    }
}
