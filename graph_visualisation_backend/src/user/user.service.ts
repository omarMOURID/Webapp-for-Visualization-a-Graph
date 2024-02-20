import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { EntityManager, In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from "bcrypt";
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationSchema } from 'src/schema/pagination.schema';
import { UpdatePasswordDto } from './dto/update-password.dto';

/**
 * Service responsible for handling user-related database operations.
 */
@Injectable()
export class UserService {
    constructor(
        private readonly entityManager: EntityManager,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}

    /**
     * Creates a new user.
     * @param createUserDto The data necessary to create a new user.
     * @returns The created user.
     */
    async createUser(createUserDto: CreateUserDto): Promise<User> {
        try {
            const { firstname, lastname, email, password, confirmPassword, role } = createUserDto;

            // Check if new password and confirm password match
            if (password !== confirmPassword) {
                throw new BadRequestException("Passwords do not match.");
            }

            // Generate a salt and hash the password
            const passwordSalt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, passwordSalt);

            // Create a new user entity
            const user = new User({
                firstname: firstname,
                lastname: lastname,
                email: email,
                password: hashedPassword,
                passwordSalt: passwordSalt,
                roles: role
            });

            // Save the user to the database
            await this.userRepository.save(user);

            return user;
        } catch(error) {
            // Handle specific error types, e.g., unique constraint violation
            if (error.code === "ER_DUP_ENTRY") {
                throw new ConflictException('Email already exists');
            }
            // Handle other errors or rethrow
            throw error;
        }
    }

    /**
     * Updates the information of a user.
     * @param id The ID of the user to update.
     * @param updateUserDto The data to update the user.
     * @returns A Promise that resolves to void.
     */
    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<void> {
        const { firstname, lastname, role } = updateUserDto;
        const user = await this.userRepository.findOneBy({id});
        if (!user) {
            throw new NotFoundException("User not found")
        }

        firstname && (user.firstname = firstname);
        lastname && (user.lastname = lastname);
        role && (user.roles = role);

        await this.userRepository.save(user);

        return;
    } 
    
    /**
    * Update user password.
    * @param id The id of the user.
    * @param updatePasswordDto The DTO containing old and new passwords.
    */
    async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<void> {
        const { oldPassword, password, confirmPassword } = updatePasswordDto;

        // Find user by id
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException("User not found");
        }

        // Check if old password matches
        const passwordIsMatched = await bcrypt.compare(oldPassword, user.password);
        if (!passwordIsMatched) {
            throw new BadRequestException("Incorrect old password.");
        }

        // Check if new password and confirm password match
        if (password !== confirmPassword) {
            throw new BadRequestException("Passwords do not match.");
        }

        // Generate a salt and hash the new password
        const passwordSalt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, passwordSalt);

        // Update user password and save
        user.password = hashedPassword;
        user.passwordSalt = passwordSalt;
        await this.userRepository.save(user);

        return;
    }

    /**
     * Finds a user by ID.
     * @param id The ID of the user to retrieve.
     * @returns The user with the specified ID.
     */
    async findById(id: string): Promise<User> {
        const user = await this.userRepository.findOneBy({id});
        if (!user) {
            throw new NotFoundException("User not found")
        }

        return user;
    }

    /**
     * Retrieves a paginated list of users.
     * @param page The page number.
     * @param size The number of items per page.
     * @returns A paginated list of users.
     */
    async find(page: number = 1, size: number = 10): Promise<PaginationSchema<User>> {
        const options = {
            skip: (page - 1) * size,
            take: size,
            where: {},
        }

        // Fetch users based on pagination options
        const users = await this.userRepository.find(options);

        // Fetch total count of users (for pagination metadata)
        const count = await this.userRepository.count();

        // Construct and return pagination result
        return {
            items: users,
            pages: Math.ceil(count / size),
            size,
            count,
        };
    }

    /**
     * Deletes multiple users by their IDs.
     * @param ids The array of user IDs to delete.
     * @returns A Promise that resolves to void.
     */
    async delete(ids: string[]): Promise<void> {
        try {
            // Check if the array of IDs is not empty
            if (ids.length === 0) {
                throw new BadRequestException('Array of user IDs is empty');
            }

            // Use TypeORM transaction for atomic operations
            await this.entityManager.transaction(async transactionalEntityManager => {
                // Delete users from the database
                const result = await transactionalEntityManager.delete(User, { id: In(ids) });

                // Check if all specified users were found for deletion
                if (result.affected !== ids.length) {
                    if (ids.length === 1) {
                        throw new NotFoundException('Specified user was not found for deletion.');
                    }
                    throw new BadRequestException('Not all specified users were found for deletion.');
                }
            });

            return;
        } catch(error) {
            throw error;
        }
    }
}
