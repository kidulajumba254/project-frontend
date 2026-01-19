import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private studentsApi = 'http://localhost:8081/api/students';
  private dataApi = 'http://localhost:8081/api/data';

  constructor(private http: HttpClient) { }

  generateData(numberOfRecords: number): Observable<any> {
    return this.http.post(`${this.dataApi}/generate?numberOfRecords=${numberOfRecords}`, {});
  }

  processExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.dataApi}/process-excel`, formData);
  }

  uploadCsv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.dataApi}/upload-csv`, formData);
  }

  getStudents(params: any): Observable<any> {
    return this.http.get(this.studentsApi, { params });
  }

  exportExcel(studentId?: string, studentClass?: string): Observable<Blob> {
    let params: any = {};
    if (studentId) params.studentId = studentId;
    if (studentClass && studentClass !== 'All') params.studentClass = studentClass;

    return this.http.get(`${this.studentsApi}/export/excel`, {
      params,
      responseType: 'blob'
    });
  }

  exportCsv(studentId?: string, studentClass?: string): Observable<Blob> {
    let params: any = {};
    if (studentId) params.studentId = studentId;
    if (studentClass && studentClass !== 'All') params.studentClass = studentClass;

    return this.http.get(`${this.studentsApi}/export/csv`, {
      params,
      responseType: 'blob'
    });
  }

  exportPdf(studentId?: string, studentClass?: string): Observable<Blob> {
    let params: any = {};
    if (studentId) params.studentId = studentId;
    if (studentClass && studentClass !== 'All') params.studentClass = studentClass;

    return this.http.get(`${this.studentsApi}/export/pdf`, {
      params,
      responseType: 'blob'
    });
  }
}
