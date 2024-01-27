import { Controller, Delete, FileTypeValidator, Get, Param, ParseFilePipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GraphService } from './graph/graph.service';
import { CSVParserService } from './graph/parse/csv-parser.service';
import { lable, relation } from './graph/graph.types';
import { Graph } from './graph/graph.entity';

@Controller()
export class AppController {
  constructor(
    private readonly graphService: GraphService
  ) {}

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
    const parser = new CSVParserService();
    await this.graphService.injectData(file, graphId, parser);
    return `There are nodes in the database`
  }

  @Get(":id")
  async findGraphById(@Param('id') id: string, @Query('labels') labels: lable[], @Query('relations') relations: relation[]): Promise<Graph & {nodes: any[], relations: any[]}> {
    return this.graphService.findById(id, labels, relations);
  }

  @Delete(":id")
  async deleteGraph(@Param('id') graphId: string): Promise<void> {
    return this.graphService.deleteGraph(graphId);
  }
}
