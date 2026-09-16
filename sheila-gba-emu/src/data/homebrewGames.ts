import { Game } from '../types';

export const PRELOADED_HOMEBREW_GAMES: Game[] = [
  {
    id: 'homebrew-frogtris',
    title: 'Frogtris GBA',
    internalTitle: 'Frogtris',
    code: 'FROG',
    makerCode: '01',
    fileSize: 367616,
    checksum: '0x4F72',
    addedAt: 1710000000000,
    playCount: 1,
    isFavorite: true,
    source: 'homebrew',
    homebrewPath: '/homebrew/frogtris.gba',
    description: 'A classic falling-block puzzle game reimagined for Game Boy Advance with smooth animations and chiptune sound.',
    genre: 'Puzzle'
  },
  {
    id: 'homebrew-gapman',
    title: 'Gapman Arcade',
    internalTitle: 'Gapman',
    code: 'GAPM',
    makerCode: '01',
    fileSize: 122880,
    checksum: '0x2A19',
    addedAt: 1710000100000,
    playCount: 0,
    isFavorite: false,
    source: 'homebrew',
    homebrewPath: '/homebrew/gapman.gba',
    description: 'An arcade maze navigation game homage optimized for GBA hardware timers and responsive D-Pad movement.',
    genre: 'Arcade'
  },
  {
    id: 'homebrew-impact',
    title: 'Impact Space Shooter',
    internalTitle: 'Impact',
    code: 'IMPC',
    makerCode: '01',
    fileSize: 71680,
    checksum: '0x10BC',
    addedAt: 1710000200000,
    playCount: 0,
    isFavorite: true,
    source: 'homebrew',
    homebrewPath: '/homebrew/impact.gba',
    description: 'High-speed vertical shooter demonstrating hardware sprite rotation, background scrolling, and explosive particle effects.',
    genre: 'Shoot-em-up'
  },
  {
    id: 'homebrew-tetravex',
    title: 'Tetravex Strategy',
    internalTitle: 'Tetravex',
    code: 'TETX',
    makerCode: '01',
    fileSize: 61440,
    checksum: '0x098A',
    addedAt: 1710000300000,
    playCount: 0,
    isFavorite: false,
    source: 'homebrew',
    homebrewPath: '/homebrew/tetravex.gba',
    description: 'Edge-matching combinatorial puzzle game requiring players to position numbered tiles so matching edges align.',
    genre: 'Brain / Puzzle'
  }
];
