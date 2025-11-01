import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { DocumentStatusService } from "./document-status.service";

@Controller("api/document-status")
@ApiTags("document-status")
export class DocumentStatusController {
  private readonly documentStatusService: DocumentStatusService;

  constructor(documentStatusService: DocumentStatusService) {
    this.documentStatusService = documentStatusService;
  }

  @Get()
  @ApiBearerAuth()
  findAll() {
    return this.documentStatusService.findAll();
  }
}
