import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';
import { ProgressService } from '../../services/progress.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, throttleTime } from 'rxjs';

@Component({
  selector: 'app-student-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="report-container">
      <h2>Task 4 & 5: Student Report & Export</h2>
      
      <div class="filters">
        <div class="form-group">
          <label>Search ID:</label>
          <input type="text" [(ngModel)]="searchId" (ngModelChange)="onFilterChange()" placeholder="Enter Student ID">
        </div>
        <div class="form-group">
          <label>Filter Class:</label>
          <select [(ngModel)]="selectedClass" (change)="onFilterChange()">
            <option value="All">All Classes</option>
            <option *ngFor="let c of classes" [value]="c">{{ c }}</option>
          </select>
        </div>
      </div>

      <div class="export-buttons">
        <button class="btn btn-sm btn-primary" (click)="onExport('excel')">Export Excel</button>
        <button class="btn btn-sm btn-secondary" (click)="onExport('csv')">Export CSV</button>
        <button class="btn btn-sm btn-success" (click)="onExport('pdf')">Export PDF</button>
        
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>DOB</th>
              <th>Class</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of students">
              <td>{{ s.studentId }}</td>
              <td>{{ s.firstName }}</td>
              <td>{{ s.lastName }}</td>
              <td>{{ s.dob }}</td>
              <td>{{ s.studentClass }}</td>
              <td>{{ s.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <span>Page {{ page + 1 }} of {{ totalPages }} (Total: {{ totalElements }})</span>
        <div class="btn-group">
          <button [disabled]="page === 0" (click)="onPageChange(page - 1)">Previous</button>
          <button [disabled]="page >= totalPages - 1" (click)="onPageChange(page + 1)">Next</button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./student-report.component.css']
})
export class StudentReportComponent implements OnInit {
  students: any[] = [];
  classes = ['Class1', 'Class2', 'Class3', 'Class4', 'Class5'];
  searchId = '';
  selectedClass = 'All';
  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  private progressSub?: Subscription;

  constructor(
    private studentService: StudentService,
    private progressService: ProgressService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.loadStudents();
    this.setupProgressMonitoring();
  }

  ngOnDestroy() {
    this.progressSub?.unsubscribe();
  }

  setupProgressMonitoring() {
    this.progressSub = this.progressService.progressUpdates$.pipe(
      throttleTime(2000, undefined, { leading: true, trailing: true })
    ).subscribe(update => {
      if (update) {
        this.loadStudents();
      }
    });
  }

  loadStudents() {
    const params: any = {
      page: this.page,
      size: this.size
    };
    if (this.searchId) params.studentId = this.searchId;
    if (this.selectedClass !== 'All') params.studentClass = this.selectedClass;

    this.studentService.getStudents(params).subscribe((res: any) => {
      this.students = res.students;
      this.totalPages = res.totalPages;
      this.totalElements = res.totalItems;
    });
  }

  onFilterChange() {
    this.page = 0;
    this.loadStudents();
  }



  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadStudents();
  }

  onExport(type: string) {
    let obs;
    let fileName = `students.${type === 'excel' ? 'xlsx' : type}`;

    this.toastr.info(`Preparing ${type.toUpperCase()} export...`, 'Export Started');

    if (type === 'excel') obs = this.studentService.exportExcel(this.searchId, this.selectedClass);
    else if (type === 'csv') obs = this.studentService.exportCsv(this.searchId, this.selectedClass);
    else obs = this.studentService.exportPdf(this.searchId, this.selectedClass);

    obs.subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastr.success(`${type.toUpperCase()} file downloaded.`, 'Export Complete');
      },
      error: (err) => {
        this.toastr.error(`Failed to export ${type.toUpperCase()}.`, 'Export Error');
        console.error('Export error', err);
      }
    });
  }
}
