import React, { useState, useRef } from 'react';
import { Game } from '../types';
import { parseGbaHeader } from '../utils/romParser';
import { saveRomBlob } from '../utils/storage';
import {
  Search,
  Upload,
  Star,
  Play,
  Trash2,
  Info,
  CheckCircle,
  FileText,
  Clock,
  Gamepad2,
  Layers,
} from 'lucide-react';

interface GamesLibraryProps {
  games: Game[];
  activeGameId: string | null;
  onLaunchGame: (game: Game) => void;
  onAddGame: (game: Game, buffer: ArrayBuffer) => void;
  onRemoveGame: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const GamesLibrary: React.FC<GamesLibraryProps> = ({
  games,
  activeGameId,
  onLaunchGame,
  onAddGame,
  onRemoveGame,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'homebrew' | 'user' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'title' | 'recent' | 'size'>('title');
  const [selectedGameForInfo, setSelectedGameForInfo] = useState<Game | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileProcess = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.gba') && !file.name.toLowerCase().endsWith('.bin')) {
      alert('Please select a valid .gba or .bin Game Boy Advance ROM file.');
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const header = parseGbaHeader(buffer);
      const gameId = `user-rom-${Date.now()}`;

      const newGame: Game = {
        id: gameId,
        title: header.title || file.name.replace(/\.[^/.]+$/, ''),
        internalTitle: header.title,
        code: header.gameCode,
        makerCode: header.makerCode,
        fileSize: buffer.byteLength,
        checksum: header.checksum,
        addedAt: Date.now(),
        playCount: 0,
        isFavorite: false,
        source: 'user',
        description: `Imported local ROM (${file.name})`,
        genre: 'GBA Game',
      };

      await saveRomBlob(gameId, buffer);
      onAddGame(newGame, buffer);
    } catch (err) {
      console.error('Failed to import ROM:', err);
      alert('Error parsing GBA ROM header.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  // Filter & Sort
  const filteredGames = games
    .filter((g) => {
      const matchesSearch =
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.internalTitle && g.internalTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeFilter === 'homebrew') return g.source === 'homebrew';
      if (activeFilter === 'user') return g.source === 'user';
      if (activeFilter === 'favorites') return g.isFavorite;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'recent') return (b.lastPlayed || 0) - (a.lastPlayed || 0);
      if (sortBy === 'size') return b.fileSize - a.fileSize;
      return 0;
    });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header & ROM Dropzone */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#1f2533] pb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-indigo-400" />
            <span>GBA ROM Library</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Play preloaded legal open-source homebrews or import your legally-backed-up Game Boy Advance ROMs.
          </p>
        </div>

        {/* ROM Importer Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileProcess(e.target.files[0]);
              }
            }}
            accept=".gba,.bin"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import .GBA ROM</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-950/20'
            : 'border-[#262f40] hover:border-indigo-500/50 bg-[#10141c]'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-indigo-400">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium text-zinc-200">
            Drag and drop your <span className="text-indigo-400 font-mono">.gba</span> files here, or click to browse
          </p>
          <p className="text-[11px] text-zinc-400">
            Files remain strictly local on your device via IndexedDB storage.
          </p>
        </div>
      </div>

      {/* Controls Bar: Search, Filters & Sorting */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#11151e] border border-[#202735] p-3 rounded-xl text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search games, title, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#171c26] border border-[#262e3d] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'homebrew', 'user', 'favorites'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-zinc-400 self-end sm:self-auto">
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#171c26] border border-[#262e3d] text-zinc-200 rounded-lg px-2 py-1 focus:outline-none"
          >
            <option value="title">Title (A-Z)</option>
            <option value="recent">Recently Played</option>
            <option value="size">ROM Size</option>
          </select>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGames.map((game) => {
          const isActive = activeGameId === game.id;
          return (
            <div
              key={game.id}
              className={`flex flex-col justify-between bg-[#131720] rounded-2xl border p-4 transition-all shadow-md hover:shadow-xl ${
                isActive
                  ? 'border-indigo-500/80 ring-1 ring-indigo-500/40'
                  : 'border-[#222a38] hover:border-[#323d50]'
              }`}
            >
              <div className="space-y-3">
                {/* Card Top: Code badge & Favorite */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-indigo-300 border border-zinc-700">
                      {game.code || 'GBA'}
                    </span>
                    {game.source === 'homebrew' && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                        Homebrew
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onToggleFavorite(game.id)}
                    className="p-1 text-zinc-400 hover:text-amber-400 transition-colors"
                    title={game.isFavorite ? 'Remove Favorite' : 'Add Favorite'}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        game.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-bold text-sm text-white line-clamp-1" title={game.title}>
                    {game.title}
                  </h3>
                  {game.description && (
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>
                  )}
                </div>

                {/* Metadata tags */}
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                  <span>{formatBytes(game.fileSize)}</span>
                  <span>•</span>
                  <span>{game.genre || 'Action'}</span>
                  {game.playCount > 0 && (
                    <>
                      <span>•</span>
                      <span>Played {game.playCount}x</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-[#1d2330]">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedGameForInfo(game)}
                    className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="ROM Details & Header"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                  {game.source === 'user' && (
                    <button
                      onClick={() => onRemoveGame(game.id)}
                      className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                      title="Remove from Library"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onLaunchGame(game)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow transition-all ${
                    isActive
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isActive ? 'Resume' : 'Play Game'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGames.length === 0 && (
        <div className="text-center py-12 bg-[#121620] rounded-2xl border border-[#202735] space-y-2">
          <Gamepad2 className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-sm font-semibold text-zinc-300">No matching GBA games found</p>
          <p className="text-xs text-zinc-500">Try adjusting your search query or clear the filter.</p>
        </div>
      )}

      {/* ROM Header Details Modal */}
      {selectedGameForInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12151d] border border-[#242b38] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#212734] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">ROM Header Metadata</h3>
              </div>
              <button
                onClick={() => setSelectedGameForInfo(null)}
                className="text-zinc-400 hover:text-white text-xs px-2 py-1 bg-zinc-800 rounded-lg"
              >
                Close
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex justify-between py-1 border-b border-[#1b212b]">
                <span className="text-zinc-400">Title:</span>
                <span className="font-semibold text-white">{selectedGameForInfo.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1b212b]">
                <span className="text-zinc-400">Internal Header Title:</span>
                <span className="font-mono text-indigo-300">
                  {selectedGameForInfo.internalTitle || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1b212b]">
                <span className="text-zinc-400">Game Code:</span>
                <span className="font-mono text-emerald-400">{selectedGameForInfo.code || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1b212b]">
                <span className="text-zinc-400">Maker Code:</span>
                <span className="font-mono text-zinc-300">{selectedGameForInfo.makerCode || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1b212b]">
                <span className="text-zinc-400">Header Checksum:</span>
                <span className="font-mono text-zinc-300">{selectedGameForInfo.checksum}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1b212b]">
                <span className="text-zinc-400">File Size:</span>
                <span className="font-mono text-zinc-300">
                  {formatBytes(selectedGameForInfo.fileSize)} ({selectedGameForInfo.fileSize.toLocaleString()} bytes)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1b212b]">
                <span className="text-zinc-400">Play Count:</span>
                <span>{selectedGameForInfo.playCount} sessions</span>
              </div>
              {selectedGameForInfo.lastPlayed && (
                <div className="flex justify-between py-1 border-b border-[#1b212b]">
                  <span className="text-zinc-400">Last Played:</span>
                  <span>{new Date(selectedGameForInfo.lastPlayed).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  onLaunchGame(selectedGameForInfo);
                  setSelectedGameForInfo(null);
                }}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-xs shadow-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Launch This Game</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
