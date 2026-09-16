import { CheatFormat, CheatStatus } from '../types';

export interface CheatValidationResult {
  isValid: boolean;
  status: CheatStatus;
  detectedFormat: CheatFormat;
  normalizedCode: string;
  errorMessage?: string;
}

export function validateCheatCode(rawCode: string, preferredFormat?: CheatFormat): CheatValidationResult {
  const cleaned = rawCode.trim().toUpperCase().replace(/\r\n/g, '\n');
  if (!cleaned) {
    return {
      isValid: false,
      status: 'INVALID',
      detectedFormat: 'Raw',
      normalizedCode: '',
      errorMessage: 'Cheat code cannot be empty.',
    };
  }

  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  let detectedFormat: CheatFormat = preferredFormat || 'ActionReplay';
  const normalizedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/[^0-9A-F]/g, '');

    // Action Replay / GameShark standard: 16 hex chars (8 + 8)
    if (line.length === 16) {
      detectedFormat = preferredFormat === 'GameShark' ? 'GameShark' : 'ActionReplay';
      normalizedLines.push(`${line.substring(0, 8)} ${line.substring(8, 16)}`);
    }
    // CodeBreaker standard: 12 hex chars (8 + 4)
    else if (line.length === 12) {
      detectedFormat = 'CodeBreaker';
      normalizedLines.push(`${line.substring(0, 8)} ${line.substring(8, 12)}`);
    }
    // Raw address value: 8 + 2 or 8 + 4
    else if (line.length === 10) {
      detectedFormat = 'Raw';
      normalizedLines.push(`${line.substring(0, 8)} ${line.substring(8, 10)}`);
    } else {
      return {
        isValid: false,
        status: 'INVALID',
        detectedFormat: preferredFormat || 'ActionReplay',
        normalizedCode: cleaned,
        errorMessage: `Line ${i + 1} has ${line.length} hex digits. Expected 16 (AR/GS) or 12 (CodeBreaker).`,
      };
    }
  }

  return {
    isValid: true,
    status: 'ENABLED',
    detectedFormat,
    normalizedCode: normalizedLines.join('\n'),
  };
}
