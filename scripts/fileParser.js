import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';

/**
 * Parse file berdasarkan extension
 * @param {string} filePath - Path ke file
 * @returns {Promise<string>} - Text content dari file
 */
export const parseFile = async(filePath) => {
    try {
        const ext = filePath.split('.').pop().toLowerCase();

        switch (ext) {
            case 'pdf':
                return await parsePDF(filePath);

            case 'docx':
            case 'doc':
                return await parseDOCX(filePath);

            case 'txt':
                return await parseTXT(filePath);

            default:
                throw new Error(`Unsupported file type: ${ext}`);
        }
    } catch (error) {
        console.error('Error parsing file:', error.message);
        throw error;
    }
};

/**
 * Parse PDF file
 */
const parsePDF = async(filePath) => {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
};

/**
 * Parse DOCX file
 */
const parseDOCX = async(filePath) => {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
};

/**
 * Parse TXT file
 */
const parseTXT = async(filePath) => {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
};

/**
 * Clean and normalize text
 */
export const cleanText = (text) => {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};