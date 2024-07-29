import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { DiseaseService } from '../disease-service.service';
import { Observable, of, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  takeUntil,
} from 'rxjs/operators';
import { ValueDictionary } from '../shared/model/value-dictionary';

interface DiagnosisForm {
  diagnosisType: FormControl<string | null>;
  diagnosis: FormControl<string | null>;
  diseaseCharacter: FormControl<string | null>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  dispensaryAccount: FormControl<string | null>;
  trauma: FormControl<string | null>;
  externalCause: FormControl<string | null>;
  clinicalDiagnosis: FormControl<string | null>;
  comment: FormControl<string | null>;
}

@Component({
  selector: 'app-diagnosis-form',
  templateUrl: './diagnosis-form.component.html',
  styleUrls: ['./diagnosis-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DiseaseService],
})
export class DiagnosisFormComponent implements OnInit, OnDestroy {
  protected readonly diagnosisForm: FormGroup<DiagnosisForm>;

  protected readonly diagnosisTypes: ValueDictionary[] = [
    new ValueDictionary(1, '1', 'Основной'),
    new ValueDictionary(2, '2', 'Осложнение основного'),
    new ValueDictionary(3, '3', 'Сопутствующий'),
    new ValueDictionary(4, '4', 'Конкурирующий'),
    new ValueDictionary(5, '5', 'Внешняя причина'),
  ];

  protected readonly diseaseCharacters: ValueDictionary[] = [
    new ValueDictionary(1, '1', 'Острое'),
    new ValueDictionary(2, '2', 'Впервые в жизни установлено'),
    new ValueDictionary(3, '3', 'Ранее установлено хроническое'),
  ];

  protected readonly dispensaryAccounts: ValueDictionary[] = [
    new ValueDictionary(1, '1', 'Состоит'),
    new ValueDictionary(2, '2', 'Взят'),
    new ValueDictionary(3, '3', 'Снят'),
    new ValueDictionary(4, '4', 'Снят по причине выздоровления'),
    new ValueDictionary(6, '6', 'Снят по другим причинам'),
  ];

  protected diseases$: Observable<ValueDictionary[]> = of([]);

  private readonly _destroy$ = new Subject<void>();

  protected readonly minDate: Date = new Date(2000, 0, 1);
  protected readonly maxDate: Date = new Date();

  constructor(
    private readonly fb: FormBuilder,
    private readonly diseaseService: DiseaseService
  ) {
    this.diagnosisForm = this.fb.group<DiagnosisForm>(
      {
        diagnosisType: this.fb.control<string | null>(
          null,
          Validators.required
        ),
        diagnosis: this.fb.control<string | null>(null, Validators.required),
        diseaseCharacter: this.fb.control<string | null>(
          null,
          Validators.required
        ),
        startDate: this.fb.control<Date | null>(null, Validators.required),
        endDate: this.fb.control<Date | null>(null, Validators.required),
        dispensaryAccount: this.fb.control<string | null>(
          null,
          Validators.required
        ),
        trauma: this.fb.control<string | null>(null, Validators.required),
        externalCause: this.fb.control<string | null>({
          value: null,
          disabled: true,
        }),
        clinicalDiagnosis: this.fb.control<string | null>(
          null,
          Validators.required
        ),
        comment: this.fb.control<string | null>(null, Validators.required),
      },
      {
        validators: this.dateRangeValidator,
      }
    );
  }

  public ngOnInit(): void {
    this.diagnosisForm.controls.dispensaryAccount.valueChanges.pipe(
      takeUntil(this._destroy$)
    ).subscribe(
      (value) => {
        const externalCauseControl = this.diagnosisForm.controls.externalCause;
        if (value === '1 - Состоит') {
          externalCauseControl.enable();
          externalCauseControl.setValidators(Validators.required);
        } else {
          externalCauseControl.disable();
          externalCauseControl.clearValidators();
        }
        externalCauseControl.updateValueAndValidity();
      }
    );

    this.diagnosisForm.controls.diagnosis.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value: string | null) => this.searchDiseases(value)),
        catchError(() => of([])),
        takeUntil(this._destroy$)
      )
      .subscribe((diseases) => {
        this.diseases$ = of(diseases);
      });
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  protected searchDiseases(
    query: string | null
  ): Observable<ValueDictionary[]> {
    if (query && query.length > 1) {
      return this.diseaseService
        .searchDiseasesByCode(query)
        .pipe(catchError(() => of([])));
    } else {
      return this.diseaseService.getDiseases().pipe(catchError(() => of([])));
    }
  }

  protected onSubmit(): void {
    if (this.diagnosisForm.valid) {
      console.log(this.diagnosisForm.value);
    } else {
      console.log('Ошибка валидации');
    }
  }

  private dateRangeValidator: ValidatorFn = (
    control: AbstractControl
  ): { [key: string]: any } | null => {
    const group = control as FormGroup;
    const startDateControl = group.get('startDate');
    const endDateControl = group.get('endDate');
    const startDate = startDateControl?.value;
    const endDate = endDateControl?.value;

    if (startDate && endDate && startDate > endDate) {
      startDateControl?.setErrors({
        dateRange: 'Дата с не может быть больше даты по',
      });
      endDateControl?.setErrors({
        dateRange: 'Дата по не может быть меньше даты с',
      });
      return { dateRange: 'Дата с не может быть больше даты по' };
    }
    return null;
  };
}
