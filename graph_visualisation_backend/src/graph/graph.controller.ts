import { Body, Controller, Delete, FileTypeValidator, Get, Param, ParseFilePipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { GraphService } from './graph.service';
import { CreateGraphDto } from './dto/create-graph.dto';
import { Graph } from './graph.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CSVParserService } from './parse/csv-parser.service';
import { FindGraphsDto } from './dto/find-graphs.dto';
import { QueryGraphDto } from './dto/query_graph.dto';
import { PaginationSchema } from 'src/schema/pagination.schema';
import { UpdateGraphDto } from './dto/update-graph.dto';
import { DeleteGraphsDto } from './dto/delete-graphs.dto';
import { AuthGuard } from '@nestjs/passport';
import { HasRoles } from 'src/auth/has-roles.decorator';
import { UserRole } from 'src/user/user.entity';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('graph')
export class GraphController {
    constructor(
        private readonly graphService: GraphService
    ) {}

    /**
     * Creates a new graph.
     * @param createGraphDto The data to create the graph.
     * @returns The created graph.
     */
    @Post()
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    async createGraph(@Body() createGraphDto: CreateGraphDto): Promise<Graph> {
        return await this.graphService.createGraph(createGraphDto);
    }

    /**
     * Loads data from a CSV file into an existing graph.
     * @param file The CSV file to load.
     * @param graphId The ID of the graph to load the data into.
     * @returns A message indicating the success of the operation.
     */
    @Post(":id")
    @UseInterceptors(FileInterceptor('file'))
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    async loadData(
        @UploadedFile(
        new ParseFilePipe({
            fileIsRequired: true,
            validators: [
            new FileTypeValidator({fileType: 'text/csv'})
            ]
        })
        ) file: Express.Multer.File,
        @Param('id') graphId: string,
    ): Promise<void> {
        const parser = CSVParserService.getInstance();
        await this.graphService.injectData(file, graphId, parser);
        return;
    }

    /**
     * Updates an existing graph.
     * @param id The ID of the graph to update.
     * @param updateGraphDto The data to update the graph.
     * @returns The updated graph.
     */
    @Put(":id")
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    async updateGraphById(@Param('id') id: string, @Body() updateGraphDto: UpdateGraphDto): Promise<Graph> {
        return this.graphService.updateGraph(id, updateGraphDto);
    }

    /**
     * Finds and retrieves a paginated list of graphs.
     * @param findGraphsDto Search and pagination criteria.
     * @returns A paginated list of graphs.
     */
    @Get()
    async find(@Query() findGraphsDto: FindGraphsDto): Promise<PaginationSchema<Graph>> {
        const { page, size, search} = findGraphsDto;
        return this.graphService.find(page, size, search);
    }

    /**
     * Finds and retrieves a paginated list of all graphs (only accessible for administrators).
     * @param findGraphsDto Search and pagination criteria.
     * @returns A paginated list of all graphs.
     */
    @Get("/all")
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    async findAll(@Query() findGraphsDto: FindGraphsDto): Promise<PaginationSchema<Graph>> {
        const { page, size, search} = findGraphsDto;
        return this.graphService.find(page, size, search, true);
    }

    /**
     * Finds and retrieves a graph by its ID.
     * @param id The ID of the graph to retrieve.
     * @param queryGraphDto Optional search criteria.
     * @returns The found graph with its corresponding nodes and relations.
     */
    @Get(":id")
    async findGraphById(@Param('id') id: string, @Query() queryGraphDto: QueryGraphDto): Promise<Graph & {nodes: any[], relations: any[]}> {
        const { labels, relations, node, pmcid, sentenceid} = queryGraphDto;
        return this.graphService.findById(id, labels, relations, node, pmcid, sentenceid);
    }

    /**
     * Deletes an existing graph.
     * @param graphId The ID of the graph to delete.
     * @returns A deletion confirmation.
     */
    @Delete(":id")
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    async deleteGraph(@Param('id') graphId: string): Promise<void> {
        return this.graphService.delete([graphId]);
    }

    /**
     * Deletes multiple existing graphs.
     * @param deleteGraphsDto The data containing IDs of graphs to delete.
     * @returns A deletion confirmation.
     */
    @Delete() 
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    async deleteGraphs(@Body() deleteGraphsDto: DeleteGraphsDto): Promise<void> {
        return this.graphService.delete(deleteGraphsDto.ids);
    }
}
