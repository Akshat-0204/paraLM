import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { ParsedDocument } from './pdfParser';

export async function parseDOCX(buffer: Buffer): Promise<ParsedDocument> {
  try {
    // Copy buffer into a plain ArrayBuffer to satisfy strict TypeScript typing
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;

    const blob = new Blob([arrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const loader = new DocxLoader(blob);

    const docs = await loader.load();

    const content = docs
      .map((doc) => doc.pageContent)
      .join('\n\n')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!content) {
      throw new Error('DOCX file is empty or contains no readable text');
    }

    return {
      content,
      metadata: {
        wordCount: content.split(/\s+/).filter(Boolean).length,
        characterCount: content.length,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${(error as Error).message}`);
  }
}