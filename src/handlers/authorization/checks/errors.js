class InvalidClient extends Error {
}

class UnregisteredRedirectUri extends Error {
}

class RedirectError extends Error {
  constructor(type, description) {
    super(description);
    this._type = type;
  }

  get type() {
    return this._type;
  }
}

class InvalidScope extends RedirectError {
  constructor(description) {
    super('invalid_scope', description);
  }
}

class InvalidRequest extends RedirectError {
  constructor(description) {
    super('invalid_request', description);
  }
}

class UnsupportedResponseType extends RedirectError {
  constructor(description) {
    super('unsupported_response_type', description);
  }
}

export {
  InvalidClient, UnregisteredRedirectUri, InvalidScope, InvalidRequest, UnsupportedResponseType,
};
