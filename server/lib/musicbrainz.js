import retryFetch from './retryFetch.js';

export async function getLabels(mbid) {
  const release = await getRelease(mbid)
  if (!release['label-info']) return []
  // get label names and remove duplicates
  const labels = [...new Set(release['label-info'].filter(labelInfo => labelInfo['label']).map(labelInfo => labelInfo['label']['name']))]
  return labels
}

export async function getRelease(mbid) {
  const res = await retryFetch(`https://musicbrainz.org/ws/2/release/${mbid}?inc=labels`, {
    headers: {
      'Accept': 'application/json'
    }
  })
  const releaseRes = await res.json();
  return releaseRes  
}
