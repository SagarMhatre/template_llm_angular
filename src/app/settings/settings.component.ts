import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PromptStateService } from '../prompt-state.service';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  @Output() close = new EventEmitter<void>();

  constructor(protected readonly promptState: PromptStateService) {}

  protected handleApiKeyInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.promptState.setApiKey(value);
  }

  protected handleModelChange(value: string): void {
    this.promptState.setModel(value);
  }
}
