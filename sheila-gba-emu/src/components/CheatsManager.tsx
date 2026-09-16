import React, { useState } from 'react';
import { Game, Cheat, CheatFormat } from '../types';
import { validateCheatCode } from '../utils/cheatValidator';
import { Wand2, Plus, Trash2, CheckCircle2, XCircle, AlertTriangle, Edit3, HelpCircle } from 'lucide-react';

interface CheatsManagerProps {
  activeGame: Game | null;
  cheats: Cheat[];
  onAddCheat: (cheat: Cheat) => void;
  onToggleCheat: (id: string) => void;
  onDeleteCheat: (id: string) => void;
}

export const CheatsManager: React.FC<CheatsManagerProps> = ({
  activeGame,
  cheats,
  onAddCheat,
  onToggleCheat,
  onDeleteCheat,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [format, setFormat] = useState<CheatFormat>('ActionReplay');
  const [description, setDescription] = useState('');

  // Live validator preview
  const validation = validateCheatCode(code, format);

  const handleSaveCheat = () => {
    if (!name.trim()) {
      alert('Please provide a descriptive name for this cheat.');
      return;
    }
    if (!validation.isValid) {
      alert(validation.errorMessage || 'Invalid cheat code format.');
      return;
    }

    const newCheat: Cheat = {
      id: `cheat-${Date.now()}`,
      gameId: activeGame ? activeGame.id : 'global',
      name: name.trim(),
      code: validation.normalizedCode,
      format: validation.detectedFormat,
      status: 'ENABLED',
      enabled: true,
      description: description.trim() || undefined,
    };

    onAddCheat(newCheat);
    setShowAddModal(false);
    setName('');
    setCode('');
    setDescription('');
  };

  // Filter cheats for currently active game or all
  const gameCheats = activeGame
    ? cheats.filter((c) => c.gameId === activeGame.id || c.gameId === 'global')
    : cheats;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1f2533] pb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-indigo-400" />
            <span>Cheat Engine & Codes</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            GameShark, Action Replay v3, and CodeBreaker cheat code injector with real-time syntax checking.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Cheat</span>
        </button>
      </div>

      {/* Format Info Banner */}
      <div className="bg-[#11151e] border border-[#202735] rounded-2xl p-4 text-xs text-zinc-300 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <span className="font-bold text-indigo-300">Action Replay / GameShark v3</span>
          <p className="text-zinc-400 text-[11px]">
            16 hexadecimal digits (8 + 8): <br />
            <code className="text-indigo-200 font-mono">XXXXXXXX YYYYYYYY</code>
          </p>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-emerald-300">CodeBreaker</span>
          <p className="text-zinc-400 text-[11px]">
            12 hexadecimal digits (8 + 4): <br />
            <code className="text-emerald-200 font-mono">XXXXXXXX YYYY</code>
          </p>
        </div>
        <div className="space-y-1">
          <span className="font-bold text-amber-300">Real-Time Validation</span>
          <p className="text-zinc-400 text-[11px]">
            Invalid memory addresses or corrupted syntax will be flagged before injection.
          </p>
        </div>
      </div>

      {/* Cheats List */}
      <div className="space-y-3">
        {gameCheats.map((cheat) => (
          <div
            key={cheat.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-[#121620] border border-[#212937] gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{cheat.name}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                  {cheat.format}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                    !cheat.enabled
                      ? 'bg-zinc-800 text-zinc-400'
                      : cheat.status === 'ENABLED'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                  }`}
                >
                  {!cheat.enabled ? (
                    'DISABLED'
                  ) : cheat.status === 'ENABLED' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>ENABLED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      <span>INVALID</span>
                    </>
                  )}
                </span>
              </div>

              {cheat.description && (
                <p className="text-xs text-zinc-400">{cheat.description}</p>
              )}

              <pre className="text-[11px] font-mono text-zinc-300 bg-[#090b10] px-3 py-1.5 rounded-lg border border-[#1b202c] overflow-x-auto">
                {cheat.code}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <span>Active</span>
                <input
                  type="checkbox"
                  checked={cheat.enabled}
                  onChange={() => onToggleCheat(cheat.id)}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
              </label>

              <button
                onClick={() => onDeleteCheat(cheat.id)}
                className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Delete Cheat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {gameCheats.length === 0 && (
          <div className="text-center py-12 bg-[#121620] rounded-2xl border border-[#202735] space-y-2">
            <Wand2 className="w-8 h-8 text-zinc-500 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">No cheat codes added yet</p>
            <p className="text-xs text-zinc-500">
              Click &quot;Add New Cheat&quot; or ask SHEILA AI to find cheat codes for your current game.
            </p>
          </div>
        )}
      </div>

      {/* Add Cheat Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12151d] border border-[#242b38] rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#212734] pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Add Cheat Code</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 bg-zinc-800 rounded-lg"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Cheat Description / Name</label>
                <input
                  type="text"
                  placeholder="e.g. Infinite Lives, Max Gold, Walk Through Walls"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#181d27] border border-[#262e3d] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as CheatFormat)}
                  className="w-full px-3 py-2 bg-[#181d27] border border-[#262e3d] rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ActionReplay">Action Replay v3</option>
                  <option value="GameShark">GameShark</option>
                  <option value="CodeBreaker">CodeBreaker</option>
                  <option value="Raw">Raw Memory Poke</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Code</label>
                <textarea
                  rows={4}
                  placeholder={`82003884 03E7\nXXXXXXXX YYYYYYYY`}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0a0c10] border border-[#262e3d] rounded-xl text-indigo-200 font-mono focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                />
              </div>

              {/* Validation Status Preview */}
              {code.trim() && (
                <div
                  className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
                    validation.isValid
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                  }`}
                >
                  {validation.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold">
                      {validation.isValid
                        ? `Valid ${validation.detectedFormat} syntax detected`
                        : 'Syntax Error'}
                    </span>
                    {validation.errorMessage && (
                      <p className="mt-0.5 text-zinc-400">{validation.errorMessage}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveCheat}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-xs shadow-lg transition-colors"
              >
                Save Cheat Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
