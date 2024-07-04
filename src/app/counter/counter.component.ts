import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
})
export class CounterComponent implements OnInit, OnDestroy {
  public valueControl: FormControl = new FormControl(0);
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.valueControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((newValue: number) => {
        console.log(newValue);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public increase() {
    this.valueControl.setValue(this.valueControl.value + 1);
  }

  public decrease() {
    this.valueControl.setValue(this.valueControl.value - 1);
  }
}
