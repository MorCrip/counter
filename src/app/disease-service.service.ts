import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Disease {
  id: number;
  Code: string;
  Name: string;
}

@Injectable()
export class DiseaseService {
  private readonly apiUrl = 'http://localhost:3000/diseases';
  constructor(private readonly http: HttpClient) {}

  getDiseases(): Observable<Disease[]> {
    const params = new HttpParams()
      .set('_limit', '10');
    return this.http.get<Disease[]>(this.apiUrl, { params });
  }

  searchDiseasesByCode(code: string): Observable<Disease[]> {
    const params = new HttpParams()
      .set('Code', code)
      .set('_limit', '10'); 
    return this.http.get<Disease[]>(this.apiUrl, { params });
  }
}
