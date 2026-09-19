import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'SHEILA GBA EMU' });
  });

  // SHEILA AI Assistant Endpoint
  app.post('/api/sheila-ai', async (req, res) => {
    try {
      const { message, currentGame, allowOnlineSearch, history } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      const ai = getAI();
      if (!ai) {
        res.json({
          reply: `**SHEILA AI offline standby:** GEMINI_API_KEY is not configured yet in the environment. All emulator features, saves, ROMs, cheats, and game audio are 100% operational locally! To activate SHEILA AI, please add GEMINI_API_KEY to your environment secrets.`,
          sources: [],
        });
        return;
      }

      const systemPrompt = `You are SHEILA AI, the intelligent, built-in copilot for SHEILA GBA EMU, a modern high-performance Game Boy Advance emulator.
Your persona is knowledgeable, concise, professional, and friendly with subtle wolf/gaming themes.
You assist users with:
- Game Boy Advance gameplay tips, secret moves, and walkthroughs
- Cheat code formats (GameShark, Action Replay v3, CodeBreaker) and troubleshooting
- Controller mapping (touch layout customization, Bluetooth/USB gamepads)
- Save state management, battery save backup/restore (.sav)
- Emulation settings (frame skip, integer scaling, aspect ratios, audio buffers)
- ROM library management and legal homebrew games
- Android APK building, source code export, and GitHub Actions CI

Rules:
1. Always identify as SHEILA AI.
2. Current game loaded: ${currentGame ? JSON.stringify(currentGame) : 'None (in library menu)'}.
3. If the user asks for cheat codes or current game info and online search is enabled, retrieve accurate codes and explain their format.
4. Keep explanations clear, well-formatted with markdown and code blocks where helpful.
5. If the user asks about ROM legality: remind them that commercial ROMs should only be imported from cartridges they own, and that SHEILA GBA EMU includes licensed open-source homebrew games.`;

      const contents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          contents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const config: any = {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      };

      if (allowOnlineSearch) {
        config.tools = [{ googleSearch: {} }];
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config,
      });

      const text = response.text || 'SHEILA AI could not generate a response.';
      
      // Extract search grounding metadata if present
      const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = searchChunks
        ? searchChunks
            .filter((c: any) => c.web?.uri)
            .map((c: any) => ({
              title: c.web.title || c.web.uri,
              url: c.web.uri,
            }))
            .slice(0, 4)
        : [];

      res.json({
        reply: text,
        sources,
      });
    } catch (err: any) {
      console.error('SHEILA AI Error:', err);
      res.status(500).json({
        error: err.message || 'Error communicating with SHEILA AI',
        fallback: 'SHEILA AI is temporarily unavailable. Emulator functionality remains fully operational.',
      });
    }
  });

  // Direct APK Download endpoint
  app.get('/api/download-apk', (req, res) => {
    const apkPath = path.join(process.cwd(), 'public', 'sheila-gba-emu.apk');
    if (!fs.existsSync(apkPath)) {
      res.status(404).json({ error: 'APK file not found' });
      return;
    }
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.download(apkPath, 'SHEILA-GBA-EMU.apk');
  });

  // Android Project Exporter (Zip packaging)
  app.get('/api/export-android-project', (req, res) => {
    const androidDir = path.join(process.cwd(), 'android');
    const zipPath = path.join('/tmp', 'SHEILA-GBA-EMU-android.zip');

    if (!fs.existsSync(androidDir)) {
      res.status(404).json({ error: 'Android project directory not found' });
      return;
    }

    // Zip the android folder
    exec(`python3 -m zipfile -c "${zipPath}" "${androidDir}"`, (err) => {
      if (err) {
        console.error('Failed to zip android directory:', err);
        res.status(500).json({ error: 'Failed to create zip archive' });
        return;
      }

      res.download(zipPath, 'SHEILA-GBA-EMU-android.zip', (downloadErr) => {
        if (downloadErr) {
          console.error('Download error:', downloadErr);
        }
      });
    });
  });

  // Full Project Source ZIP export
  app.get('/api/download-app-zip', (req, res) => {
    const zipPath = path.join('/tmp', 'SHEILA-GBA-EMU-source.zip');
    const script = `
import os, zipfile
zip_path = '${zipPath}'
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', '.next', '.cache']]
        for f in files:
            if f.endswith('.zip') or f.endswith('.log'): continue
            p = os.path.join(root, f)
            zf.write(p, p)
`;
    exec(`python3 -c "${script.replace(/"/g, '\\"')}"`, (err) => {
      if (err) {
        console.error('Failed to create project zip archive:', err);
        res.status(500).json({ error: 'Failed to create zip archive' });
        return;
      }
      res.download(zipPath, 'SHEILA-GBA-EMU-source.zip');
    });
  });

  // Static public directory (manifest.json, sw.js, icon.svg, homebrew ROMs)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware for development vs static production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SHEILA GBA EMU server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
