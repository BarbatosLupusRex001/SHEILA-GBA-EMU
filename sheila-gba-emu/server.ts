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

  // Initialize Gemini SDK with telemetry header
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

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
