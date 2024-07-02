import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ITask } from '../interfaces/ITask';

@Injectable({
  providedIn: 'root'
})
export class ToDoListService {
  private apiUrl = 'http://localhost:4000/api/tasks';

  constructor(private http: HttpClient) { }

  getTasks(): Observable<ITask[]> {
    return this.http.get<ITask[]>(this.apiUrl);
  }

  createTask(task: ITask): Observable<ITask> {
    return this.http.post<ITask>(this.apiUrl, task);
  }

  updateTask(id: number|null, task: ITask): Observable<ITask> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<ITask>(url, task);
  }

  deleteTask(id: number): Observable<ITask> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<ITask>(url)
  }
  filterTasks(status: boolean | null, priority: number | null): Observable<any> {
    let params = new HttpParams();

    if (status !== null) {
      params = params.set('isComplete', status.toString());
    }

    if (priority !== null) {
      params = params.set('priority', priority.toString());
    }
    console.log(params)
    return this.http.get<any>(`${this.apiUrl}/filter`, { params });
  }
}