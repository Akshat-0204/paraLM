import { ParsedDocument } from './pdfParser';

export async function parseTXT(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const content = buffer
      .toString('utf-8')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!content) {
      throw new Error('File is empty or contains no readable text');
    }

    return {
      content,
      metadata: {
        wordCount: content.split(/\s+/).filter(Boolean).length,
        characterCount: content.length,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse TXT: ${(error as Error).message}`);
  }
}