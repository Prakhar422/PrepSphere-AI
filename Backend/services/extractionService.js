import mammoth from 'mammoth';
import { PDFParse } from "pdf-parse";



/**
 * Extracts raw text from a PDF buffer using pdf-parse.
 * @param {Buffer} buffer - File buffer.
 * @returns {Promise<string>} Plain text.
 */
export const extractTextFromPdfBuffer = async (buffer) => {
  let parser;

  try {
    const uint8Array = new Uint8Array(
      buffer.buffer,
      buffer.byteOffset,
      buffer.byteLength
    );

    parser = new PDFParse(uint8Array);

    const data = await parser.getText();

    if (!data.text || data.text.trim().length === 0) {
      throw new Error("PDF document appeared to be empty.");
    }

    return data.text;
  } catch (error) {
    console.error("PDF buffer parsing error:", error);
    throw new Error(
      error.message || "Failed to parse PDF document."
    );
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
};
/**
 * Extracts raw text from a DOCX buffer using mammoth.
 * @param {Buffer} buffer - File buffer.
 * @returns {Promise<string>} Plain text.
 */
export const extractTextFromDocxBuffer = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result || !result.value) {
      throw new Error('DOCX document appeared to be empty or had no readable text.');
    }
    
    return result.value;
  } catch (error) {
    console.error('DOCX buffer parsing error:', error);
    throw new Error(error.message || 'Failed to parse DOCX document. The file may be corrupted.');
  }
};

/**
 * Normalizes and cleans the extracted text:
 * - Removes extra spaces.
 * - Removes repeated blank lines.
 * - Preserves headings, bullet points, paragraphs, and structure.
 * @param {string} text - Raw extracted text.
 * @returns {string} Cleaned text.
 */
export const cleanExtractedText = (text) => {
  if (!text) return "";

  return text
    // Replace tabs and multiple spaces with a single space
    .replace(/[ \t]+/g, " ")

    // Normalize line endings
    .replace(/\r\n/g, "\n")

    // Remove trailing spaces from each line
    .split("\n")
    .map(line => line.trimEnd())
    .join("\n")

    // Keep at most one blank line between sections
    .replace(/\n{3,}/g, "\n\n")

    // Remove leading/trailing whitespace
    .trim();
};

/**
 * Exposes main entry point for buffer text extraction
 * @param {Buffer} buffer - In-memory file buffer
 * @param {string} mimeType - Document MIME type
 * @returns {Promise<string>} Normalized and cleaned plain text
 */
export const extractTextFromBuffer = async (buffer, mimeType) => {
  if (!buffer || buffer.length === 0) {
    throw new Error('Buffer is empty or invalid.');
  }

  let rawText = '';

  if (mimeType === 'application/pdf') {
    rawText = await extractTextFromPdfBuffer(buffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    rawText = await extractTextFromDocxBuffer(buffer);
  } else {
    throw new Error('Unsupported file format. Only PDF and DOCX files are allowed.');
  }

  const cleanedText = cleanExtractedText(rawText);
  if (!cleanedText) {
    throw new Error('Extracted document contains no readable text.');
  }

  return cleanedText;
};
