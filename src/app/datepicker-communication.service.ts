import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class DatepickerCommunicationService {
  private readonly selectTodaySource = new Subject<void>();
  public selectToday$ = this.selectTodaySource.asObservable();

  public triggerSelectToday() {
    this.selectTodaySource.next();
  }
}
