export class ValueDictionary {
  constructor(
    private readonly id: number,
    private readonly Code: string,
    private readonly Name: string
  ) {}

  get formattedValue(): string {
    return `${this.Code} - ${this.Name}`;
  }
}
