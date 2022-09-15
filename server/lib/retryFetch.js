const fetch = require("node-fetch");
const { NotFoundError, RateLimitedError, UnknownAPIError } = require("./errors");
const RETRY_STATUS_CODES = [ 429, 502, 503, 504]

function wait(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function retryFetch(url, delay = 5000, tries = 5, fetchOptions = {}) {
  function onError(res) {
    triesLeft = tries - 1;
    if (!triesLeft || !RETRY_STATUS_CODES.includes(res.status)) {
      // give up trying to fetch
      return res;
    }
    return wait(delay).then(() =>
      retryFetch(url, delay, triesLeft, fetchOptions)
    );
  }

  return fetch(url, fetchOptions)
    .then((res) => {
      if (!res.ok) {
        throw(res);
      }
      return res;
    })
    .catch(onError);
}

module.exports = retryFetch;
