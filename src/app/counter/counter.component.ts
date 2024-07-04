import { Component } from '@angular/core';
import { FormControl } from '@angular/forms'; // Импортируем FormControl

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
})
export class CounterComponent {
  public valueControl: FormControl = new FormControl(0);

  constructor() {
    this.valueControl.valueChanges.subscribe((newValue) => {
      console.log(newValue);
    });
  }

  public increase() {
    const currentValue = this.valueControl.value;
    this.valueControl.setValue(currentValue + 1);
  }

  public decrease() {
    const currentValue = this.valueControl.value;
    this.valueControl.setValue(currentValue - 1);
  }
}
