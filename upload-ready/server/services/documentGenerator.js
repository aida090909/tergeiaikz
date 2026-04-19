/**
 * Tergeu AI — Document Generator
 * Generates DOCX and PDF from resolution content
 */

const {
    Document, Packer, Paragraph, TextRun,
    AlignmentType, HeadingLevel, TabStopPosition, TabStopType,
    PageSize, convertInchesToTwip
} = require('docx');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

async function generateDocx(content, title) {
    const lines = content.split('\n');
    const paragraphs = [];

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            paragraphs.push(new Paragraph({ spacing: { after: 100 } }));
            continue;
        }

        // Title lines (ПОСТАНОВЛЕНИЕ / ҚАУЛЫ)
        if (trimmed === 'ПОСТАНОВЛЕНИЕ' || trimmed === 'ҚАУЛЫ') {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: trimmed, bold: true, size: 28, font: 'Times New Roman' })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
            }));
            continue;
        }

        // Section headers (УСТАНОВИЛ / ПОСТАНОВИЛ / АНЫҚТАДЫМ / ҚАУЛЫ ЕТТІМ)
        if (['УСТАНОВИЛ:', 'ПОСТАНОВИЛ:', 'АНЫҚТАДЫМ:', 'ҚАУЛЫ ЕТТІМ:'].includes(trimmed)) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: trimmed, bold: true, size: 24, font: 'Times New Roman' })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 200 }
            }));
            continue;
        }

        // Subtitle (second line usually)
        if (trimmed.startsWith('о ') || trimmed.startsWith('об ') ||
            trimmed.startsWith('қылмыстық') || trimmed.startsWith('тұлғаны') ||
            trimmed.startsWith('жәбірленуші') || trimmed.startsWith('азаматтық') ||
            trimmed.startsWith('тінту') || trimmed.startsWith('алу') ||
            trimmed.startsWith('қарау') || trimmed.startsWith('сараптама') ||
            trimmed.startsWith('жауап') || trimmed.startsWith('бұлтартпау') ||
            trimmed.startsWith('мүлікке') || trimmed.startsWith('лауазымнан') ||
            trimmed.startsWith('тергеуді') || trimmed.startsWith('істі') ||
            trimmed.startsWith('айыптау') || trimmed.startsWith('сот ')) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: trimmed, bold: true, size: 24, font: 'Times New Roman' })],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            }));
            continue;
        }

        // Numbered items
        if (/^\d+\./.test(trimmed)) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: trimmed, size: 24, font: 'Times New Roman' })],
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 100 },
                indent: { firstLine: convertInchesToTwip(0.5) }
            }));
            continue;
        }

        // Sub-items (а), б), в))
        if (/^[а-г]\)/.test(trimmed)) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: trimmed, size: 24, font: 'Times New Roman' })],
                alignment: AlignmentType.LEFT,
                spacing: { after: 50 },
                indent: { left: convertInchesToTwip(0.75) }
            }));
            continue;
        }

        // Regular text
        paragraphs.push(new Paragraph({
            children: [new TextRun({ text: trimmed, size: 24, font: 'Times New Roman' })],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100 },
            indent: { firstLine: convertInchesToTwip(0.5) }
        }));
    }

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: convertInchesToTwip(1),
                        right: convertInchesToTwip(0.75),
                        bottom: convertInchesToTwip(1),
                        left: convertInchesToTwip(1.25)
                    }
                }
            },
            children: paragraphs
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
}

function generatePdf(content, title) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 72, bottom: 72, left: 90, right: 54 }
            });

            const fontsDir = path.join(__dirname, '..', 'fonts');
            let fontRegular = 'Times-Roman';
            let fontBold = 'Times-Bold';

            // Use standard fonts
            doc.font(fontRegular);

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            const lines = content.split('\n');

            for (const line of lines) {
                const trimmed = line.trim();

                if (!trimmed) {
                    doc.moveDown(0.5);
                    continue;
                }

                if (trimmed === 'ПОСТАНОВЛЕНИЕ' || trimmed === 'ҚАУЛЫ' ||
                    trimmed === 'ПОСТАНОВИЛ:' || trimmed === 'УСТАНОВИЛ:' ||
                    trimmed === 'АНЫҚТАДЫМ:' || trimmed === 'ҚАУЛЫ ЕТТІМ:') {
                    doc.font(fontBold).fontSize(14).text(trimmed, { align: 'center' });
                    doc.moveDown(0.5);
                    continue;
                }

                doc.font(fontRegular).fontSize(12).text(trimmed, { align: 'justify' });
            }

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = { generateDocx, generatePdf };
