import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DiseaseService } from '../disease-service.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, map } from 'rxjs/operators';

interface ValueDictionary {
  id: number;
  Code: string;
  Name: string;
}

@Component({
  selector: 'app-diagnosis-form',
  templateUrl: './diagnosis-form.component.html',
  styleUrls: ['./diagnosis-form.component.scss'],
  providers: [DiseaseService]
})
export class DiagnosisFormComponent implements OnInit {
  protected readonly diagnosisForm: FormGroup;

  protected readonly diagnosisTypes: ValueDictionary[] = [
    { id: 1, Code: '1', Name: 'Основной' },
    { id: 2, Code: '2', Name: 'Осложнение основного' },
    { id: 3, Code: '3', Name: 'Сопутствующий' },
    { id: 4, Code: '4', Name: 'Конкурирующий' },
    { id: 5, Code: '5', Name: 'Внешняя причина' }
  ];

  protected readonly diseaseCharacters: ValueDictionary[] = [
    { id: 1, Code: '1', Name: 'Острое' },
    { id: 2, Code: '2', Name: 'Впервые в жизни установлено' },
    { id: 3, Code: '3', Name: 'Ранее установлено хроническое' }
  ];

  protected readonly dispensaryAccounts: ValueDictionary[] = [
    { id: 1, Code: '1', Name: 'Состоит' },
    { id: 2, Code: '2', Name: 'Взят' },
    { id: 3, Code: '3', Name: 'Снят' },
    { id: 4, Code: '4', Name: 'Снят по причине выздоровления' },
    { id: 6, Code: '6', Name: 'Снят по другим причинам' }
  ];

  protected diseases$: Observable<ValueDictionary[]>;
  protected filteredDiagnosisTypes$: Observable<ValueDictionary[]>;
  protected filteredDiseaseCharacters$: Observable<ValueDictionary[]>;
  protected filteredDispensaryAccounts$: Observable<ValueDictionary[]>;

  constructor(private readonly fb: FormBuilder, private readonly diseaseService: DiseaseService) {
    this.diagnosisForm = this.fb.group({
      diagnosisType: ['', Validators.required],
      diagnosis: ['', Validators.required],
      diseaseCharacter: ['', Validators.required],
      date: ['', Validators.required],
      dispensaryAccount: ['', Validators.required],
      trauma: ['', Validators.required],
      externalCause: [{ value: '', disabled: true }],
      clinicalDiagnosis: ['', Validators.required],
      comment: ['', Validators.required]
    });

    this.diseases$ = of([]);
    this.filteredDiagnosisTypes$ = of(this.diagnosisTypes);
    this.filteredDiseaseCharacters$ = of(this.diseaseCharacters);
    this.filteredDispensaryAccounts$ = of(this.dispensaryAccounts);
  }

  ngOnInit(): void {
    this.diagnosisForm.get('dispensaryAccount')?.valueChanges.subscribe(value => {
      const externalCauseControl = this.diagnosisForm.get('externalCause');
      if (value === '1') {
        externalCauseControl?.enable();
        externalCauseControl?.setValidators(Validators.required);
      } else {
        externalCauseControl?.disable();
        externalCauseControl?.clearValidators();
      }
      externalCauseControl?.updateValueAndValidity();
    });

    this.diagnosisForm.get('diagnosis')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (value && value.length > 1) {
          return this.diseaseService.searchDiseasesByCode(value);
        } else {
          return this.diseaseService.getDiseases();
        }
      })
    ).subscribe(diseases => {
      this.diseases$ = of(diseases);
    });

    this.filteredDiagnosisTypes$ = this.diagnosisForm.get('diagnosisType')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.diagnosisTypes))
    );

    this.filteredDiseaseCharacters$ = this.diagnosisForm.get('diseaseCharacter')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.diseaseCharacters))
    );

    this.filteredDispensaryAccounts$ = this.diagnosisForm.get('dispensaryAccount')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value, this.dispensaryAccounts))
    );
  }

  private _filter(value: string, options: ValueDictionary[]): ValueDictionary[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.Name.toLowerCase().includes(filterValue));
  }

  protected onSubmit(): void {
    if (this.diagnosisForm.valid) {
      console.log(this.diagnosisForm.value);
    } else {
      console.log('Ошибка валидации');
    }
  }
}
