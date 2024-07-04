import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
})
export class CounterComponent {
  public valueControl: FormControl = new FormControl(0);
  private valueSubscription: Subscription = new Subscription();

  ngOnInit() {
    this.valueSubscription = this.valueControl.valueChanges.subscribe((newValue: number) => {
      console.log(newValue);
    });
  }

  ngOnDestroy() {
    this.valueSubscription.unsubscribe()
  }

  public increase() {
    this.valueControl.setValue(this.valueControl.value + 1);
  }

  public decrease() {
    this.valueControl.setValue(this.valueControl.value - 1);
  }
}
