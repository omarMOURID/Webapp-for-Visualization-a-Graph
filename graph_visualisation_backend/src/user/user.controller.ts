import { Body, ClassSerializerInterceptor, Controller, Get, Param, Post, Put, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger'; // Import necessary decorators
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
import { BlockUserDto } from './dto/block-user.dto';

@ApiTags('user') // Tag the controller with 'user' for Swagger documentation
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Creates a new user (ADMIN)' }) // Add operation summary
    @ApiBody({ type: CreateUserDto }) // Specify the DTO type for request body
    @ApiResponse({ type: User, status: 201, description: 'Returns the created user.' }) // Specify the response status and description
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @Post()
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Updates the information of the current user (ADMIN, USER)' }) // Add operation summary
    @ApiBody({ type: UpdateUserDto }) // Specify the DTO type for request body
    @ApiResponse({ status: 200, description: 'Returns void.' }) // Specify the response status and description
    @HasRoles(UserRole.USER, UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Put()
    async updateCurrentUser(@Req() request: Request, @Body() updateUserDto: UpdateUserDto): Promise<void> {
        const user: User = request.user as User;
        await this.userService.updateUser(user.id, updateUserDto);
        return;
    }

    /**
     * Updates the block status of a user.
     * @param id The ID of the user to update.
     * @param blockUserDto The data to update the user's block status.
     * @returns A Promise that resolves to void.
     * @permissions ADMIN
    */
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Updates the block status of a user (ADMIN)' }) // Add operation summary
    @ApiBody({ type: BlockUserDto }) // Specify the DTO type for request body
    @ApiResponse({ status: 200, description: 'Returns void.' }) // Specify the response status and description
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Put("/block/:id")
    async updateBlockUser(
        @Param("id") id: string, // The ID of the user to update
        @Body() blockUserDto: BlockUserDto // The data to update the user's block status
    ): Promise<void> {
        // Update the block status of the user with the specified ID
        await this.userService.updateBlockUser(id, blockUserDto);
        return;
    }


   /**
     * Updates the password of the current user.
     * @param request The incoming request containing the authenticated user.
     * @param updatePasswordDto The DTO containing the new password.
     * @returns A Promise that resolves to void.
     * @permissions USER, ADMIN
     */
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Updates the password of the current user (ADMIN, USER)' }) // Add operation summary
    @ApiBody({ type: UpdatePasswordDto }) // Specify the DTO type for request body
    @ApiResponse({ status: 200, description: 'Returns void.' }) // Specify the response status and description
    @HasRoles(UserRole.USER, UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Put("/password")
    async updateUserPassword(@Req() request: Request, @Body() updatePasswordDto: UpdatePasswordDto): Promise<void> {
        const user: User = request.user as User;
        await this.userService.updatePassword(user.id, updatePasswordDto);
        return;
    }

    /**
     * Updates the information of a specific user.
     * @param id The ID of the user to update.
     * @param updateUserDto The data to update the user.
     * @returns A Promise that resolves to void.
     * @permissions ADMIN
     */
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Updates the information of a specific user (ADMIN)' }) // Add operation summary
    @ApiParam({ name: 'id', description: 'The ID of the user to update' }) // Specify the parameter in the path
    @ApiBody({ type: UpdateUserDto }) // Specify the DTO type for request body
    @ApiResponse({ status: 200, description: 'Returns void.' }) // Specify the response status and description
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Put(":id")
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Retrieves information about the current user (ADMIN, USER)' }) // Add operation summary
    @ApiQuery({ name: 'id', description: 'The ID of the user (not used)' }) // Specify the parameter in the query
    @ApiResponse({ type: User, status: 200, description: 'Returns the current user.' }) // Specify the response status and description
    @HasRoles(UserRole.USER, UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get("current")
    async getCurrentUser(@Req() request: Request): Promise<User> {
        const user: User = request.user as User;
        return user;
    }

    /**
     * Retrieves information about a specific user by ID.
     * @param id The ID of the user to retrieve.
     * @returns The user with the specified ID.
     * @permissions ADMIN
     */
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Retrieves information about a specific user by ID (ADMIN)' }) // Add operation summary
    @ApiParam({ name: 'id', description: 'The ID of the user to retrieve' }) // Specify the parameter in the path
    @ApiResponse({ type: User, status: 200, description: 'Returns the user with the specified ID.' }) // Specify the response status and description
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get(":id")
    async findUser(@Param("id") id: string): Promise<User> {
        return this.userService.findById(id);
    }

    /**
     * Retrieves a paginated list of users.
     * @param findUsersDto The pagination parameters.
     * @returns A paginated list of users.
     * @permissions ADMIN
     */
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Retrieves a paginated list of users (ADMIN)' }) // Add operation summary
    @ApiQuery({ name: 'page', description: 'The page number for pagination', required: false }) // Specify the parameter in the query
    @ApiQuery({ name: 'size', description: 'The number of items per page for pagination', required: false }) // Specify the parameter in the query
    @ApiResponse({ status: 200, description: 'Returns a paginated list of users.' }) // Specify the response status and description
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    async findUsers(@Query() findUsersDto: FindUsersDto): Promise<PaginationSchema<User>> {
        return await this.userService.find(findUsersDto.page, findUsersDto.size);
    }
}
