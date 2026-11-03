import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as XLSX from 'xlsx';
import {
  validateWordRows,
  parseSpreadsheetFile,
  downloadSampleExcelTemplate,
  generateSampleExcelTemplate,
} from './fileImportService';

vi.mock('xlsx', async (importOriginal) => {
  const actual = await importOriginal<typeof import('xlsx')>();
  return {
    ...actual,
    writeFile: vi.fn(),
  };
});

describe('fileImportService', () => {
  describe('validateWordRows', () => {
    it('filters empty or invalid rows', () => {
      const rawRows = [
        { hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'Xin chào' },
        { hanzi: '', pinyin: 'abc', meaning: 'Trống' },
        { hanzi: '   ', pinyin: '', meaning: '' },
        { hanzi: '谢谢', pinyin: 'xièxie', meaning: 'Cảm ơn' },
      ];

      const valid = validateWordRows(rawRows);
      expect(valid.length).toBe(2);
      expect(valid[0].hanzi).toBe('你好');
      expect(valid[1].hanzi).toBe('谢谢');
    });

    it('normalizes Vietnamese headers correctly', () => {
      const rawRows = [
        {
          'Chữ Hán': '学生',
          'Phiên âm': 'xuéshēng',
          'Hán Việt': 'Học Sinh',
          'Nghĩa': 'Học sinh, sinh viên',
          'Ghi chú': 'Từ HSK 1',
        },
        {
          'Từ vựng': '老师',
          'phiên âm': 'lǎoshī',
          'hán việt': 'Lão Sư',
          'nghĩa': 'Giáo viên',
          'ghi chú': '',
        },
      ];

      const valid = validateWordRows(rawRows);
      expect(valid.length).toBe(2);
      expect(valid[0]).toEqual({
        hanzi: '学生',
        pinyin: 'xuéshēng',
        sinoVietnamese: 'Học Sinh',
        meaning: 'Học sinh, sinh viên',
        notes: 'Từ HSK 1',
      });
      expect(valid[1]).toEqual({
        hanzi: '老师',
        pinyin: 'lǎoshī',
        sinoVietnamese: 'Lão Sư',
        meaning: 'Giáo viên',
        notes: '',
      });
    });

    it('normalizes English and alternate headers', () => {
      const rawRows = [
        {
          hanzi: '中国',
          pinyin: 'zhōngguó',
          sino_vietnamese: 'Trung Quốc',
          meaning: 'Trung Quốc',
          notes: 'Quốc gia',
        },
        {
          Word: '北京',
          Pinyin: 'běijīng',
          HánViệt: 'Bắc Kinh',
          Meaning: 'Thủ đô TQ',
          Notes: 'Địa danh',
        },
      ];

      const valid = validateWordRows(rawRows);
      expect(valid.length).toBe(2);
      expect(valid[0].hanzi).toBe('中国');
      expect(valid[0].sinoVietnamese).toBe('Trung Quốc');
      expect(valid[1].hanzi).toBe('北京');
      expect(valid[1].meaning).toBe('Thủ đô TQ');
    });

    it('trims whitespace and handles non-string values gracefully', () => {
      const rawRows = [
        {
          hanzi: ' 一 ',
          pinyin: '  yī  ',
          sino_vietnamese: '  Nhất  ',
          meaning: 123,
          notes: null,
        },
      ];

      const valid = validateWordRows(rawRows);
      expect(valid.length).toBe(1);
      expect(valid[0].hanzi).toBe('一');
      expect(valid[0].pinyin).toBe('yī');
      expect(valid[0].sinoVietnamese).toBe('Nhất');
      expect(valid[0].meaning).toBe('123');
      expect(valid[0].notes).toBe('');
    });

    it('returns empty array if input rows is empty or non-array', () => {
      expect(validateWordRows([])).toEqual([]);
      expect(validateWordRows(null as any)).toEqual([]);
      expect(validateWordRows(undefined as any)).toEqual([]);
    });
  });

  describe('parseSpreadsheetFile', () => {
    it('parses valid spreadsheet buffer from a File object', async () => {
      const sampleData = [
        { 'Chữ Hán': '猫', 'Phiên âm': 'māo', 'Nghĩa': 'Con mèo' },
        { 'Chữ Hán': '狗', 'Phiên âm': 'gǒu', 'Nghĩa': 'Con chó' },
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      const file = new File([fileBuffer], 'animals.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const words = await parseSpreadsheetFile(file);
      expect(words.length).toBe(2);
      expect(words[0].hanzi).toBe('猫');
      expect(words[0].meaning).toBe('Con mèo');
      expect(words[1].hanzi).toBe('狗');
      expect(words[1].meaning).toBe('Con chó');
    });

    it('returns empty array when file has empty sheet', async () => {
      const workbook = XLSX.utils.book_new();
      const emptySheet = XLSX.utils.aoa_to_sheet([]);
      XLSX.utils.book_append_sheet(workbook, emptySheet, 'Empty');
      const fileBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      const file = new File([fileBuffer], 'empty.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const words = await parseSpreadsheetFile(file);
      expect(words).toEqual([]);
    });
  });

  describe('downloadSampleExcelTemplate and generateSampleExcelTemplate', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('generates an excel file named mau_nhap_tu_hanwri.xlsx with sample data', () => {
      downloadSampleExcelTemplate();

      expect(XLSX.writeFile).toHaveBeenCalledTimes(1);
      const [workbook, filename] = vi.mocked(XLSX.writeFile).mock.calls[0];
      expect(filename).toBe('mau_nhap_tu_hanwri.xlsx');
      expect(workbook.SheetNames).toContain('TuVung');

      const sheet = workbook.Sheets['TuVung'];
      const rows = XLSX.utils.sheet_to_json<any>(sheet);
      expect(rows.length).toBe(3);
      expect(rows[0]['Chữ Hán']).toBe('你好');
      expect(rows[1]['Chữ Hán']).toBe('谢谢');
      expect(rows[2]['Chữ Hán']).toBe('再见');
    });

    it('generateSampleExcelTemplate is an alias for downloadSampleExcelTemplate', () => {
      generateSampleExcelTemplate();

      expect(XLSX.writeFile).toHaveBeenCalledTimes(1);
      expect(vi.mocked(XLSX.writeFile).mock.calls[0][1]).toBe('mau_nhap_tu_hanwri.xlsx');
    });
  });
});
