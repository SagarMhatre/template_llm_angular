import express from 'express';
import cors from 'cors';
import { agent, llmOpenAI } from 'volcano-sdk';

const app = express();
const port = Number(process.env.API_PORT ?? 4300);
const host = process.env.API_HOST ?? '0.0.0.0';
const defaultModel = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/prompt', async (req, res) => {
  const { apiKey, prompt } = req.body ?? {};

  if (typeof apiKey !== 'string' || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'apiKey and prompt are required strings.' });
  }

  try {
    const llm = llmOpenAI({
      apiKey,
      model: defaultModel
    });

    const results = await agent({ llm }).then({ prompt }).run();
    const lastStep = results.at(-1);
    const output = lastStep?.llmOutput;
    let responseText = '';

    if (typeof output === 'string') {
      responseText = output;
    } else if (output && typeof output === 'object') {
      const hasResponse =
        Object.prototype.hasOwnProperty.call(output, 'response') &&
        typeof output.response === 'string';
      responseText = hasResponse ? output.response : JSON.stringify(output, null, 2);
    } else {
      responseText = '(no response returned)';
    }

    res.json({ response: responseText });
  } catch (error) {
    console.error('[volcano-api] request failed', error);
    const message = error instanceof Error ? error.message : 'Unknown error contacting OpenAI.';
    res.status(500).json({ error: message });
  }
});

app.listen(port, host, () => {
  console.log(`[volcano-api] listening on http://${host}:${port} using model ${defaultModel}`);
});
