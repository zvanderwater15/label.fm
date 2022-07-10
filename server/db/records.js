
export async function insertAlbum(db, mbid, artist, title, labels) {
  const album = await db.collection("albums").insertOne({
    mbid,
    artist,
    title,
    labels,
  });
  return album;
}

export async function getAlbum(db, mbid) {
  const album = await db.collection("albums").findOne({ mbid: mbid });
  return album;
}
