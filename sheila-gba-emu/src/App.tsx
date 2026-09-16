import React, { useState, useEffect, useCallback } from 'react';
import {
  Game,
  MainTab,
  EmulatorSettings,
  SaveState,
  Cheat,
} from './types';
import {
  getSavedGames,
  saveGames,
  getActiveGameId,
  setActiveGameId,
  getSettings,
  saveSettings,
  getSaveStates,
  saveSaveStates,
  getCheats,
  saveCheats,
  getRomBlob,
  saveRomBlob,
} from './utils/storage';
import { emulatorInstance } from './emulator/GBAEmulator';
import { Navbar } from './components/Navbar';
import { EmulatorScreen } from './components/EmulatorScreen';
import { GamesLibrary } from './components/GamesLibrary';
import { SavesManager } from './components/SavesManager';
import { CheatsManager } from './components/CheatsManager';
import { ControllerConfig } from './components/ControllerConfig';
import { SettingsModal } from './components/SettingsModal';
import { SheilaAIAssistant } from './components/SheilaAIAssistant';
import { AndroidProjectExporter } from './components/AndroidProjectExporter';
import { TouchLayoutEditor } from './components/TouchLayoutEditor';
import { Clock, Star, Play, Gamepad2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<MainTab>('emulator');
  const [games, setGames] = useState<Game[]>([]);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [settings, setSettings] = useState<EmulatorSettings>(getSettings());
  const [saveStates, setSaveStates] = useState<SaveState[]>([]);
  const [cheats, setCheats] = useState<Cheat[]>([]);
  const [showTouchLayoutEditor, setShowTouchLayoutEditor] = useState(false);
  const [emulatorStats, setEmulatorStats] = useState({ fps: 0, speedMultiplier: 1 });

  // Initialize data on mount
  useEffect(() => {
    const loadedGames = getSavedGames();
    setGames(loadedGames);
    setSaveStates(getSaveStates());
    setCheats(getCheats());

    // Restore active game
    const activeId = getActiveGameId();
    const found = loadedGames.find((g) => g.id === activeId) || loadedGames[0];
    if (found) {
      setActiveGame(found);
    }
  }, []);

  // Subscribe to emulator stats
  useEffect(() => {
    emulatorInstance.onStats((stats) => {
      setEmulatorStats({
        fps: stats.fps,
        speedMultiplier: stats.speedMultiplier,
      });
    });
  }, []);

  // Launch a game
  const handleLaunchGame = useCallback(
    async (game: Game) => {
      try {
        let romBuffer: ArrayBuffer | null = null;

        if (game.source === 'homebrew' && game.homebrewPath) {
          const resp = await fetch(game.homebrewPath);
          if (!resp.ok) throw new Error(`HTTP ${resp.status} fetching homebrew ROM`);
          romBuffer = await resp.arrayBuffer();
        } else {
          romBuffer = await getRomBlob(game.id);
        }

        if (!romBuffer) {
          alert('Could not find ROM binary in storage. Please re-import this game.');
          return;
        }

        // Update play counts and lastPlayed
        const updatedGames = games.map((g) =>
          g.id === game.id
            ? { ...g, playCount: g.playCount + 1, lastPlayed: Date.now() }
            : g
        );
        setGames(updatedGames);
        saveGames(updatedGames);

        setActiveGame(game);
        setActiveGameId(game.id);

        const success = await emulatorInstance.loadRom(romBuffer, game.title);
        if (success) {
          setCurrentTab('emulator');
        }
      } catch (err: any) {
        console.error('Failed to launch game:', err);
        alert(`Failed to boot ${game.title}: ${err.message}`);
      }
    },
    [games]
  );

  // Add new user ROM
  const handleAddGame = (game: Game, buffer: ArrayBuffer) => {
    const updated = [game, ...games];
    setGames(updated);
    saveGames(updated);
    handleLaunchGame(game);
  };

  // Remove game
  const handleRemoveGame = (id: string) => {
    const updated = games.filter((g) => g.id !== id);
    setGames(updated);
    saveGames(updated);
    if (activeGame?.id === id) {
      setActiveGame(updated[0] || null);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    const updated = games.map((g) =>
      g.id === id ? { ...g, isFavorite: !g.isFavorite } : g
    );
    setGames(updated);
    saveGames(updated);
  };

  // Settings update
  const handleUpdateSettings = (newSettings: EmulatorSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Save State actions
  const handleSaveState = (state: SaveState) => {
    const filtered = saveStates.filter(
      (s) => !(s.gameId === state.gameId && s.slot === state.slot)
    );
    const updated = [state, ...filtered];
    setSaveStates(updated);
    saveSaveStates(updated);
  };

  const handleSaveSlot = (slot: number) => {
    if (!activeGame) return;
    const frozen = emulatorInstance.freezeState();
    if (!frozen) {
      alert('Unable to capture emulator state.');
      return;
    }
    const screenshot = emulatorInstance.takeScreenshot();
    const newSave: SaveState = {
      id: `save-${activeGame.id}-slot-${slot}`,
      gameId: activeGame.id,
      slot,
      timestamp: Date.now(),
      screenshotUrl: screenshot,
      stateData: JSON.stringify(frozen),
    };
    handleSaveState(newSave);
  };

  const handleLoadSlot = (slot: number) => {
    if (!activeGame) return;
    const save = saveStates.find((s) => s.gameId === activeGame.id && s.slot === slot);
    if (!save) {
      alert(`No saved state found in Slot ${slot}`);
      return;
    }
    try {
      const parsed = JSON.parse(save.stateData);
      emulatorInstance.defrostState(parsed);
      setCurrentTab('emulator');
    } catch (err) {
      alert('Failed to restore corrupted state.');
    }
  };

  const handleDeleteSlot = (id: string) => {
    const updated = saveStates.filter((s) => s.id !== id);
    setSaveStates(updated);
    saveSaveStates(updated);
  };

  const handleQuickLoadRequested = () => {
    if (!activeGame) return null;
    return saveStates.find((s) => s.gameId === activeGame.id && s.slot === 1) || null;
  };

  // Battery save actions
  const handleExportBatterySave = () => {
    if (!activeGame) return;
    const base64 = emulatorInstance.exportBatterySave();
    if (!base64) {
      alert('No battery save data available for this game yet.');
      return;
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeGame.title}.sav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBatterySave = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      emulatorInstance.importBatterySave(base64);
    } catch (err) {
      alert('Failed to read .sav file');
    }
  };

  // Cheats actions
  const handleAddCheat = (cheat: Cheat) => {
    const updated = [cheat, ...cheats];
    setCheats(updated);
    saveCheats(updated);
  };

  const handleToggleCheat = (id: string) => {
    const updated = cheats.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
    setCheats(updated);
    saveCheats(updated);
  };

  const handleDeleteCheat = (id: string) => {
    const updated = cheats.filter((c) => c.id !== id);
    setCheats(updated);
    saveCheats(updated);
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-zinc-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeGameTitle={activeGame?.title}
        fps={emulatorStats.fps}
        speedMultiplier={emulatorStats.speedMultiplier}
      />

      {/* Main Tab Content */}
      <main className="flex-1 w-full overflow-y-auto">
        {currentTab === 'emulator' && (
          <EmulatorScreen
            activeGame={activeGame}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onSaveState={handleSaveState}
            onQuickLoadRequested={handleQuickLoadRequested}
            onSelectGameTab={() => setCurrentTab('games')}
          />
        )}

        {currentTab === 'games' && (
          <GamesLibrary
            games={games}
            activeGameId={activeGame?.id || null}
            onLaunchGame={handleLaunchGame}
            onAddGame={handleAddGame}
            onRemoveGame={handleRemoveGame}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentTab === 'recent' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
            <div className="border-b border-[#1f2533] pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-indigo-400" />
                <span>Recently Played Games</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Games ordered by your most recent gameplay sessions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {games
                .filter((g) => g.lastPlayed)
                .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))
                .map((game) => (
                  <div
                    key={game.id}
                    className="p-4 bg-[#121620] border border-[#222937] hover:border-indigo-500/60 rounded-2xl flex items-center justify-between shadow transition-all"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-white">{game.title}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1 font-mono">
                        <span>{game.code}</span>
                        <span>•</span>
                        <span>Played {game.playCount}x</span>
                        <span>•</span>
                        <span>
                          {game.lastPlayed ? new Date(game.lastPlayed).toLocaleDateString() : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleLaunchGame(game)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Resume</span>
                    </button>
                  </div>
                ))}

              {games.filter((g) => g.lastPlayed).length === 0 && (
                <div className="col-span-full text-center py-12 bg-[#121620] rounded-2xl border border-[#202735] text-zinc-500 text-xs">
                  No games played recently. Start playing from the Games tab!
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'favorites' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
            <div className="border-b border-[#1f2533] pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                <span>Favorite Games</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Your quick-access collection of starred GBA titles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {games
                .filter((g) => g.isFavorite)
                .map((game) => (
                  <div
                    key={game.id}
                    className="p-4 bg-[#121620] border border-[#222937] hover:border-amber-500/60 rounded-2xl flex items-center justify-between shadow transition-all"
                  >
                    <div>
                      <h3 className="font-bold text-sm text-white">{game.title}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1 font-mono">
                        <span>{game.code}</span>
                        <span>•</span>
                        <span>{game.genre || 'Action'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFavorite(game.id)}
                        className="p-1 text-amber-400"
                        title="Remove Favorite"
                      >
                        <Star className="w-4 h-4 fill-amber-400" />
                      </button>
                      <button
                        onClick={() => handleLaunchGame(game)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Play</span>
                      </button>
                    </div>
                  </div>
                ))}

              {games.filter((g) => g.isFavorite).length === 0 && (
                <div className="col-span-full text-center py-12 bg-[#121620] rounded-2xl border border-[#202735] text-zinc-500 text-xs">
                  No favorites added yet. Click the star icon on any game card to add it here.
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'saves' && (
          <SavesManager
            activeGame={activeGame}
            saveStates={saveStates}
            onSaveSlot={handleSaveSlot}
            onLoadSlot={handleLoadSlot}
            onDeleteSlot={handleDeleteSlot}
            onImportBatterySave={handleImportBatterySave}
            onExportBatterySave={handleExportBatterySave}
          />
        )}

        {currentTab === 'cheats' && (
          <CheatsManager
            activeGame={activeGame}
            cheats={cheats}
            onAddCheat={handleAddCheat}
            onToggleCheat={handleToggleCheat}
            onDeleteCheat={handleDeleteCheat}
          />
        )}

        {currentTab === 'controllers' && (
          <ControllerConfig
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenTouchEditor={() => setShowTouchLayoutEditor(true)}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenTouchEditor={() => setShowTouchLayoutEditor(true)}
          />
        )}

        {currentTab === 'sheila-ai' && (
          <SheilaAIAssistant activeGame={activeGame} settings={settings} />
        )}

        {currentTab === 'android-export' && <AndroidProjectExporter />}
      </main>

      {/* Global Touch Layout Editor Modal when triggered from settings/controller */}
      {showTouchLayoutEditor && (
        <TouchLayoutEditor
          layout={settings.controls.touchLayout}
          onChange={(newLayout) => {
            handleUpdateSettings({
              ...settings,
              controls: { ...settings.controls, touchLayout: newLayout },
            });
          }}
          onClose={() => setShowTouchLayoutEditor(false)}
        />
      )}
    </div>
  );
}
