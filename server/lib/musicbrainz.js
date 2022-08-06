import fetch from 'node-fetch';

export async function getLabels(mbid) {
  const release = await getRelease(mbid)
  if (!release['label-info']) return []
  const labels = release['label-info'].filter(labelInfo => labelInfo['label']).map(labelInfo => labelInfo['label']['name'])
  return labels
}

export async function getRelease(mbid) {
  const backoff = 1000;
  let retry = false;
  let res;
  while (!res || retry) {
    const url = `https://musicbrainz.org/ws/2/release/${mbid}?inc=labels`
    res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })
    if (res.status === 503) {
      console.log("musicbrainz 503, waiting for " + backoff + "ms then retrying")
      retry = true;
      await Promise(() => setTimeout(backoff))
      backoff *= 2;
    }  else {
      retry = false;
    }
  }
  const releaseRes = await res.json();
  console.log("release response", releaseRes);
  return releaseRes
}
