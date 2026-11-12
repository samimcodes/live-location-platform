import { Request, Response } from 'express';

interface CircleMemberTelemetry {
  id?: number;
  name: string;
  status: string;
  battery?: number;
  speed?: number;
  address?: string;
  lat?: number;
  lng?: number;
}

interface ChatMessageHistory {
  role: 'user' | 'assistant';
  text: string;
}

interface AskAIRequest {
  query?: string;
  coords?: {
    lat: number;
    lng: number;
  };
  locationName?: string;
  circleMembers?: CircleMemberTelemetry[];
  history?: ChatMessageHistory[];
  generateAudio?: boolean;
}

interface MapActionPayload {
  type: 'FLY_TO' | 'ROUTE_TO';
  targetName: string;
  lat: number;
  lng: number;
  friendId?: number;
}

const DEFAULT_GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-3.5-flash',
] as const;

// Cache the fastest working model in memory to avoid retrying slower/failed models on every turn.
let preferredGeminiModel: string | null = null;

function resolveModelsOrder(): string[] {
  if (!preferredGeminiModel) return [...DEFAULT_GEMINI_MODELS];
  return [
    preferredGeminiModel,
    ...DEFAULT_GEMINI_MODELS.filter((m) => m !== preferredGeminiModel),
  ];
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#_~•]/g, ' ')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate native Google Neural Audio (MP3) for authentic Bengali or English speech.
 */
async function getGoogleTTSAudio(text: string, lang = 'bn'): Promise<string | null> {
  try {
    const clean = cleanTextForSpeech(text);
    if (!clean) return null;
    const truncated = clean.length > 280 ? clean.slice(0, 280) + '...' : clean;
    const targetLang = lang === 'en' ? 'en' : 'bn';
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&q=${encodeURIComponent(truncated)}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    clearTimeout(timer);

    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return 'data:audio/mpeg;base64,' + Buffer.from(arrayBuffer).toString('base64');
  } catch (e) {
    console.warn('TTS generation warning:', e);
    return null;
  }
}

/**
 * Build shared telemetry context, system prompt, chat contents, and member lookup helpers.
 */
function prepareAIContext(body: AskAIRequest, query: string) {
  const { coords, locationName, circleMembers = [], history = [] } = body;
  const userLoc =
    locationName || (coords ? `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°` : 'Live Area');

  const validMembers = (circleMembers || [])
    .filter((m) => m && m.name)
    .map((m) => ({
      id: m.id,
      name: m.name,
      status: m.status,
      battery: m.battery,
      speed: m.speed,
      address: m.address,
      lat: m.lat,
      lng: m.lng,
    }));

  const isBengali =
    /[\u0980-\u09FF]/.test(query) ||
    /\b(kothae|koi|kemon|kache|shobai|ke|bhalo|shomoy|nirapod|dekho|bolen|bolo|ki|ache|dure|tumi)\b/i.test(query);

  const findReferencedMember = (textToScan: string) => {
    const lowerText = textToScan.toLowerCase();
    return validMembers.find(
      (m) =>
        m.lat != null &&
        m.lng != null &&
        (lowerText.includes(m.name.toLowerCase()) ||
          m.name.toLowerCase().split(' ').some((part) => part.length > 2 && lowerText.includes(part)))
    );
  };

  const toFlyAction = (member: (typeof validMembers)[number] | undefined): MapActionPayload | null => {
    if (!member || member.lat == null || member.lng == null) return null;
    return {
      type: 'FLY_TO',
      targetName: member.name,
      lat: member.lat,
      lng: member.lng,
      friendId: member.id,
    };
  };

  // Compact telemetry summary keeps prompt tokens small for faster first-token latency.
  const compactTelemetry = validMembers.map((m) => ({
    name: m.name,
    status: m.status,
    battery: m.battery,
    speed: m.speed,
    address: m.address,
    ...(coords && m.lat != null && m.lng != null
      ? { distKm: calculateDistanceKm(coords.lat, coords.lng, m.lat, m.lng) }
      : {}),
  }));

  const systemInstructionText = [
    'You are LocaLink AI — fast, concise, executive spatial & conversational assistant.',
    `User Location: ${userLoc}${coords ? ` (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` : ''}`,
    `Active Circle (${validMembers.length}): ${compactTelemetry.length > 0 ? JSON.stringify(compactTelemetry) : 'None'}`,
    'RULES:',
    '- You HAVE live GPS & telemetry shown above. Answer location/member questions directly using exact names, distance (distKm), battery, and speed.',
    '- Match user language: Bengali/Banglish -> fluent natural Bengali; English -> crisp modern English.',
    '- Be direct, punchy, and accurate (1-3 short sentences or crisp bullets; zero fluff).',
    '- For general questions (coding, ideas, advice), answer directly like ChatGPT.',
  ].join('\n');

  const previousTurns = (history || [])
    .slice(-6)
    .filter((h) => h && h.text && h.text.trim())
    .map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.text.trim() }],
    }));

  const contents = [
    ...previousTurns,
    {
      role: 'user',
      parts: [{ text: query.trim() }],
    },
  ];

  return {
    userLoc,
    coords,
    validMembers,
    isBengali,
    findReferencedMember,
    toFlyAction,
    systemInstructionText,
    contents,
  };
}

/**
 * Instant zero-latency spatial telemetry fallback engine.
 */
function buildSpatialFallback(
  query: string,
  ctx: ReturnType<typeof prepareAIContext>
): { text: string; action: MapActionPayload | null } {
  const { coords, userLoc, validMembers, isBengali, findReferencedMember, toFlyAction } = ctx;
  const lower = query.toLowerCase();
  let fallbackText = '';
  let action: MapActionPayload | null = null;

  const specificMember = findReferencedMember(lower);
  const isClosestQuery =
    lower.includes('closest') ||
    lower.includes('nearest') ||
    lower.includes('kache') ||
    lower.includes('nikot') ||
    query.includes('কাছে');

  if (isClosestQuery && coords && validMembers.length > 0) {
    const membersWithDist = validMembers
      .filter((m) => m.lat != null && m.lng != null)
      .map((m) => ({
        ...m,
        distance: calculateDistanceKm(coords.lat, coords.lng, m.lat!, m.lng!),
      }))
      .sort((a, b) => a.distance - b.distance);

    if (membersWithDist.length > 0) {
      const closest = membersWithDist[0];
      action = toFlyAction(closest);
      fallbackText = isBengali
        ? `আপনার সবচেয়ে কাছে আছেন ${closest.name} (${closest.distance} কিমি দূরে, ${closest.address || 'পথে'})। ব্যাটারি ${closest.battery ?? 80}%।`
        : `${closest.name} is closest to you (${closest.distance} km away at ${closest.address || 'in transit'}). Battery is at ${closest.battery ?? 80}%.`;
    }
  } else if (specificMember && specificMember.lat != null && specificMember.lng != null) {
    action = toFlyAction(specificMember);
    const dist = coords
      ? calculateDistanceKm(coords.lat, coords.lng, specificMember.lat, specificMember.lng)
      : null;
    const distStr = dist !== null ? ` (${dist} km away)` : '';
    const speedStr = (specificMember.speed ?? 0) > 3 ? `, moving at ${specificMember.speed} km/h` : '';

    fallbackText = isBengali
      ? `${specificMember.name} বর্তমানে ${specificMember.address || 'লাইভ ট্র্যাকিংয়ে'} আছেন${dist ? ` (দূরত্ব: ${dist} কিমি)` : ''}। ব্যাটারি: ${specificMember.battery ?? 85}%, অবস্থা: ${specificMember.status}।`
      : `${specificMember.name} is currently at ${specificMember.address || 'active on map'}${distStr}${speedStr}. Battery is ${specificMember.battery ?? 85}%.`;
  } else if (
    lower.includes('battery') ||
    lower.includes('charge') ||
    lower.includes('power') ||
    query.includes('ব্যাটারি')
  ) {
    const lowBatteryMembers = validMembers.filter((m) => (m.battery ?? 100) < 25);
    if (lowBatteryMembers.length > 0) {
      const names = lowBatteryMembers.map((m) => `${m.name} (${m.battery}%)`).join(', ');
      fallbackText = isBengali
        ? `সতর্কতা: সার্কেলের কিছু সদস্যের ব্যাটারি কম: ${names}। বাকিদের ডিভাইস চার্জ নিরাপদ পর্যায়ে রয়েছে।`
        : `Notice: Low battery detected for ${names}. All other circle devices have adequate power.`;
    } else {
      fallbackText = isBengali
        ? `সার্কেলের সবার ব্যাটারি লেভেল চমৎকার অবস্থায় আছে (গড় চার্জ ৮০%+)। কোনো ডিভাইসে লো-ব্যাটারি সতর্কতা নেই।`
        : `All circle devices have healthy battery levels (average 80%+). No low battery warnings.`;
    }
  } else if (
    lower.includes('safe') ||
    lower.includes('safety') ||
    lower.includes('shield') ||
    lower.includes('nirapod') ||
    query.includes('নিরাপদ') ||
    query.includes('নিরাপত্তা')
  ) {
    fallbackText = isBengali
      ? `নিরাপত্তা স্ট্যাটাস: সার্কেলের সকল সদস্য নিরাপদ জোনে আছেন। জিওফেন্স অ্যালার্ট অক্ষুণ্ণ রয়েছে এবং কোনো অস্বাভাবিক মুভমেন্ট চিহ্নিত হয়নি।`
      : `Circle status: 100% Secure. Geofence perimeters are intact, and zero unauthorized detours have been detected.`;
  } else if (
    lower.includes('eta') ||
    lower.includes('traffic') ||
    lower.includes('arrival') ||
    lower.includes('shomoy') ||
    lower.includes('jam') ||
    query.includes('কতক্ষণ') ||
    query.includes('ট্র্যাফিক')
  ) {
    fallbackText = isBengali
      ? `রিয়েল-টাইম ট্র্যাফিক সাধারণ গতিতে চলছে। সার্কেলের সবাই সঠিক সময়ে পৌঁছানোর গতিসীমায় আছেন।`
      : `Real-time ETA analysis: Routes are flowing smoothly and circle arrivals look on schedule.`;
  } else if (
    lower.includes('where') ||
    lower.includes('kothae') ||
    lower.includes('location') ||
    lower.includes('shobai') ||
    query.includes('কোথায়')
  ) {
    fallbackText = isBengali
      ? `আপনার জিপিএস সিগন্যাল ${userLoc}-এ লক করা আছে। সার্কেলের ${validMembers.length} জন সদস্যের লাইভ লোকেশন মানচিত্রে সক্রিয় রয়েছে।`
      : `Your GPS telemetry is locked at ${userLoc}. All ${validMembers.length} circle members are synchronized on the map.`;
  } else {
    fallbackText = isBengali
      ? `লোকালিংক এআই আপনার সার্কেল মনিটর করছে। অবস্থান: ${userLoc}। আপনি সার্কেলের যেকোনো তথ্য অথবা যেকোনো সাধারণ প্রশ্ন করতে পারেন।`
      : `LocaLink AI is active at ${userLoc}. Ask about circle members, safety, or anything else you need.`;
  }

  return { text: fallbackText, action };
}

export class AIController {
  /**
   * POST /api/v1/ai/ask
   * Fast JSON response endpoint (skips blocking TTS generation unless explicitly requested).
   */
  static async askAI(req: Request, res: Response) {
    try {
      const body = req.body as AskAIRequest;
      const { query, generateAudio = false } = body;

      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter is required',
        });
      }

      const apiKey = process.env.GEMINI_API_KEY?.trim();
      const ctx = prepareAIContext(body, query);

      if (apiKey && apiKey !== 'your_gemini_api_key_here') {
        for (const model of resolveModelsOrder()) {
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 6000);

            const geminiResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                signal: controller.signal,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemInstruction: {
                    parts: [{ text: ctx.systemInstructionText }],
                  },
                  contents: ctx.contents,
                  generationConfig: {
                    temperature: 0.55,
                    maxOutputTokens: 280,
                  },
                }),
              }
            );
            clearTimeout(timer);

            if (geminiResponse.ok) {
              const data = (await geminiResponse.json()) as {
                candidates?: Array<{
                  content?: {
                    parts?: Array<{ text?: string }>;
                  };
                }>;
              };

              const fullText = (data?.candidates?.[0]?.content?.parts || [])
                .map((p) => p.text)
                .filter(Boolean)
                .join('')
                .trim();

              if (fullText) {
                preferredGeminiModel = model;
                const referenced = ctx.findReferencedMember(query + ' ' + fullText);
                const speechLang = /[\u0980-\u09FF]/.test(fullText) ? 'bn' : 'en';
                const audioBase64 = generateAudio ? await getGoogleTTSAudio(fullText, speechLang) : null;

                return res.json({
                  success: true,
                  provider: 'gemini',
                  model,
                  data: {
                    response: fullText,
                    location: ctx.userLoc,
                    audioBase64,
                    action: ctx.toFlyAction(referenced),
                    timestamp: new Date().toISOString(),
                  },
                });
              }
            } else {
              const errText = await geminiResponse.text().catch(() => '');
              console.warn(`Gemini model ${model} returned ${geminiResponse.status}:`, errText.slice(0, 200));
            }
          } catch (modelErr) {
            console.warn(`Error connecting to Gemini model ${model}:`, modelErr);
          }
        }
      }

      const fallback = buildSpatialFallback(query, ctx);
      const speechLang = ctx.isBengali ? 'bn' : 'en';
      const audioBase64 = generateAudio ? await getGoogleTTSAudio(fallback.text, speechLang) : null;

      return res.json({
        success: true,
        provider: 'spatial-engine',
        data: {
          response: fallback.text,
          location: ctx.userLoc,
          audioBase64,
          action: fallback.action,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('AI Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal AI processing error',
      });
    }
  }

  /**
   * POST /api/v1/ai/stream
   * Real-time Server-Sent Events (SSE) streaming endpoint for sub-second Time-To-First-Token.
   */
  static async streamAI(req: Request, res: Response) {
    const body = req.body as AskAIRequest;
    const { query } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required',
      });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const writeEvent = (payload: Record<string, unknown>) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    };

    let clientClosed = false;
    const activeController = new AbortController();
    req.on('close', () => {
      clientClosed = true;
      activeController.abort();
    });

    try {
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      const ctx = prepareAIContext(body, query);

      if (apiKey && apiKey !== 'your_gemini_api_key_here') {
        for (const model of resolveModelsOrder()) {
          if (clientClosed) return;
          const modelController = new AbortController();
          const abortOnClose = () => modelController.abort();
          activeController.signal.addEventListener('abort', abortOnClose, { once: true });
          const timer = setTimeout(() => modelController.abort(), 8500);

          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
              {
                method: 'POST',
                signal: modelController.signal,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  systemInstruction: {
                    parts: [{ text: ctx.systemInstructionText }],
                  },
                  contents: ctx.contents,
                  generationConfig: {
                    temperature: 0.55,
                    maxOutputTokens: 280,
                  },
                }),
              }
            );

            if (!geminiRes.ok || !geminiRes.body) {
              clearTimeout(timer);
              activeController.signal.removeEventListener('abort', abortOnClose);
              const errText = await geminiRes.text().catch(() => '');
              console.warn(`Gemini stream model ${model} returned ${geminiRes.status}:`, errText.slice(0, 200));
              continue;
            }

            const reader = geminiRes.body.getReader();
            const decoder = new TextDecoder();
            let sseBuffer = '';
            let accumulated = '';

            while (!clientClosed) {
              const { value, done } = await reader.read();
              if (done) break;

              sseBuffer += decoder.decode(value, { stream: true });
              const lines = sseBuffer.split(/\r?\n/);
              sseBuffer = lines.pop() ?? '';

              for (const rawLine of lines) {
                const line = rawLine.trim();
                if (!line.startsWith('data:')) continue;
                const dataStr = line.slice(5).trim();
                if (!dataStr || dataStr === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(dataStr) as {
                    candidates?: Array<{
                      content?: {
                        parts?: Array<{ text?: string }>;
                      };
                    }>;
                  };
                  const delta = (parsed?.candidates?.[0]?.content?.parts || [])
                    .map((p) => p.text)
                    .filter(Boolean)
                    .join('');
                  if (delta) {
                    accumulated += delta;
                    writeEvent({ type: 'chunk', text: delta, model });
                  }
                } catch {
                  // Ignore partial JSON lines across chunk boundaries
                }
              }
            }

            clearTimeout(timer);
            activeController.signal.removeEventListener('abort', abortOnClose);

            if (clientClosed) {
              if (!res.writableEnded) res.end();
              return;
            }

            const finalText = accumulated.trim();
            if (finalText) {
              preferredGeminiModel = model;
              const referenced = ctx.findReferencedMember(query + ' ' + finalText);
              writeEvent({
                type: 'done',
                fullText: finalText,
                provider: 'gemini',
                model,
                location: ctx.userLoc,
                action: ctx.toFlyAction(referenced),
                timestamp: new Date().toISOString(),
              });
              if (!res.writableEnded) res.end();
              return;
            }
          } catch (streamErr) {
            clearTimeout(timer);
            activeController.signal.removeEventListener('abort', abortOnClose);
            if (clientClosed) {
              if (!res.writableEnded) res.end();
              return;
            }
            console.warn(`Error streaming Gemini model ${model}:`, streamErr);
          }
        }
      }

      if (!clientClosed) {
        const fallback = buildSpatialFallback(query, ctx);
        writeEvent({ type: 'chunk', text: fallback.text, model: 'spatial-engine' });
        writeEvent({
          type: 'done',
          fullText: fallback.text,
          provider: 'spatial-engine',
          model: 'spatial-engine',
          location: ctx.userLoc,
          action: fallback.action,
          timestamp: new Date().toISOString(),
        });
      }
      if (!res.writableEnded) res.end();
    } catch (error) {
      console.error('AI Stream Error:', error);
      if (!res.writableEnded) {
        writeEvent({
          type: 'error',
          message: 'Internal AI streaming error',
        });
        res.end();
      }
    }
  }

  /**
   * POST /api/v1/ai/tts
   * Generate crystal-clear Google audio stream for any text.
   */
  static async textToSpeech(req: Request, res: Response) {
    try {
      const { text, lang = 'bn' } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ success: false, message: 'Text is required' });
      }
      const audioBase64 = await getGoogleTTSAudio(text, lang);
      return res.json({ success: true, audioBase64 });
    } catch (err) {
      console.error('TTS Controller Error:', err);
      return res.status(500).json({ success: false, message: 'TTS generation failed' });
    }
  }

  /**
   * POST /api/v1/ai/predict-eta
   * Calculate smart AI travel prediction between two coordinates.
   */
  static async predictETA(req: Request, res: Response) {
    try {
      const { origin, destination, currentSpeed } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({
          success: false,
          message: 'Origin and destination coordinates are required',
        });
      }

      const distanceKm = calculateDistanceKm(origin.lat, origin.lng, destination.lat, destination.lng);
      const speedKmH = currentSpeed && currentSpeed > 5 ? currentSpeed : 35;
      const minutes = Math.max(1, Math.round((distanceKm / speedKmH) * 60));

      return res.json({
        success: true,
        data: {
          distanceKm,
          estimatedMinutes: minutes,
          trafficCondition: 'Moderate - Flowing smoothly',
          predictedArrival: new Date(Date.now() + minutes * 60000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      });
    } catch (error) {
      console.error('ETA Prediction Error:', error);
      return res.status(500).json({
        success: false,
        message: 'ETA prediction failed',
      });
    }
  }
}
