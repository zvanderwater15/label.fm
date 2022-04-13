import fetch from 'node-fetch';

export async function getTopTracks(username, limit=100) {
    const url = `http://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${username}&limit=${limit}&api_key=${process.env.API_KEY}&format=json`
    const res = await fetch(url)
    const trackJson = await res.json()
    return {tracks: trackJson.toptracks.track}
  }
  
