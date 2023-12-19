import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { FileUploadResponse } from './FileUploadResponse';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  private http: HttpClient = inject(HttpClient);
  private _refresh$ = new Subject<void>();
  private apiBase: string = 'http://localhost:8080/api/v1'
  get refresh$() {
    return this._refresh$;
  }

  public testConnectionBackend = (): Observable<string> => this.http.get(`${this.apiBase}/greetings`, { responseType: 'text' });
  
  public uploadFileToDb = (body: any): Observable<FileUploadResponse> => this.http.post<FileUploadResponse>(`${this.apiBase}/upload/db`, body).pipe(
    tap(() => {
      this._refresh$.next();
    })
  );

  public getAllFiles = (): Observable<FileUploadResponse[]> => this.http.get<FileUploadResponse[]>(`${this.apiBase}/files`);
}
