import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ExchangeRateResponse {
  data: {
    currency: string;
    rates: { [key: string]: string };
  };
}

export interface Valute {
  CharCode: string;
  Name: string;
  Value: number;
}

export interface CbrCurrencyData {
  Valute: { [key: string]: Valute };
  Date: string;
}

export interface Currency {
  display: string;
  value: Valute;
}

export class CbrCurrencyResponse {
  private _currencies: Valute[];
  private _responseTime: Date;

  constructor(data: CbrCurrencyData) {
    this._responseTime = new Date(data.Date);
    this._currencies = Object.values(data.Valute);
  }

  public get currencies(): Currency[] {
    return this._currencies.map((valute) => ({
      display: `${valute.CharCode} - ${valute.Name}`,
      value: valute,
    }));
  }

  public get responseTime(): Date {
    return this._responseTime;
  }
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
    return this.http
      .get<CbrCurrencyData>(this.cbrApiUrl)
      .pipe(
        map((response: CbrCurrencyData) => new CbrCurrencyResponse(response))
      );
  }
}
