import { Component, signal, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentReportComponent } from './components/student-report/student-report.component';
import { ProgressOverlayComponent } from './components/progress-overlay/progress-overlay.component';
import { ProgressService, ProgressUpdate } from './services/progress.service';
import { StudentService } from './services/student.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, StudentReportComponent, ProgressOverlayComponent, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Assessment Dashboard');
  currentProgress: ProgressUpdate | null = null;
  recordCount: number = 1000000;

  constructor(
    private progressService: ProgressService,
    private studentService: StudentService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) { }

  onGenerateData() {
    if (this.recordCount <= 0) {
      this.toastr.warning('Please enter a valid number of records', 'Invalid Input');
      return;
    }
    this.studentService.generateData(this.recordCount).subscribe({
      next: (res: any) => {
        const taskId = res.taskId;
        this.toastr.info('Data generation started...', 'Task Started');
        this.progressService.watchProgress(taskId).subscribe(update => {
          this.currentProgress = update;
          if (update?.completed) {
            this.toastr.success('Data generation completed successfully!', 'Success');
            setTimeout(() => {
              this.currentProgress = null;
              this.cdr.detectChanges();
            }, 3000);
          }
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.toastr.error('Failed to start data generation', 'Error');
        console.error('Error starting generation', err);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const isExcel = file.name.endsWith('.xlsx');
      const taskType = isExcel ? 'Excel Processing' : 'CSV Upload';
      const obs = isExcel ? this.studentService.processExcel(file) : this.studentService.uploadCsv(file);

      this.toastr.info(`${taskType} started...`, 'Task Started');
      obs.subscribe({
        next: (res: any) => {
          const taskId = res.taskId;
          this.progressService.watchProgress(taskId).subscribe(update => {
            this.currentProgress = update;
            if (update?.completed) {
              this.toastr.success(`${taskType} completed successfully!`, 'Success');
              setTimeout(() => {
                this.currentProgress = null;
                this.cdr.detectChanges();
              }, 3000);
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.toastr.error(`Failed to start ${taskType.toLowerCase()}`, 'Error');
          console.error('Error starting task', err);
        }
      });
      // Clear input
      event.target.value = '';
    }
  }

  onCsvFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.toastr.info(`CSV Upload started...`, 'Task Started');
      this.studentService.uploadCsv(file).subscribe({
        next: (res: any) => {
          const taskId = res.taskId;
          this.progressService.watchProgress(taskId).subscribe(update => {
            this.currentProgress = update;
            if (update?.completed) {
              this.toastr.success(`CSV Upload completed successfully!`, 'Success');
              setTimeout(() => {
                this.currentProgress = null;
                this.cdr.detectChanges();
              }, 3000);
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.toastr.error(`Failed to start CSV upload`, 'Error');
          console.error('Error starting task', err);
        }
      });
      // Clear input
      event.target.value = '';
    }
  }
}
