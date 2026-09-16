import React, { useState, useRef } from 'react';
import { Game, SaveState, BatterySave } from '../types';
import { emulatorInstance } from '../emulator/GBAEmulator';
import {
  Save,
  Download,
  Trash2,
  Clock,
  HardDrive,
  Upload,
  AlertCircle,
  FileDown,
  CheckCircle,
} from 'lucide-react';

interface SavesManagerProps {
  activeGame: Game | null;
  saveStates: SaveState[];
  onSaveSlot: (slot: number) => void;
  onLoadSlot: (slot: number) => void;
  onDeleteSlot: (id: string) => void;
  onImportBatterySave: (file: File) => void;
  onExportBatterySave: () => void;
}

export const SavesManager: React.FC<SavesManagerProps> = ({
  activeGame,
  saveStates,
  onSaveSlot,
  onLoadSlot,
  onDeleteSlot,
  onImportBatterySave,
  onExportBatterySave,
}) => {
  const [toast, setToast] = useState<string | null>(null);
  const batteryFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 10 Save slots (1 through 10)
  const slots = Array.from({ length: 10 }, (_, i) => i + 1);

  const getSaveForSlot = (slot: number) => {
    if (!activeGame) return null;
    return saveStates.find((s) => s.gameId === activeGame.id && s.slot === slot) || null;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-indigo-900 border border-indigo-500 text-white text-xs px-4 py-2 rounded-xl shadow-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1f2533] pb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Save className="w-6 h-6 text-indigo-400" />
            <span>Save States & Battery Saves</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage instant snapshots (slots 1–10) and cartridge battery save (.sav) data.
          </p>
        </div>

        {activeGame && (
          <div className="flex items-center gap-2 bg-[#121620] border border-[#212836] px-3 py-1.5 rounded-xl text-xs text-zinc-300">
            <span className="font-semibold text-white">{activeGame.title}</span>
            <span className="text-zinc-500">•</span>
            <span className="font-mono text-indigo-300">{activeGame.code}</span>
          </div>
        )}
      </div>

      {/* Battery Save Management Card */}
      <div className="bg-[#11151e] border border-[#222937] rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-amber-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cartridge Battery Save (.sav)</h3>
              <p className="text-xs text-zinc-400">
                Direct SRAM / Flash memory. Compatible with hardware flashcards and other GBA emulators.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={batteryFileInputRef}
              accept=".sav,.srm"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onImportBatterySave(e.target.files[0]);
                  showToast('Imported .sav battery save');
                }
              }}
              className="hidden"
            />
            <button
              onClick={() => batteryFileInputRef.current?.click()}
              disabled={!activeGame}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-xl text-xs font-medium transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import .sav</span>
            </button>
            <button
              onClick={() => {
                onExportBatterySave();
                showToast('Exported battery save file');
              }}
              disabled={!activeGame}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export .sav</span>
            </button>
          </div>
        </div>
      </div>

      {/* Save States Slots 1 to 10 */}
      <div>
        <h3 className="text-sm font-bold text-zinc-200 mb-3 flex items-center gap-2">
          <span>Save State Slots (1–10)</span>
          {!activeGame && (
            <span className="text-xs text-amber-400 font-normal">
              (Load a game to save/restore state snapshots)
            </span>
          )}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {slots.map((slot) => {
            const save = getSaveForSlot(slot);
            return (
              <div
                key={slot}
                className="bg-[#121620] border border-[#212937] hover:border-[#313b4e] rounded-2xl p-3 flex flex-col justify-between space-y-3 transition-all shadow"
              >
                {/* Slot header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                    SLOT {slot}
                  </span>
                  {save && (
                    <button
                      onClick={() => onDeleteSlot(save.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                      title="Delete Save State"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Thumbnail Preview */}
                <div className="aspect-[3/2] bg-[#090b10] rounded-xl overflow-hidden border border-[#1c222e] flex items-center justify-center relative group">
                  {save?.screenshotUrl ? (
                    <img
                      src={save.screenshotUrl}
                      alt={`Slot ${slot}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <Save className="w-5 h-5 text-zinc-600 mx-auto mb-1" />
                      <span className="text-[10px] text-zinc-600 font-mono">EMPTY</span>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>
                    {save ? new Date(save.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'No state'}
                  </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => onSaveSlot(slot)}
                    disabled={!activeGame}
                    className="py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Save className="w-3 h-3 text-indigo-400" />
                    <span>Save</span>
                  </button>

                  <button
                    onClick={() => onLoadSlot(slot)}
                    disabled={!activeGame || !save}
                    className="py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 shadow"
                  >
                    <Download className="w-3 h-3" />
                    <span>Load</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
