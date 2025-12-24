export class ApiException extends Error {
  public status: number;

  constructor(message: string, status: number = 0) {
    super(message);
    this.status = status;
    this.name = 'ApiException';
  }
}

export class UnauthorizedException extends ApiException {
  constructor() {
    super('Unauthorized', 401);
  }
}
