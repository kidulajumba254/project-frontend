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
        <h3>{{ update.status }}</h3>
        <div class="progress-bar-container">
          <div class="progress-bar" [style.width.%]="update.percentage"></div>
        </div>
        <div class="percentage">{{ update.percentage | number:'1.1-2' }}%</div>
        <div class="stats">
          <div>
            <span class="label">Processed</span>
            {{ update.currentRecords | number }} / {{ update.totalRecords | number }}
          </div>
          <div>
            <span class="label">Time Taken</span>
            {{ update.timeTakenMs / 1000 | number:'1.1-2' }}s
          </div>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['./progress-overlay.component.css']
})
export class ProgressOverlayComponent {
    @Input() update: ProgressUpdate | null = null;
}
