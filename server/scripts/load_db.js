import "dotenv/config";
import { closeConnection, connectToCluster, openDb } from "../lib/db/conn.js";
import { getAlbum, getUserAlbums, getUserFriends, insertUserAlbums, insertUserFriends, startJob } from "../lib/db/records.js";
import { getFriends, getTopAlbums } from "../lib/lastfm.js";
import { sendMessage } from "../lib/queues.js";
import { v4 as uuidv4 } from 'uuid';

async function lastfmUsers(db, startingUser, limit = 10) {
  const visitedUsers = [];
  const visitedMBIDs = [];
  const users = [startingUser];
  console.log("starting limit", limit)
  while (users.length > 0 && visitedMBIDs.length <= limit) {
    const user = users.pop();
    console.log("processing user " + user);

    let friends = await getUserFriends(db, user);
    if (!friends) {
      await new Promise(r => setTimeout(r, 1100)); //last.fm api limits calls to one per second
      friends = await getFriends(user);
      await insertUserFriends(db, user, friends)  
    }

    console.log(user + " has " + friends.users.length + " friends");
    friends.users.forEach((friend) => {
      if (!visitedUsers.includes(friend.name)) {
        visitedUsers.push(friend.name);
        users.push(friend.name);  
      }
    });

    let userTopAlbums = await getUserAlbums(db, user);
    if (!userTopAlbums) {
      await new Promise(r => setTimeout(r, 1100)); //last.fm api limits calls to one per second
      userTopAlbums = await getTopAlbums(user);
      await insertUserAlbums(db, user, userTopAlbums)  
    }


    const missingAlbums = []
    console.log(user.name + "")
    for (let album of userTopAlbums.albums) {
      console.log("checking album: " +  album.name)
      const dbAlbum = await getAlbum(db, album.mbid);
      if (!visitedMBIDs.includes(album.mbid) && !dbAlbum) {
        visitedMBIDs.push(album.mbid)
        missingAlbums.push({"mbid": album.mbid, "title": album.name, "artist": album.artist.name}) 
        console.log("adding album: " + album.name)
      }
    }

    // send albums to worker queue
    if (missingAlbums.length > 0) {
      const jobId = uuidv4();
      const jobUrl = `/api/labels/${user}`
      await startJob(db, jobId, jobUrl);
      const message = JSON.stringify({"jobID": jobId, "albums": missingAlbums})
      await sendMessage(message)    
    }
  }

}

// Connect with a client.
async function populateDB(strategy) {
  const cluster = await connectToCluster();
  const db = await openDb(cluster);
  await strategy(db, arguments[1])
  await closeConnection(cluster);
}

// Use a self-calling function so we can use async / await.
(async () => {
  const startingUser = "ZoiAran";
  const strategy = lastfmUsers;
  const clientResult = await populateDB(strategy, startingUser);
})();
