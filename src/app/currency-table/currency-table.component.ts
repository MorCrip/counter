import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { startWith, map, takeUntil } from 'rxjs/operators';
import {
  CurrencyService,
  ExchangeRateResponse,
  CbrCurrencyResponse,
} from '../currency.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

interface CurrencyData {
  currency: string;
  rate: number;
}

@Component({
  selector: 'app-currency-table',
  templateUrl: './currency-table.component.html',
  styleUrls: ['./currency-table.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyService],
})
export class CurrencyTableComponent implements OnInit, OnDestroy {
  protected readonly dataSource = new MatTableDataSource<CurrencyData>();
  protected readonly displayedColumns: readonly string[] = ['currency', 'rate'];
  private readonly destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  protected readonly currencyControl = new FormControl();
  protected filteredCurrencies!: Observable<
    { CharCode: string; Name: string }[]
  >;
  protected currencies: { CharCode: string; Name: string }[] = [];
  protected selectedCurrencyName: string | null = null;

  constructor(private readonly currencyService: CurrencyService) {}

  ngOnInit() {
    this.fetchCurrencies();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchCurrencyData(charCode: string) {
    this.currencyService
      .getExchangeRates(charCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: ExchangeRateResponse) => {
        this.dataSource.data = Object.entries(response.data.rates).map(
          ([currency, rate]) => ({ currency, rate: +rate } as CurrencyData)
        );
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        });
      });
  }

  private fetchCurrencies() {
    this.currencyService
      .getCbrCurrencies()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: CbrCurrencyResponse) => {
        this.currencies = Object.values(response.Valute);
        this.filteredCurrencies = this.currencyControl.valueChanges.pipe(
          startWith(''),
          map((value) => this.filterCurrencies(value))
        );
      });
  }

  private filterCurrencies(
    value: string
  ): { CharCode: string; Name: string }[] {
    const filterValue = value.toLowerCase();
    return this.currencies.filter((currency) =>
      currency.Name.toLowerCase().includes(filterValue)
    );
  }

  protected onCurrencySelected(event: MatAutocompleteSelectedEvent) {
    const selectedCurrency = this.currencies.find(
      (currency) => currency.Name === event.option.value
    );
    if (selectedCurrency) {
      this.selectedCurrencyName = selectedCurrency.Name;
      this.fetchCurrencyData(selectedCurrency.CharCode);
    }
  }
}
