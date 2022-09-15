const { NotFoundError, RateLimitedError, UnknownAPIError } = require("./errors.js");
const retryFetch = require("./retryFetch.js");

RETRY_ERROR_CODES = [
  11, //  this service is temporarily offline
  16, // there was a temporary error processing your request
  29 // rate limit exceeded
]

async function getTopAlbums(username, limit = 100, tries=1) {
  const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&limit=${limit}&api_key=${process.env.API_KEY}&format=json`;
  const res = await retryFetch(url, undefined, tries=tries);
  const albumJson = await res.json();

  if (res.status === 404) {
    throw new NotFoundError("Last.fm", "User not found")
  }
  else if (res.status === 429) {
    throw new RateLimitedError("Last.fm")
  }
  else if (!res.ok || !albumJson.topalbums) {
    throw new UnknownAPIError("Last.fm")
  }

  return { albums: albumJson.topalbums.album };
}

async function getFriends(username, limit = 200, tries=1) {
  const url = `http://ws.audioscrobbler.com/2.0/?method=user.getfriends&user=${username}&limit=${limit}&api_key=${process.env.API_KEY}&format=json`;
  const res = await retryFetch(url, tries=tries);
  const userJson = await res.json();

  if (res.status === 404 || (res.status === 400 && userJson.error == 6)) {
    throw new NotFoundError("Last.fm", "User not found")
  }
  else if (res.status === 429) {
    throw new RateLimitedError("Last.fm")
  }
  else if (!res.ok || !userJson.friends) {
    console.error("Unknown API Error " + res.status + " res: " + JSON.stringify(userJson))
    throw new UnknownAPIError("Last.fm")
  }
  if (userJson.friends) {
    return { users: userJson.friends.user.map(user => user.name) };
  } else {
    return { users: [] };
  }
}

module.exports = { getTopAlbums, getFriends };
