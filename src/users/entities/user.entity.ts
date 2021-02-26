export class User {
  constructor(
    public readonly nin: string,
    public name?: string,
    public email?: string,
    public age?: string,
    public rg?: string,
  ) {}

  fromJson(json: Record<string, any>) {
    if (!json || !json.nin) throw Error(`NIN is required to User`);

    const { nin, name, email, age, rg } = json;
    return new User(nin, name, email, age, rg);
  }
}
