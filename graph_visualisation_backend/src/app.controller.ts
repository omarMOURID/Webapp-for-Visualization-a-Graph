import { Body, Controller, Delete, FileTypeValidator, Get, Param, ParseFilePipe, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateGraphDto } from './graph/dto/create-graph.dto';
import { Graph } from './graph/graph.entity';
import { GraphService } from './graph/graph.service';
import { CSVParserService } from './graph/parse/csv-parser.service';
import { updateGraphDto } from './graph/dto/update-graph.dto';
import { QueryGraphDto } from './graph/dto/query_graph.dto';
import { PaginationSchema } from './schema/pagination.schema';
import { FindGraphsDto } from './graph/dto/find-graphs.dto';

@Controller()
export class AppController {
  constructor(
    private readonly graphService: GraphService
  ) {}

  @Post()
  async createGraph(@Body() createGraphDto: CreateGraphDto): Promise<Graph> {
    return await this.graphService.createGraph(createGraphDto);
  }

  @Post(":id")
  @UseInterceptors(FileInterceptor('file'))
  async getHello(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new FileTypeValidator({fileType: 'text/csv'})
        ]
      })
    ) file: Express.Multer.File,
    @Param('id') graphId: string,
  ): Promise<string> {
    const parser = CSVParserService.getInstance();
    await this.graphService.injectData(file, graphId, parser);
    return `There are nodes in the database`
  }

  @Put(":id")
  async updateGraphById(@Param('id') id: string, @Body() updateGraphDto: updateGraphDto): Promise<Graph> {
    return this.graphService.updateGraph(id, updateGraphDto);
  }

  @Get(":id")
  async findGraphById(@Param('id') id: string, @Query() queryGraphDto: QueryGraphDto): Promise<Graph & {nodes: any[], relations: any[]}> {
    const { labels, relations, node, pmcid, sentenceid} = queryGraphDto;
    return this.graphService.findById(id, labels, relations, node, pmcid, sentenceid);
  }

  @Get()
  async find(@Query() findGraphsDto: FindGraphsDto): Promise<PaginationSchema<Graph>> {
    const { page, size, search} = findGraphsDto;
    console.log(findGraphsDto)
    return this.graphService.find(page, size, search);
  }

  @Delete(":id")
  async deleteGraph(@Param('id') graphId: string): Promise<void> {
    return this.graphService.delete([graphId]);
  }
}
