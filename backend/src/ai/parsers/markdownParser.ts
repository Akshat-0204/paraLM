import { ParsedDocument } from './pdfParser';

export async function parseMarkdown(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const raw = buffer.toString('utf-8');

    // Strip frontmatter (YAML between --- blocks)
    const withoutFrontmatter = raw.replace(/^---[\s\S]*?---\n?/, '').trim();

    // Remove markdown syntax for clean text extraction
    const content = withoutFrontmatter
      // Remove headings markers but keep text
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold and italic markers
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove code blocks but keep content
      .replace(/```[\w]*\n([\s\S]*?)```/g, '$1')
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      // Remove blockquote markers
      .replace(/^>\s+/gm, '')
      // Remove horizontal rules
      .replace(/^[-*_]{3,}$/gm, '')
      // Remove list markers
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      content,
      metadata: {
        wordCount: content.split(/\s+/).filter(Boolean).length,
        characterCount: content.length,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse Markdown: ${(error as Error).message}`);
  }
}