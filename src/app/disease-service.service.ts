import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ValueDictionary } from './shared/model/value-dictionary';

interface Disease {
  id: number;
  Code: string;
  Name: string;
}

@Injectable()
export class DiseaseService {
  private readonly apiUrl = 'http://localhost:3000/diseases';
  
  constructor(private readonly http: HttpClient) {}

  public getDiseases(): Observable<ValueDictionary[]> {
    const params = new HttpParams().set('_limit', '10');
    return this.http.get<Disease[]>(this.apiUrl, { params }).pipe(
      map(data => data.map(item => new ValueDictionary(item.id, item.Code, item.Name))),
      catchError(error => {
        console.error(error);
        return throwError(() => error);
      })
    );
  }

  public searchDiseasesByCode(code: string): Observable<ValueDictionary[]> {
    const params = new HttpParams().set('Code', code).set('_limit', '10');
    return this.http.get<Disease[]>(this.apiUrl, { params }).pipe(
      map(data => data.map(item => new ValueDictionary(item.id, item.Code, item.Name))),
      catchError(error => {
        console.error(error);
        return throwError(() => error);
      })
    );
  }
}
