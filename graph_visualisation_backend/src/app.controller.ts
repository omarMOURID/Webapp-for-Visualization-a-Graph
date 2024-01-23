import { Controller, Delete, FileTypeValidator, Get, Param, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { Neo4jService } from './neo4j/neo4j.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as Papa from "papaparse";
import { GraphService } from './graph/graph.service';

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
    const content = file.buffer.toString();
    const result = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
    console.log(result.data);
    await this.graphService.injectData(result.data, graphId);
    return `There are nodes in the database`
  }

  @Delete(":id")
  async deleteGraph(@Param('id') graphId: string): Promise<void> {
    return this.graphService.deleteGraph(graphId);
  }
}
