import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// Define enum for roles
export enum UserRole {
    USER = "user",
    ADMIN = "admin"
}

/**
 * Represents a user entity in the database.
 */
@Entity({ name: "user" })
export class User {
    /** Unique identifier for the user. */
    @PrimaryGeneratedColumn("uuid")
    id: string;

    /** The user's first name. */
    @Column({
        name: "firstname",
        nullable: false,
        type: "varchar",
        length: 100
    })
    firstname: string;

    /** The user's last name. */
    @Column({
        name: "lastname",
        nullable: false,
        type: "varchar",
        length: 100
    })
    lastname: string;

    /** The user's email address (must be unique). */
    @Column({
        name: "email",
        nullable: false,
        unique: true,
        type: "varchar",
        length: 100
    })
    email: string;

    /** The user's password. */
    @Exclude() // Excludes this property when serializing to JSON
    @Column({
        name: "password",
        nullable: false,
        type: "varchar",
        length: 100
    })
    password: string;

    @Exclude() // Excludes this property when serializing to JSON
    @Column({
        name: "password_salt",
        nullable: false,
        type: "varchar"
    })
    passwordSalt: string;

    /** The roles of the user. */
    @Column({
        name: "roles",
        nullable: false,
        type: "enum",
        enum: UserRole,
        default: UserRole.USER // Default role is "user"
    })
    roles: UserRole;

    /** The timestamp when the user was created. */
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    /** The timestamp when the user was last updated. */
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    /**
     * Creates a new instance of the User class.
     * @param contact Partial data to initialize the user instance.
     */
    constructor(contact: Partial<User>) {
        Object.assign(this, contact);
    }
}