import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import SockJS from 'sockjs-client';

export interface ProgressUpdate {
  taskId: string;
  currentRecords: number;
  totalRecords: number;
  timeTakenSeconds?: number;
  timeTakenMs?: number;
  timeTaken?: number;
  percentage?: number;
  progress?: number;
  completed: boolean;
  status: string;
  filePath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private stompClient: Client | null = null;
  private progressUpdates = new BehaviorSubject<ProgressUpdate | null>(null);
  progressUpdates$ = this.progressUpdates.asObservable();

  private isProcessingSubject = new BehaviorSubject<boolean>(false);
  isProcessing$ = this.isProcessingSubject.asObservable();

  constructor() { }

  watchProgress(taskId: string): Observable<ProgressUpdate | null> {
    this.isProcessingSubject.next(true);

    if (this.stompClient) {
      this.stompClient.deactivate();
    }

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
      onConnect: () => {
        this.stompClient?.subscribe(`/topic/progress/${taskId}`, (message: any) => {
          const update = JSON.parse(message.body) as ProgressUpdate;
          this.progressUpdates.next(update);

          if (update.completed) {
            this.isProcessingSubject.next(false);
          }
        });
      },
      onStompError: (frame: any) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        this.isProcessingSubject.next(false);
      }
    });

    this.stompClient.activate();
    return this.progressUpdates.asObservable();
  }
}
