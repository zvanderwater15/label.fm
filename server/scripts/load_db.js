require("dotenv/config");
const { closeConnection, connectToCluster, openDb } = require("../lib/db/conn.js");
const { getAlbum, getUserAlbums, getUserFriends, insertUserAlbums, insertUserFriends} = require("../lib/db/records.js");
const { getFriends, getTopAlbums } = require("../lib/lastfm.js");
const { sendMessage } = require("../lib/queues.js");
const { v4 : uuidv4 } = require('uuid');
const { createJob } = require("../lib/jobs.js");
const { NotFoundError } = require("../lib/errors.js");

async function lastfmUsers(db, startingUser, limit = 500) {
  const visitedUsers = [];
  const visitedMBIDs = [];
  const users = [startingUser];
  console.log("starting limit", limit)
  while (users.length > 0 && visitedMBIDs.length <= limit) {
    const user = users.shift();
    console.log("processing user " + user);

    let friends = await getUserFriends(db, user);
    if (!friends) {
      await new Promise(r => setTimeout(r, 1100)); //last.fm api limits calls to one per second
      try {
        friends = await getFriends(user);
      } catch (err) {
        if (err instanceof NotFoundError) {
          console.log("user not found " + user)
          continue
        }
        else {
          throw(err)
        }
      }
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
      const jobUrl = `/api/labels/${user}`
      const jobId = await createJob(db, jobUrl);
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
  const args = process.argv.slice(2);
  let startingUser = "ZoiAran"
  if (args.length) {
    startingUser = args[0];
  }
  const strategy = lastfmUsers;
  await populateDB(strategy, startingUser);  
})();
