import type { Word } from '../types';

export const STARTER_WORDS_DATA: Omit<Word, 'id' | 'deckId'>[] = [
  { hanzi: '你', pinyin: 'nǐ', sinoVietnamese: 'Nhĩ', meaning: 'Bạn, anh, chị (ngôi thứ 2)' },
  { hanzi: '好', pinyin: 'hǎo', sinoVietnamese: 'Hảo', meaning: 'Tốt, đẹp, hay, khỏe' },
  { hanzi: '你好', pinyin: 'nǐ hǎo', sinoVietnamese: 'Nhĩ Hảo', meaning: 'Xin chào' },
  { hanzi: '谢谢', pinyin: 'xièxie', sinoVietnamese: 'Tạ Tạ', meaning: 'Cảm ơn' },
  { hanzi: '再见', pinyin: 'zàijiàn', sinoVietnamese: 'Tái Kiến', meaning: 'Tạm biệt' },
  { hanzi: '中国', pinyin: 'zhōngguó', sinoVietnamese: 'Trung Quốc', meaning: 'Nước Trung Quốc' },
  { hanzi: '学习', pinyin: 'xuéxí', sinoVietnamese: 'Học Tập', meaning: 'Học tập' },
  { hanzi: '汉语', pinyin: 'hànyǔ', sinoVietnamese: 'Hán Ngữ', meaning: 'Tiếng Hán / Tiếng Trung' },
];
