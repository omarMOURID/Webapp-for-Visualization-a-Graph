import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

function generateCustomId() {
    const rawUuid = uuidv4() // Generate a UUID

    // Remove hyphens and replace with ''
    const underscoredUuid = rawUuid.replace(/-/g, '');


    // Generate the final custom ID
    const customId = `${'G'}${underscoredUuid.substring(1)}`;

    return customId;
}


// Defining the entity with the name "Graph"
@Entity({ name: "Graph" })
export class Graph {
    // Primary key column
    @PrimaryColumn()
    @ApiProperty()
    id: string;

    // Title column, a non-nullable varchar of length 100
    @Column({
        name: "title",
        nullable: false,
        type: "varchar",
        length: 100
    })
    @ApiProperty()
    title: string;

    // Description column, nullable text type
    @Column({
        name: "description",
        nullable: true,
        type: "text",
    })
    @ApiProperty()
    description: string;

    // Visibility column, a non-nullable boolean with a default value of true
    @Column({
        name: "is_visible",
        nullable: false,
        type: "boolean",
        default: true, 
    })
    @ApiProperty()
    isVisible: boolean;

    // Created at column, automatically populated with the creation timestamp
    @CreateDateColumn({ name: 'created_at'})
    @ApiProperty()
    createdAt: Date;

    // Updated at column, automatically updated with the timestamp of the last update
    @UpdateDateColumn({ name: 'updated_at'})
    @ApiProperty()
    updatedAt: Date;

    // Constructor allowing the creation of an instance with partial data
    constructor(contact: Partial<Graph>) {
        this.id = generateCustomId();
        Object.assign(this, contact);
    }
}