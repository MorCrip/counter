import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ExchangeRateResponse {
  data: {
    currency: string;
    rates: { [key: string]: string };
  };
}

export interface CbrCurrencyResponse {
  Valute: {
    [key: string]: {
      CharCode: string;
      Name: string;
      Value: number;
    };
  };
}

@Injectable()
export class CurrencyService {
  private readonly coinbaseApiUrl =
    'https://api.coinbase.com/v2/exchange-rates?currency=';
  private readonly cbrApiUrl = 'https://www.cbr-xml-daily.ru/daily_json.js';

  constructor(private readonly http: HttpClient) {}

  public getExchangeRates(currency: string): Observable<ExchangeRateResponse> {
    return this.http.get<ExchangeRateResponse>(
      `${this.coinbaseApiUrl}${currency}`
    );
  }

  public getCbrCurrencies(): Observable<CbrCurrencyResponse> {
    return this.http.get<CbrCurrencyResponse>(this.cbrApiUrl);
  }
}
