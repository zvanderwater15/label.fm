import fetch from 'node-fetch';

export async function getLabels(mbid) {
  const release = await getRelease(mbid)
  console.log("release info", release)
  if (!release['label-info']) return []
  const labels = release['label-info'].filter(labelInfo => labelInfo['label']).map(labelInfo => labelInfo['label']['name'])
  return labels
}

export async function getRelease(mbid) {
  const url = `https://musicbrainz.org/ws/2/release/${mbid}?inc=labels`
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  })
  const releaseRes = await res.json()
  return releaseRes
}
