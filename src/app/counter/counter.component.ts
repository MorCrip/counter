import { Component } from '@angular/core';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent {
  public value: number = 0;

  public increase() {
    this.value = this.value + 1;
  }

  public decrease() {
    this.value = this.value - 1;
  }
}
