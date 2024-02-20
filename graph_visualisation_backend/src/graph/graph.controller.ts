import { Body, Controller, Delete, FileTypeValidator, Get, Param, ParseFilePipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('graph')
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Creates a new graph (ADMIN)' })
    @ApiBody({ type: CreateGraphDto })
    @ApiResponse({ status: 201, type: Graph, description: 'Returns the created graph.' })
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Post()
    async createGraph(@Body() createGraphDto: CreateGraphDto): Promise<Graph> {
        return await this.graphService.createGraph(createGraphDto);
    }

    /**
     * Loads data from a CSV file into an existing graph.
     * @param file The CSV file to load.
     * @param graphId The ID of the graph to load the data into.
     * @returns A message indicating the success of the operation.
     */
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Loads data from a CSV file into an existing graph (ADMIN)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: 'multipart/form-data', // Specify the content type as multipart/form-data for file upload
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary', // Indicate that it's a binary file
                    description: 'CSV file to upload', // Description of the file input field
                }
            }
        }
    })
    @ApiResponse({ status: 201 })
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Post(":id")
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Updates an existing graph (ADMIN)' })
    @ApiResponse({ status: 200, type: Graph, description: 'Returns the updated graph.' })
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Put(":id")
    async updateGraphById(@Param('id') id: string, @Body() updateGraphDto: UpdateGraphDto): Promise<Graph> {
        return this.graphService.updateGraph(id, updateGraphDto);
    }

    /**
     * Finds and retrieves a paginated list of graphs.
     * @param findGraphsDto Search and pagination criteria.
     * @returns A paginated list of graphs.
     */
    @ApiOperation({ summary: 'Finds and retrieves a paginated list of graphs' })
    @ApiResponse({ status: 200, description: 'Returns a paginated list of graphs.' })
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Finds and retrieves a paginated list of all graphs (only accessible for administrators) (ADMIN)' })
    @ApiResponse({ status: 200, description: 'Returns a paginated list of all graphs.' })
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Get("/all")
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
    @ApiOperation({ summary: 'Finds and retrieves a graph by its ID' })
    @ApiResponse({ status: 200, type: Graph, description: 'Returns the found graph with its corresponding nodes and relations.' })
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
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Deletes an existing graph (ADMIN)' })
    @ApiResponse({ status: 200, description: 'Returns a deletion confirmation.' })
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Delete(":id")
    async deleteGraph(@Param('id') graphId: string): Promise<void> {
        return this.graphService.delete([graphId]);
    }

    /**
     * Deletes multiple existing graphs.
     * @param deleteGraphsDto The data containing IDs of graphs to delete.
     * @returns A deletion confirmation.
     */
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Deletes multiple existing graphs (ADMIN)' })
    @ApiResponse({ status: 200, description: 'Returns a deletion confirmation.' })
    @HasRoles(UserRole.ADMIN)
    @UseGuards(AuthGuard("jwt"), RolesGuard)
    @Delete() 
    async deleteGraphs(@Body() deleteGraphsDto: DeleteGraphsDto): Promise<void> {
        return this.graphService.delete(deleteGraphsDto.ids);
    }
}
