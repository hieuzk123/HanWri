import type { InkStroke } from '../components/practice/FreehandCanvas';
import type { HandwritingRecognitionResult } from '../types';

export function evaluateMatch(
  targetChar: string,
  candidates: string[]
): { matchedRank: number } {
  const rank = candidates.indexOf(targetChar);
  return {
    matchedRank: rank === -1 ? -1 : rank + 1,
  };
}

export async function recognizeHandwriting(
  ink: InkStroke[],
  width: number,
  height: number,
  targetChar: string
): Promise<HandwritingRecognitionResult> {
  if (!ink || ink.length === 0) {
    return {
      success: false,
      candidates: [],
      matchedRank: -1,
    };
  }

  const endpoint =
    'https://inputtools.google.com/request?ime=handwriting&app=autotyped&dbg=1&cs=1&oe=UTF-8';

  const body = {
    options: 'enable_pre_space',
    requests: [
      {
        writing_guide: {
          writing_area_width: width,
          writing_area_height: height,
        },
        pre_context: '',
        max_num_results: 10,
        max_completions: 0,
        language: 'zh-t-i0-handwrit',
        ink: ink,
      },
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Handwriting API returned status ${response.status}`);
    }

    const data = await response.json();
    if (data[0] === 'SUCCESS' && data[1]?.[0]?.[1]) {
      const candidates: string[] = data[1][0][1];
      const { matchedRank } = evaluateMatch(targetChar, candidates);
      return {
        success: true,
        candidates,
        matchedRank,
      };
    }

    return {
      success: false,
      candidates: [],
      matchedRank: -1,
    };
  } catch (err) {
    console.warn(
      'Google handwriting recognition request failed, returning error response:',
      err
    );
    return {
      success: false,
      candidates: [],
      matchedRank: -1,
    };
  }
}
