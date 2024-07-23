import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DiseaseService } from '../disease-service.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, map } from 'rxjs/operators';
import { ValueDictionary } from '../shared/model/value-dictionary';

interface DiagnosisForm {
  diagnosisType: FormControl<string | null>;
  diagnosis: FormControl<string | null>;
  diseaseCharacter: FormControl<string | null>;
  date: FormControl<string | null>;
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
  providers: [DiseaseService]
})
export class DiagnosisFormComponent implements OnInit {
  protected readonly diagnosisForm: FormGroup<DiagnosisForm>;

  protected readonly diagnosisTypes: ValueDictionary[] = [
    new ValueDictionary(1, '1', 'Основной'),
    new ValueDictionary(2, '2', 'Осложнение основного'),
    new ValueDictionary(3, '3', 'Сопутствующий'),
    new ValueDictionary(4, '4', 'Конкурирующий'),
    new ValueDictionary(5, '5', 'Внешняя причина')
  ];

  protected readonly diseaseCharacters: ValueDictionary[] = [
    new ValueDictionary(1, '1', 'Острое'),
    new ValueDictionary(2, '2', 'Впервые в жизни установлено'),
    new ValueDictionary(3, '3', 'Ранее установлено хроническое')
  ];

  protected readonly dispensaryAccounts: ValueDictionary[] = [
    new ValueDictionary(1, '1', 'Состоит'),
    new ValueDictionary(2, '2', 'Взят'),
    new ValueDictionary(3, '3', 'Снят'),
    new ValueDictionary(4, '4', 'Снят по причине выздоровления'),
    new ValueDictionary(6, '6', 'Снят по другим причинам')
  ];

  protected diseases$: Observable<ValueDictionary[]>;
  protected filteredDiagnosisTypes$: Observable<ValueDictionary[]>;
  protected filteredDiseaseCharacters$: Observable<ValueDictionary[]>;
  protected filteredDispensaryAccounts$: Observable<ValueDictionary[]>;

  constructor(private readonly fb: FormBuilder, private readonly diseaseService: DiseaseService) {
    this.diagnosisForm = this.fb.group<DiagnosisForm>({
      diagnosisType: this.fb.control<string | null>(null, Validators.required),
      diagnosis: this.fb.control<string | null>(null, Validators.required),
      diseaseCharacter: this.fb.control<string | null>(null, Validators.required),
      date: this.fb.control<string | null>(null, Validators.required),
      dispensaryAccount: this.fb.control<string | null>(null, Validators.required),
      trauma: this.fb.control<string | null>(null, Validators.required),
      externalCause: this.fb.control<string | null>({ value: null, disabled: true }),
      clinicalDiagnosis: this.fb.control<string | null>(null, Validators.required),
      comment: this.fb.control<string | null>(null, Validators.required)
    });

    this.diseases$ = of([]);
    this.filteredDiagnosisTypes$ = of(this.diagnosisTypes);
    this.filteredDiseaseCharacters$ = of(this.diseaseCharacters);
    this.filteredDispensaryAccounts$ = of(this.dispensaryAccounts);
  }

  public ngOnInit(): void {
    this.diagnosisForm.controls.dispensaryAccount.valueChanges.subscribe(value => {
      const externalCauseControl = this.diagnosisForm.controls.externalCause;
      if (value === '1') {
        externalCauseControl.enable();
        externalCauseControl.setValidators(Validators.required);
      } else {
        externalCauseControl.disable();
        externalCauseControl.clearValidators();
      }
      externalCauseControl.updateValueAndValidity();
    });

    this.diagnosisForm.controls.diagnosis.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value: string | null) => {
        if (value && value.length > 1) {
          return this.diseaseService.searchDiseasesByCode(value);
        } else {
          return this.diseaseService.getDiseases();
        }
      })
    ).subscribe(diseases => {
      this.diseases$ = of(diseases);
    });

    this.filteredDiagnosisTypes$ = this.diagnosisForm.controls.diagnosisType.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.diagnosisTypes))
    );

    this.filteredDiseaseCharacters$ = this.diagnosisForm.controls.diseaseCharacter.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.diseaseCharacters))
    );

    this.filteredDispensaryAccounts$ = this.diagnosisForm.controls.dispensaryAccount.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.dispensaryAccounts))
    );
  }

  private _filter(value: string | null, options: ValueDictionary[]): ValueDictionary[] {
    const filterValue = value ? value.toLowerCase() : '';
    return options.filter(option => option.formattedValue.toLowerCase().includes(filterValue));
  }

  protected onSubmit(): void {
    if (this.diagnosisForm.valid) {
      console.log(this.diagnosisForm.value);
    } else {
      console.log('Ошибка валидации');
    }
  }

  protected get diagnosisType() {
    return this.diagnosisForm.controls.diagnosisType;
  }

  protected get diagnosis() {
    return this.diagnosisForm.controls.diagnosis;
  }

  protected get diseaseCharacter() {
    return this.diagnosisForm.controls.diseaseCharacter;
  }

  protected get date() {
    return this.diagnosisForm.controls.date;
  }

  protected get dispensaryAccount() {
    return this.diagnosisForm.controls.dispensaryAccount;
  }

  protected get trauma() {
    return this.diagnosisForm.controls.trauma;
  }

  protected get externalCause() {
    return this.diagnosisForm.controls.externalCause;
  }

  protected get clinicalDiagnosis() {
    return this.diagnosisForm.controls.clinicalDiagnosis;
  }

  protected get comment() {
    return this.diagnosisForm.controls.comment;
  }
}
