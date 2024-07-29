import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
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

interface Formattable {
  formattedValue: string;
}

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteComponent<T extends Formattable>
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() public options: T[] | ((query: string) => Observable<T[]>) = [];
  @Input() public label: string | null = null;
  @Input() public inputId: string = `autocomplete-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  protected control: FormControl = new FormControl();
  protected isRequired: boolean = false;
  protected filteredOptions$: Observable<T[]> = of([]);

  private _isDisabled: boolean = false;
  private readonly _destroy$ = new Subject<void>();
  private _onChange: (value: string | null) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor(@Optional() @Self() private readonly ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  public ngOnInit(): void {
    this.setFormControl();
    this.isRequired = this.control?.hasValidator(Validators.required) ?? false;

    this.updateFilteredOptions('');

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
    if (this.ngControl) {
      this.control = this.ngControl.control as FormControl;
    } else {
      this.control = new FormControl();
    }
  }

  public writeValue(value: string | null): void {
    if (this.control && this.control.value != value) {
      this.control.setValue(value, { emitEvent: false });
    }
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
    this.control.setValue('', { emitEvent: false });
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
        this.filteredOptions$ = of(this.options as T[]);
      }
      return;
    }

    if (typeof this.options === 'function') {
      this.filteredOptions$ = this.options(query);
    } else {
      this.filteredOptions$ = of(
        (this.options as T[]).filter((option) =>
          option.formattedValue.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  }
}
