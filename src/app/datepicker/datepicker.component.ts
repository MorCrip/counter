import {
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
import { distinctUntilChanged, Subject, takeUntil, tap } from 'rxjs';
import { DatepickerCommunicationService } from '../datepicker-communication.service';
import { CustomCalendarHeaderComponent } from '../custom-calendar-header/custom-calendar-header.component';


@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
})
export class DatepickerComponent
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @Input() public label: string | null = null;
  @Input() public minDate: Date | null = null;
  @Input() public maxDate: Date | null = null;

  protected readonly customCalendarHeader = CustomCalendarHeaderComponent;

  protected control: FormControl = new FormControl();
  private _isDisabled: boolean = false;
  private readonly _destroy$ = new Subject<void>();
  private _onChange: (value: Date | null) => void = () => {};
  private _onTouched: () => void = () => {};

  constructor(
    @Optional() @Self() private readonly ngControl: NgControl,
    private datepickerCommunicationService: DatepickerCommunicationService
  ) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  public ngOnInit(): void {
    this.setFormControl();

    this.datepickerCommunicationService.selectToday$.subscribe(() => {
      this.selectToday();
    });

    this.control.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap((value) => {
          this._onChange(value);
          this._onTouched();
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

  public writeValue(value: Date | null): void {
    if (this.control && this.control.value !== value) {
      this.control.setValue(value, { emitEvent: false });
    }
  }

  public registerOnChange(fn: (value: Date | null) => void): void {
    this._onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this._isDisabled = isDisabled;
    isDisabled ? this.control.disable() : this.control.enable();
  }

  private selectToday(): void {
    const today = new Date();
    this.control.setValue(today, { emitEvent: false });
  }
}
