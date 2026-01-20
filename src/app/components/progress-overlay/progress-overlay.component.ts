import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressUpdate } from '../../services/progress.service';

@Component({
  selector: 'app-progress-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" *ngIf="update">
      <div class="progress-card">
        <div class="card-header">
          <h3>{{ update.status }}</h3>
          <button *ngIf="update.completed || update.status === 'FAILED' || update.status === 'SUCCESS'" class="close-btn" (click)="onClose()">×</button>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" [style.width.%]="update.percentage ?? update.progress ?? (update.currentRecords / update.totalRecords * 100)"></div>
        </div>
        <div class="percentage">{{ (update.percentage ?? update.progress ?? (update.currentRecords / update.totalRecords * 100)) | number:'1.0-1' }}%</div>
        <div class="stats">
          <div>
            <span class="label">Processed</span>
            {{ update.currentRecords | number }} / {{ update.totalRecords | number }}
          </div>
          <div>
            <span class="label">Time Taken</span>
            {{ (update.timeTakenMs ?? update.timeTaken ?? (update.timeTakenSeconds ? update.timeTakenSeconds * 1000 : 0)) / 1000 | number:'1.1-2' }}s
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./progress-overlay.component.css']
})
export class ProgressOverlayComponent {
  @Input() update: ProgressUpdate | null = null;
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
