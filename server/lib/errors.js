class ExternalAPIError extends Error {
    constructor(api, message, status) {
        super(message)
        this.api = api
        this.status = status
    }
}

class NotFoundError extends ExternalAPIError {
    constructor(api, message) {
        super(api, message, 404)
    }
}

class RateLimitedError extends ExternalAPIError {
    constructor(api) {
        super(api, "Too many requests - try again later", 429)
    }
}

class UnknownAPIError extends ExternalAPIError {
    constructor(api) {
        super(api, "Unknown Error", 500)
    }
}

module.exports = {
    ExternalAPIError,
    NotFoundError,
    RateLimitedError,
    UnknownAPIError
}