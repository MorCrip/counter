import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { map, takeUntil, switchMap, startWith } from 'rxjs/operators';
import {
  Currency,
  CurrencyService,
  ExchangeRateResponse,
  CbrCurrencyResponse,
} from '../currency.service';

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
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @Input() title: string | null = null;
  @Output() handleFilterChange: EventEmitter<void> = new EventEmitter<void>();

  protected readonly dataSource = new MatTableDataSource<CurrencyData>();
  protected readonly displayedColumns: readonly string[] = [
    'currency',
    'rate',
    'requestTime',
  ];
  private readonly destroy$ = new Subject<void>();

  protected readonly currencyControl = new FormControl();
  protected filteredCurrencies!: Observable<Currency[]>;
  protected currencies: Currency[] = [];
  protected responseTime$!: Observable<Date>;
  protected selectedCurrencyName: string | null = null;

  constructor(
    private readonly currencyService: CurrencyService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchCurrencies();
    this.setupCurrencySelection();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchCurrencies(): void {
    this.currencyService
      .getCbrCurrencies()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: CbrCurrencyResponse) => {
        this.currencies = response.currencies;
        this.responseTime$ = of(response.responseTime);
        this.filteredCurrencies = this.currencyControl.valueChanges.pipe(
          startWith(''),
          map((value: string) => {
            if (value !== '') {
              this.handleFilterChange.emit();
            }
            return this.filterCurrencies(value);
          })
        );
      });
  }

  private setupCurrencySelection(): void {
    this.currencyControl.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        switchMap((currencyDisplay: string) => {
          const selectedCurrency = this.currencies.find(
            (currency) => currency.display === currencyDisplay
          );
          if (selectedCurrency) {
            this.selectedCurrencyName = selectedCurrency.value.Name;
            return this.currencyService
              .getExchangeRates(selectedCurrency.value.CharCode)
              .pipe(
                map((response) => ({
                  response,
                  requestTime: new Date(),
                }))
              );
          } else {
            return of(null);
          }
        })
      )
      .subscribe((result) => {
        if (result) {
          this.dataSource.data = Object.entries(result.response.data.rates).map(
            ([currency, rate]) =>
              ({
                currency,
                rate: +rate,
              } as CurrencyData)
          );

          this.responseTime$ = of(result.requestTime);

          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          this.cdr.markForCheck();
        }
      });
  }

  private filterCurrencies(value: string): Currency[] {
    const filterValue = value.toLowerCase();
    return this.currencies.filter((currency) =>
      currency.display.toLowerCase().includes(filterValue)
    );
  }
}
