import { Injectable } from '@angular/core';

type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class OpenAIService {
  async complete(apiKey: string, model: string, messages: ChatMessage[]): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages
      })
    });

    if (!response.ok) {
      throw new Error(await this.getErrorMessage(response));
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
    };

    const rawContent = data.choices?.[0]?.message?.content ?? '';
    return this.normalizeContent(rawContent);
  }

  private async getErrorMessage(response: Response): Promise<string> {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body?.error?.message) {
        message = body.error.message;
      }
    } catch {
      // ignore parse failures
    }
    return message;
  }

  private normalizeContent(content: string | Array<{ text?: string }> | undefined): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((segment) => segment?.text ?? '')
        .filter(Boolean)
        .join('\n');
    }

    return '(No text returned from OpenAI)';
  }
}
