import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { FileType } from '../../types';
import { parsePDF } from '../parsers/pdfParser';
import { parseDOCX } from '../parsers/docxParser';
import { parseMarkdown } from '../parsers/markdownParser';
import { parseTXT } from '../parsers/txtParser';
import { parseHTML } from '../parsers/htmlParser'

export interface DocumentChunk {
  chunkIndex: number;
  content: string;
  documentId: string;
  documentName: string;
  workspaceId: string;
  metadata: {
    fileType: FileType;
    wordCount: number;
    characterCount: number;
    pageCount?: number | undefined;
  };
}

const CHUNK_CONFIGS: Record<FileType, { chunkSize: number; chunkOverlap: number }> = {
  [FileType.PDF]: { chunkSize: 1000, chunkOverlap: 200 },
  [FileType.DOCX]: { chunkSize: 1000, chunkOverlap: 200 },
  [FileType.MD]: { chunkSize: 800, chunkOverlap: 150 },
  [FileType.HTML]: { chunkSize: 800, chunkOverlap: 150 },
  [FileType.TXT]: { chunkSize: 600, chunkOverlap: 100 },
};

//parsing by filetype
async function parseByFileType(
  buffer: Buffer,
  fileType: FileType
): Promise<{ content: string; metadata: Record<string, unknown> }> {
  switch (fileType) {
    case FileType.PDF:
      return parsePDF(buffer);
    case FileType.DOCX:
      return parseDOCX(buffer);
    case FileType.MD:
      return parseMarkdown(buffer);
    case FileType.TXT:
      return parseTXT(buffer);
    case FileType.HTML:
      return parseHTML(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

//processing functions 
export async function processDocument(
buffer: Buffer,
  fileType: FileType,
  documentName: string,
  documentId: string,
  workspaceId: string

): Promise<DocumentChunk[]> {
    //parse
    const parsed = await parseByFileType(buffer, fileType);

    if(!parsed.content || parsed.content.trim().length === 0){
        throw new Error(`Document ${documentName} produced no content after parsing`);
    }

    //get chunkConfig
    const {chunkSize, chunkOverlap} = CHUNK_CONFIGS[fileType];

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize, chunkOverlap, 
        separators: ['\n\n', '\n', '. ', '! ', '? ', ' ', ''],
    });

    const langchainDocs = await splitter.createDocuments([parsed.content]);

    //map to doc chunker interface
    const chunks : DocumentChunk[] = langchainDocs.map((doc : any, index : any) => ({
            chunkIndex: index,
    content: doc.pageContent.trim(),
    documentId,
    documentName,
    workspaceId,
    metadata: {
      fileType,
      wordCount: doc.pageContent.split(/\s+/).filter(Boolean).length,
      characterCount: doc.pageContent.length,
      pageCount: (parsed.metadata as { pageCount?: number }).pageCount,

      
    },
}
));

const validChunks = chunks.filter((chunk) => chunk.content.length > 0);

console.log(`${documentName} → ${validChunks.length} chunks (${fileType})`)


return validChunks;

}




