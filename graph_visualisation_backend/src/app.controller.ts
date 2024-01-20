import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Neo4jService } from './neo4j/neo4j.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly neo4jService: Neo4jService
  ) {}

  @Get()
  async getHello(): Promise<string> {
    const res = await this.neo4jService.read(`MATCH (n) RETURN count(n) AS count`)
    console.log(res.records);
    return `There are ${res.records[0].get('count')} nodes in the database`
  }
}
