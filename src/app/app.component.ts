import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  protected readonly title = 'Таблица курс к валюте';

  public handleFilterChange(): void {
    alert('Фильтр изменился');
  }
}
