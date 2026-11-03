import * as XLSX from 'xlsx';
import type { Word } from '../types';

export interface RawImportRow {
  [key: string]: any;
}

export type ParsedWordRow = Omit<Word, 'id' | 'deckId'>;

/**
 * Normalizes field lookup across various header keys and variations (Vietnamese, English, casing)
 */
function extractFieldValue(row: Record<string, any>, candidateKeys: string[]): string {
  if (!row || typeof row !== 'object') return '';

  // Direct case match first
  for (const key of candidateKeys) {
    if (row[key] !== undefined && row[key] !== null) {
      const val = String(row[key]).trim();
      if (val) return val;
    }
  }

  // Normalized lower-case and trimmed match
  const lowerCandidates = candidateKeys.map((k) => k.toLowerCase().replace(/[-_\s]/g, ''));
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '');
    if (lowerCandidates.includes(normalizedKey)) {
      if (value !== undefined && value !== null) {
        const val = String(value).trim();
        if (val) return val;
      }
    }
  }

  return '';
}

/**
 * Validates and normalizes raw parsed spreadsheet rows.
 * Discards rows where hanzi is empty.
 */
export function validateWordRows(rows: any[]): ParsedWordRow[] {
  if (!Array.isArray(rows)) return [];

  const result: ParsedWordRow[] = [];

  const hanziKeys = ['hanzi', 'chữ hán', 'từ vựng', 'word', 'character'];
  const pinyinKeys = ['pinyin', 'phiên âm', 'bính âm'];
  const sinoVietnameseKeys = ['sino_vietnamese', 'sinovietnamese', 'sino-vietnamese', 'hán việt', 'hánviệt'];
  const meaningKeys = ['meaning', 'nghĩa', 'dịch nghĩa', 'definition'];
  const notesKeys = ['notes', 'note', 'ghi chú', 'chú thích', 'comment'];

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;

    const hanzi = extractFieldValue(row, hanziKeys);
    if (!hanzi) continue;

    const pinyin = extractFieldValue(row, pinyinKeys);
    const sinoVietnamese = extractFieldValue(row, sinoVietnameseKeys);
    const meaning = extractFieldValue(row, meaningKeys);
    const notes = extractFieldValue(row, notesKeys);

    result.push({
      hanzi,
      pinyin,
      sinoVietnamese,
      meaning,
      notes,
    });
  }

  return result;
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV file into a list of validated Word objects (without id and deckId).
 */
export async function parseSpreadsheetFile(file: File): Promise<ParsedWordRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return [];
  }

  const worksheet = workbook.Sheets[firstSheetName];
  if (!worksheet) {
    return [];
  }

  const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
  return validateWordRows(rawJson);
}

/**
 * Creates and downloads a sample Excel (.xlsx) template for importing vocabulary into HanWri.
 */
export function downloadSampleExcelTemplate(): void {
  const sampleData = [
    {
      'Chữ Hán': '你好',
      'Phiên âm': 'nǐ hǎo',
      'Hán Việt': 'Nhĩ Hảo',
      'Nghĩa': 'Xin chào',
      'Ghi chú': 'Khẩu ngữ chào hỏi',
    },
    {
      'Chữ Hán': '谢谢',
      'Phiên âm': 'xièxie',
      'Hán Việt': 'Tạ Tạ',
      'Nghĩa': 'Cảm ơn',
      'Ghi chú': 'Từ thông dụng',
    },
    {
      'Chữ Hán': '再见',
      'Phiên âm': 'zàijiàn',
      'Hán Việt': 'Tái Kiến',
      'Nghĩa': 'Tạm biệt',
      'Ghi chú': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'TuVung');
  XLSX.writeFile(workbook, 'mau_nhap_tu_hanwri.xlsx');
}

/**
 * Alias for downloadSampleExcelTemplate.
 */
export const generateSampleExcelTemplate = downloadSampleExcelTemplate;
