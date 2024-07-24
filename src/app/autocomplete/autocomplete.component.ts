import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormControlName,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
  NgControl,
  Validators,
} from '@angular/forms';
import {
  distinctUntilChanged,
  Observable,
  of,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { ValueDictionary } from '../shared/model/value-dictionary';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
  ],
})
export class AutocompleteComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() public options:
    | ValueDictionary[]
    | ((query: string) => Observable<ValueDictionary[]>) = [];
  @Input() public label: string | null = null;
  @Input() public inputId: string = `autocomplete-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  protected control: FormControl = new FormControl();
  protected isRequired: boolean = false;
  protected filteredOptions$: Observable<ValueDictionary[]> = of([]);

  private _isDisabled: boolean = false;
  private readonly _destroy$ = new Subject<void>();
  private _onChange: (value: string | null) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor(@Inject(Injector) private readonly _injector: Injector) {}

  public ngOnInit(): void {
    this.setFormControl();
    this.isRequired = this.control?.hasValidator(Validators.required) ?? false;

    this.control.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap((value) => {
          this._onChange(value);
          this._onTouched();
          this.updateFilteredOptions(value);
        }),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private setFormControl(): void {
    try {
      const formControl = this._injector.get(NgControl);

      if (formControl instanceof FormControlName) {
        this.control = this._injector
          .get(FormGroupDirective)
          .getControl(formControl as FormControlName);
      } else if (formControl instanceof FormControl) {
        this.control = formControl as FormControl;
      }
    } catch (err) {
      this.control = new FormControl();
    }
  }

  public writeValue(value: string | null): void {
    this.control.setValue(value ?? '', {emitEvent: false});
  }

  public registerOnChange(fn: (value: string | null) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  protected clear(): void {
    this.control.setValue('', {emitEvent: false});
  }

  protected openAutocomplete(): void {
    const inputElement = document.getElementById(
      this.inputId
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
      inputElement.dispatchEvent(new Event('input'));
    }
  }

  protected updateFilteredOptions(query: string | null): void {
    if (query === null || query.trim() === '') {
      if (typeof this.options === 'function') {
        this.filteredOptions$ = this.options('');
      } else {
        this.filteredOptions$ = of(this.options as ValueDictionary[]);
      }
      return;
    }

    if (typeof this.options === 'function') {
      this.filteredOptions$ = this.options(query);
    } else {
      this.filteredOptions$ = of(
        (this.options as ValueDictionary[]).filter((option) =>
          option.formattedValue.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  }
}
