import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CurrencyService, ExchangeRateResponse } from '../currency.service';

interface CurrencyData {
  currency: string;
  rate: number;
}

@Component({
  selector: 'app-currency-table',
  templateUrl: './currency-table.component.html',
  styleUrls: ['./currency-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyService],
})
export class CurrencyTableComponent implements OnInit, OnDestroy {
  protected readonly dataSource = new MatTableDataSource<CurrencyData>();
  protected readonly displayedColumns: readonly string[] = ['currency', 'rate'];
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private readonly currencyService: CurrencyService) {}

  ngOnInit() {
    this.fetchCurrencyData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchCurrencyData() {
    this.currencyService
      .getExchangeRates('USD')
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: ExchangeRateResponse) => {
          this.dataSource.data = Object.entries(response.data.rates).map(
            ([currency, rate]) => ({ currency, rate: +rate } as CurrencyData)
          );
          this.dataSource.paginator = this.paginator;
        },
      );
  }
}
