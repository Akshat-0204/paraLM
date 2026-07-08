import * as cheerio from 'cheerio';
import { ParsedDocument } from './pdfParser';

export async function parseHTML(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const raw = buffer.toString('utf-8');
    const $ = cheerio.load(raw);

    // Remove non-content elements
    $(
      'script, style, noscript, iframe, nav, footer, header, aside, ' +
      '[role="navigation"], [role="banner"], [role="complementary"], ' +
      '.nav, .navbar, .sidebar, .footer, .header, .advertisement, .ads'
    ).remove();

    // Extract meaningful text preserving structure
    // Try to find main content area first
    let contentElement = $('main, article, [role="main"], .content, #content, .main');

    // Fall back to body if no main content area found
    if (contentElement.length === 0) {
      contentElement = $('body');
    }

    // Extract text with spacing between block elements
    const textParts: string[] = [];

    contentElement.find('h1, h2, h3, h4, h5, h6, p, li, td, th, blockquote, pre').each(
      (_index, element) => {
        const text = $(element).text().replace(/\s+/g, ' ').trim();
        if (text) {
          textParts.push(text);
        }
      }
    );

    const content = textParts
      .join('\n\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!content) {
      throw new Error('No readable content found in HTML file');
    }

    return {
      content,
      metadata: {
        wordCount: content.split(/\s+/).filter(Boolean).length,
        characterCount: content.length,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse HTML: ${(error as Error).message}`);
  }
}