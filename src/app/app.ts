import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentReportComponent } from './components/student-report/student-report.component';
import { ProgressOverlayComponent } from './components/progress-overlay/progress-overlay.component';
import { ProgressService, ProgressUpdate } from './services/progress.service';
import { StudentService } from './services/student.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, StudentReportComponent, ProgressOverlayComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Assessment Dashboard');
  currentProgress: ProgressUpdate | null = null;

  constructor(
    private progressService: ProgressService,
    private studentService: StudentService,
    private cdr: ChangeDetectorRef
  ) { }

  onGenerateData() {
    const taskId = 'gen-' + Date.now();
    this.progressService.watchProgress(taskId).subscribe(update => {
      this.currentProgress = update;
      this.cdr.detectChanges();
    });

    this.studentService.generateData(1000).subscribe({
      next: () => console.log('Generation started'),
      error: (err) => console.error('Error starting generation', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const taskId = 'proc-' + Date.now();
      this.progressService.watchProgress(taskId).subscribe(update => {
        this.currentProgress = update;
        this.cdr.detectChanges();
      });

      this.studentService.processExcel(file).subscribe({
        next: () => console.log('Processing started'),
        error: (err) => console.error('Error starting processing', err)
      });
    }
  }
}
