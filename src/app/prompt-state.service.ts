import { Injectable, signal } from '@angular/core';
import { OpenAIService } from './openai.service';

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

  constructor(private readonly openAI: OpenAIService) {}

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
      const content = await this.openAI.complete(key, this.selectedModel(), [
        { role: 'user', content: text }
      ]);
      this.response.set(content);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error contacting OpenAI.';
      this.error.set(message);
    } finally {
      this.loading.set(false);
    }
  }
}
