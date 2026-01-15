import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';

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
              <td>{{ s.className }}</td>
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

  constructor(private studentService: StudentService) { }

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    const params: any = {
      page: this.page,
      size: this.size
    };
    if (this.searchId) params.search = this.searchId;
    if (this.selectedClass !== 'All') params.className = this.selectedClass;

    this.studentService.getStudents(params).subscribe((res: any) => {
      this.students = res.content;
      this.totalPages = res.totalPages;
      this.totalElements = res.totalElements;
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

    if (type === 'excel') obs = this.studentService.exportExcel();
    else if (type === 'csv') obs = this.studentService.exportCsv();
    else obs = this.studentService.exportPdf();

    obs.subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
