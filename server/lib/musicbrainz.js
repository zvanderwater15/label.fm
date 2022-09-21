const retryFetch = require('./retryFetch.js');
const { NotFoundError, RateLimitedError, UnknownAPIError } = require("./errors.js");

async function getLabels(mbid) {
  const release = await getRelease(mbid)
  if (!release['label-info']) return []
  // get label names and remove duplicates
  const labels = [...new Set(release['label-info'].filter(labelInfo => labelInfo['label']).map(labelInfo => labelInfo['label']['name']))]
  return {"title": release.title, "artist": release["artist-credit"][0].name, labels}
}

async function getRelease(mbid) {
  const res = await retryFetch(`https://musicbrainz.org/ws/2/release/${mbid}?inc=labels+artists`, delay=undefined, retry=undefined, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Label.fm/0.9 ( zoe.van42@gmail.com )'
    }
  })

  if (res.status === 400  || res.status === 404) {
    throw new NotFoundError("Musicbrainz", `Invalid mbid - ${mbid}`)
  }
  else if (res.status === 503 || res.status === 429) {
    throw new RateLimitedError("Musicbrainz", "Musicbrainz is busy", res.status)
  }
  else if (!res.ok) {
    throw new UnknownAPIError("Musicbrainz", res.body, res.status)
  }

  const release = await res.json();
  return release 
}

module.exports = { getLabels, getRelease } 