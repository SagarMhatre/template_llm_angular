import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export type ModelOption = {
  value: string;
  label: string;
};

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  @Input({ required: true }) apiKey = '';
  @Input({ required: true }) selectedModel = '';
  @Input({ required: true }) availableModels: ModelOption[] = [];
  @Input({ required: true }) loading = false;

  @Output() apiKeyChange = new EventEmitter<string>();
  @Output() modelChange = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  protected handleApiKeyInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.apiKeyChange.emit(value);
  }
}
