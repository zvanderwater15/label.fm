import retryFetch from "./retryFetch.js";

export async function getTopAlbums(username, limit = 100) {
  const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&limit=${limit}&api_key=${process.env.API_KEY}&format=json`;
  const res = await retryFetch(url);
  const albumJson = await res.json();
  if (albumJson.topalbums) {
    return { albums: albumJson.topalbums.album };
  } else {
    throw new Error("User not found");
  }
}

export async function getFriends(username, limit = 500) {
  const url = `http://ws.audioscrobbler.com/2.0/?method=user.getfriends&user=${username}&limit=${limit}&api_key=${process.env.API_KEY}&format=json`;
  const res = await retryFetch(url);
  const userJson = await res.json();
  if (userJson.friends) {
    return { users: userJson.friends.user };
  } else {
    return { users: [] };
  }
}
