import mammoth from 'mammoth';
import fs from 'fs/promises';
import PDFParser from 'pdf2json';


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


const parsePDF = (filePath) => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on('pdfParser_dataError', (errData) => {
            reject(new Error(errData.parserError));
        });

        pdfParser.on('pdfParser_dataReady', (pdfData) => {
            const text = pdfParser.getRawTextContent();
            resolve(text);
        });

        pdfParser.loadPDF(filePath);
    });
};


const parseDOCX = async(filePath) => {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
};


const parseTXT = async(filePath) => {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
};


export const cleanText = (text) => {
    return text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};