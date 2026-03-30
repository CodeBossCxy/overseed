import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TableRow,
  TableCell,
  Table,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
  TableOfContents,
  StyleLevel,
} from 'docx'

const BRAND_COLOR = 'E6296B'
const HEADER_BG = 'FFF1F4'
const ALT_ROW_BG = 'FAFAFA'
const BORDER_COLOR = 'E5E7EB'

type DocElement = Paragraph | Table

function buildTable(tableRows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows.map((cells, rowIdx) =>
      new TableRow({
        tableHeader: rowIdx === 0,
        children: cells.map((cell) =>
          new TableCell({
            children: [
              new Paragraph({
                children: parseInlineFormatting(cell.trim(), rowIdx === 0),
                spacing: { before: 40, after: 40 },
                alignment: AlignmentType.LEFT,
              }),
            ],
            shading: rowIdx === 0
              ? { type: ShadingType.CLEAR, fill: HEADER_BG }
              : rowIdx % 2 === 0
                ? { type: ShadingType.CLEAR, fill: ALT_ROW_BG }
                : undefined,
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
              left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
              right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
            },
          })
        ),
      })
    ),
  })
}

function markdownToDocxElements(markdown: string): DocElement[] {
  const elements: DocElement[] = []
  const lines = markdown.split('\n')
  let inCodeBlock = false
  let codeLines: string[] = []
  let inTable = false
  let tableRows: string[][] = []

  const flushTable = () => {
    if (tableRows.length === 0) return
    // Add spacing before table
    elements.push(new Paragraph({ spacing: { before: 120, after: 0 } }))
    elements.push(buildTable(tableRows))
    elements.push(new Paragraph({ spacing: { before: 0, after: 120 } }))
    tableRows = []
  }

  const flushCode = () => {
    if (codeLines.length === 0) return
    // Code block with dark background
    elements.push(new Paragraph({ spacing: { before: 120, after: 0 } }))
    codeLines.forEach((cl, idx) => {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: cl || ' ',
              font: 'Courier New',
              size: 17,
              color: 'E2E8F0',
            }),
          ],
          shading: { type: ShadingType.CLEAR, fill: '1E293B' },
          spacing: { before: 0, after: 0 },
          indent: { left: 200, right: 200 },
        })
      )
    })
    elements.push(new Paragraph({ spacing: { before: 0, after: 120 } }))
    codeLines = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCode()
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    // Table rows
    if (line.includes('|') && line.trim().startsWith('|')) {
      const cells = line.split('|').filter((c) => c.trim() !== '')
      if (cells.every((c) => /^[\s\-:]+$/.test(c))) continue
      if (!inTable) inTable = true
      tableRows.push(cells.map((c) => c.trim()))
      continue
    } else if (inTable) {
      inTable = false
      flushTable()
    }

    // Empty line
    if (!line.trim()) {
      elements.push(new Paragraph({ spacing: { before: 80, after: 80 } }))
      continue
    }

    // Headings
    if (line.startsWith('#### ')) {
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: line.slice(5), bold: true, size: 21, font: 'Arial', color: '374151' })],
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 200, after: 60 },
        })
      )
      continue
    }
    if (line.startsWith('### ')) {
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: line.slice(4), bold: true, size: 23, font: 'Arial', color: '1F2937' })],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 80 },
        })
      )
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: line.slice(3), bold: true, size: 26, font: 'Arial', color: BRAND_COLOR })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 320, after: 100 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'FFD6E0', space: 6 } },
        })
      )
      continue
    }
    if (line.startsWith('# ')) {
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: line.slice(2), bold: true, size: 32, font: 'Arial', color: '111827' })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 120 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: BRAND_COLOR, space: 8 } },
        })
      )
      continue
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      elements.push(
        new Paragraph({
          children: [new TextRun({ text: '' })],
          border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR, space: 1 } },
          spacing: { before: 160, after: 160 },
        })
      )
      continue
    }

    // Bullet list
    const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)/)
    if (bulletMatch) {
      const indent = Math.floor(bulletMatch[1].length / 2)
      elements.push(
        new Paragraph({
          children: parseInlineFormatting(bulletMatch[2]),
          bullet: { level: indent },
          spacing: { before: 30, after: 30 },
        })
      )
      continue
    }

    // Numbered list
    const numberMatch = line.match(/^(\s*)\d+\.\s+(.*)/)
    if (numberMatch) {
      const indent = Math.floor(numberMatch[1].length / 2)
      elements.push(
        new Paragraph({
          children: parseInlineFormatting(numberMatch[2]),
          numbering: { reference: 'default-numbering', level: indent },
          spacing: { before: 30, after: 30 },
        })
      )
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({ text: '  ' }),
            new TextRun({ text: line.slice(2), italics: true, color: '6B7280', size: 20, font: 'Arial' }),
          ],
          indent: { left: 400 },
          border: { left: { style: BorderStyle.SINGLE, size: 6, color: BRAND_COLOR, space: 8 } },
          shading: { type: ShadingType.CLEAR, fill: 'FFF8FA' },
          spacing: { before: 80, after: 80 },
        })
      )
      continue
    }

    // Regular paragraph
    elements.push(
      new Paragraph({
        children: parseInlineFormatting(line),
        spacing: { before: 50, after: 50 },
        indent: { left: 0 },
      })
    )
  }

  if (inTable) flushTable()
  if (inCodeBlock) flushCode()

  return elements
}

function parseInlineFormatting(text: string, isBold = false): TextRun[] {
  const runs: TextRun[] = []
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|([^*`]+))/g
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      runs.push(new TextRun({ text: match[2], bold: true, italics: true, size: 20, font: 'Arial' }))
    } else if (match[3]) {
      runs.push(new TextRun({ text: match[3], bold: true, size: 20, font: 'Arial' }))
    } else if (match[4]) {
      runs.push(new TextRun({ text: match[4], italics: true, size: 20, font: 'Arial' }))
    } else if (match[5]) {
      runs.push(new TextRun({ text: match[5], font: 'Courier New', size: 18, color: BRAND_COLOR, shading: { type: ShadingType.CLEAR, fill: 'FFF1F4' } }))
    } else if (match[6]) {
      runs.push(new TextRun({ text: match[6], bold: isBold, size: 20, font: 'Arial' }))
    }
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text, bold: isBold, size: 20, font: 'Arial' }))
  }

  return runs
}

// Detect if markdown has a "table of contents" section (numbered list near the top)
function extractTOC(markdown: string): string[] {
  const lines = markdown.split('\n')
  const tocItems: string[] = []
  let foundTocHeader = false

  for (const line of lines) {
    if (/^#+\s*(目录|table of contents|contents|toc)/i.test(line)) {
      foundTocHeader = true
      continue
    }
    if (foundTocHeader) {
      const m = line.match(/^\d+\.\s+(.+)/)
      if (m) {
        tocItems.push(m[1])
        continue
      }
      if (line.trim() === '') continue
      break // End of TOC
    }
  }
  return tocItems
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { content, title } = await req.json()
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const docTitle = title || 'Overseed Document'
    const tocItems = extractTOC(content)
    const elements = markdownToDocxElements(content)

    // Build TOC section if items found
    const tocElements: Paragraph[] = []
    if (tocItems.length > 0) {
      tocElements.push(
        new Paragraph({
          children: [new TextRun({ text: '', break: 1 })],
          pageBreakBefore: true,
        })
      )
    }

    const doc = new Document({
      numbering: {
        config: [
          {
            reference: 'default-numbering',
            levels: [
              { level: 0, format: 'decimal' as any, text: '%1.', alignment: AlignmentType.LEFT },
              { level: 1, format: 'lowerLetter' as any, text: '%2)', alignment: AlignmentType.LEFT },
              { level: 2, format: 'lowerRoman' as any, text: '%3.', alignment: AlignmentType.LEFT },
            ],
          },
        ],
      },
      sections: [
        // Cover page
        {
          properties: {
            page: {
              margin: { top: 2880, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          children: [
            new Paragraph({ spacing: { before: 2000 } }),
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: docTitle,
                  bold: true,
                  size: 52,
                  font: 'Arial',
                  color: BRAND_COLOR,
                }),
              ],
              alignment: AlignmentType.LEFT,
              spacing: { after: 300 },
            }),
            // Separator
            new Paragraph({
              children: [new TextRun({ text: '' })],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND_COLOR, space: 1 } },
              spacing: { after: 300 },
            }),
            // Meta info
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Generated by Overseed AI',
                  size: 22,
                  color: '9CA3AF',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 80 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                  size: 22,
                  color: '9CA3AF',
                  font: 'Arial',
                }),
              ],
              spacing: { after: 80 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'overseed.net',
                  size: 20,
                  color: BRAND_COLOR,
                  font: 'Arial',
                }),
              ],
            }),
          ],
        },
        // Content
        {
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
            },
          },
          children: elements as Paragraph[],
        },
      ],
    })

    const buffer = await Packer.toBuffer(doc)

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(docTitle)}.docx"`,
      },
    })
  } catch (error: any) {
    console.error('Document export error:', error)
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 })
  }
}
