export interface RomHeaderInfo {
  title: string;
  gameCode: string;
  makerCode: string;
  checksum: string;
  isValidGba: boolean;
  fileSize: number;
}

export function parseGbaHeader(buffer: ArrayBuffer): RomHeaderInfo {
  const bytes = new Uint8Array(buffer);
  const fileSize = bytes.length;

  if (fileSize < 192) {
    return {
      title: 'Invalid ROM',
      gameCode: '????',
      makerCode: '??',
      checksum: '0x0000',
      isValidGba: false,
      fileSize,
    };
  }

  // Extract Game Title (0xA0 - 0xAB, 12 bytes)
  let title = '';
  for (let i = 0xa0; i < 0xac; i++) {
    const code = bytes[i];
    if (code >= 32 && code <= 126) {
      title += String.fromCharCode(code);
    }
  }
  title = title.trim() || 'Untitled GBA Game';

  // Game Code (0xAC - 0xAF, 4 bytes)
  let gameCode = '';
  for (let i = 0xac; i < 0xb0; i++) {
    const code = bytes[i];
    if (code >= 32 && code <= 126) {
      gameCode += String.fromCharCode(code);
    }
  }
  gameCode = gameCode.trim() || 'AGB';

  // Maker Code (0xB0 - 0xB1, 2 bytes)
  let makerCode = '';
  for (let i = 0xb0; i < 0xb2; i++) {
    const code = bytes[i];
    if (code >= 32 && code <= 126) {
      makerCode += String.fromCharCode(code);
    }
  }
  makerCode = makerCode.trim() || '01';

  // Fixed Value check (0xB2 must be 0x96)
  const fixedValue = bytes[0xb2];
  const isValidGba = fixedValue === 0x96 || bytes[0] === 0x2e || bytes[3] === 0xea;

  // Header Checksum at 0xBD
  const headerChecksum = bytes[0xbd];
  const checksumHex = '0x' + headerChecksum.toString(16).toUpperCase().padStart(2, '0');

  return {
    title,
    gameCode,
    makerCode,
    checksum: checksumHex,
    isValidGba,
    fileSize,
  };
}
