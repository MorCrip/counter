import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExchangeRateResponse {
  data: {
    currency: string;
    rates: { [key: string]: string };
  };
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  private apiUrl = 'https://api.coinbase.com/v2/exchange-rates?currency=';

  constructor(private http: HttpClient) { }

  public getExchangeRates(currency: string): Observable<ExchangeRateResponse> {
    return this.http.get<ExchangeRateResponse>(`${this.apiUrl}${currency}`);
  }
}
