import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// Defining the entity with the name "Graph"
@Entity({ name: "Graph" })
export class Graph {
    // Primary key column generated as UUID
    @PrimaryGeneratedColumn("uuid")
    id: string;

    // Title column, a non-nullable varchar of length 100
    @Column({
        name: "title",
        nullable: false,
        type: "varchar",
        length: 100
    })
    title: string;

    // Description column, nullable text type
    @Column({
        name: "description",
        nullable: true,
        type: "text",
    })
    description: string;

    // Visibility column, a non-nullable boolean with a default value of true
    @Column({
        name: "is_visible",
        nullable: false,
        type: "boolean",
        default: true, 
    })
    isVisible: boolean;

    // Created at column, automatically populated with the creation timestamp
    @CreateDateColumn({ name: 'created_at'})
    createdAt: Date;

    // Updated at column, automatically updated with the timestamp of the last update
    @UpdateDateColumn({ name: 'updated_at'})
    updatedAt: Date;

    // Constructor allowing the creation of an instance with partial data
    constructor(contact: Partial<Graph>) {
        Object.assign(this, contact);
    }
}