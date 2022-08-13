import "dotenv/config";
import { closeConnection, connectToCluster, openDb } from "../lib/db/conn.js";
import { deleteUserAlbums, getAllAlbums, getAllUserAlbums, updateAlbumLabels } from "../lib/db/records.js";

async function removeDuplicates() {
  const cluster = await connectToCluster();
  const db = await openDb(cluster);
  const albums = await getAllUserAlbums(db)
  
  let document;
  while ((document = await albums.next())) {
    if (document.albums.albums.length < 100) {
        const deleted = await deleteUserAlbums(db, document.username);
        console.log(document.username, deleted)
    }
  }
  
  await closeConnection(cluster);
}

(async () => {
  const clientResult = await removeDuplicates();
})();
