import fetch from 'node-fetch';

// copied from - https://cheatcode.co/tutorials/how-to-add-automatic-retry-support-to-fetch-in-node-js

let attempts = 0;

const wait = (time = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time * 1000);
  });
};

export const retryFetch = async (url = '', options = {}) => {
  const { retry = true, retryDelay = 5, retries = 5, ...requestOptions } = options;

  attempts += 1;

  return fetch(url, requestOptions).then((response) => response).catch(async (error) => {
    if (retry && attempts <= retries) {
      console.warn({
        message: `Request failed, retrying in ${retryDelay} seconds...`,
        error: error?.message,
      });

      await wait(retryDelay);

      return retryFetch(url, options, retry, retryDelay);
    } else {
      throw new Error(error);
    }
  });
};

export default retryFetch;
