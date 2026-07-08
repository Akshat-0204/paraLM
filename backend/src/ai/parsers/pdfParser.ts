import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

export interface ParsedDocument {
  content: string;
  metadata: {
    pageCount?: number;
    wordCount: number;
    characterCount: number;
  };
}

export async function parsePDF(buffer: Buffer): Promise<ParsedDocument> {
  try {
    // Copy buffer into a plain ArrayBuffer to satisfy strict TypeScript typing
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    ) as ArrayBuffer;

    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

    const loader = new PDFLoader(blob, {
      splitPages: false,
    });

    const docs = await loader.load();

    const content = docs
      .map((doc) => doc.pageContent)
      .join('\n\n')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!content) {
      throw new Error('PDF file is empty or contains no readable text');
    }

    return {
      content,
      metadata: {
        pageCount: docs.length,
        wordCount: content.split(/\s+/).filter(Boolean).length,
        characterCount: content.length,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${(error as Error).message}`);
  }
}