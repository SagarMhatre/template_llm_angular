import { Injectable, signal } from '@angular/core';

interface ChoiceMessage {
  content?: string | Array<{ text?: string }>;
}

@Injectable({ providedIn: 'root' })
export class PromptStateService {
  readonly apiKey = signal('');
  readonly selectedModel = signal('gpt-4o-mini');
  readonly prompt = signal('');
  readonly response = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly availableModels = [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (cheap, fast)' },
    { value: 'gpt-4o', label: 'GPT-4o (balanced)' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4.1', label: 'GPT-4.1' }
  ];

  setApiKey(value: string): void {
    this.apiKey.set(value);
  }

  setModel(value: string): void {
    this.selectedModel.set(value);
  }

  setPrompt(value: string): void {
    this.prompt.set(value);
  }

  resetResponse(): void {
    this.response.set('');
    this.error.set(null);
  }

  async sendPrompt(): Promise<void> {
    const text = this.prompt().trim();
    const key = this.apiKey().trim();

    if (!text || !key || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.response.set('');

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`
        },
        body: JSON.stringify({
          model: this.selectedModel(),
          messages: [{ role: 'user', content: text }]
        })
      });

      if (!res.ok) {
        let message = `Request failed (${res.status})`;
        try {
          const body = (await res.json()) as { error?: { message?: string } };
          if (body?.error?.message) {
            message = body.error.message;
          }
        } catch {
          // ignore JSON parse errors
        }
        throw new Error(message);
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: ChoiceMessage }>;
      };

      const choice = data.choices?.[0];
      const message = choice?.message?.content;
      let result = '';

      if (typeof message === 'string') {
        result = message;
      } else if (Array.isArray(message)) {
        result = message
          .map((segment) => segment?.text ?? '')
          .filter(Boolean)
          .join('\n');
      } else {
        result = '(No text returned from OpenAI)';
      }

      this.response.set(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error contacting OpenAI.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
