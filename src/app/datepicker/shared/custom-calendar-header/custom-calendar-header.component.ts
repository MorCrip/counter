import { Component } from '@angular/core';
import { DatepickerCommunicationService } from '../service/datepicker-communication.service';

@Component({
  selector: 'app-custom-calendar-header',
  templateUrl: './custom-calendar-header.component.html',
  styleUrls: ['custom-calendar-header.component.scss'],
})
export class CustomCalendarHeaderComponent {
  constructor(
    private datepickerCommunicationService: DatepickerCommunicationService,
  ) {}

  protected selectToday() {
    this.datepickerCommunicationService.triggerSelectToday();
  }
}
