require("dotenv/config");
const { closeConnection, connectToCluster, openDb } = require("../lib/db/conn.js");
const { getAlbum, getUserAlbums, getUserFriends, insertUserAlbums, insertUserFriends} = require("../lib/db/records.js");
const { getFriends, getTopAlbums } = require("../lib/lastfm.js");
const { sendMessage } = require("../lib/queues.js");
const { createJob } = require("../lib/jobs.js");
const { NotFoundError } = require("../lib/errors.js");
const fs = require("fs")

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

async function importFromSitemap(db, sitemap) {
  mbids = []
  // read xml
  let data;
  try {
    data = fs.readFileSync(sitemap, 'utf8')
  } catch (err) {
    console.error("Invalid file")
    throw(err)
  }

  // match mbid, example mbid - "260b6184-8828-48eb-945c-bc4cb6fc34ca"
  const regex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g
  const matches = data.matchAll(regex)

  for (let match of matches) {
    mbids.push(match[0])
  }
  // split into groups of 50
  // send albums to worker queue
  for(let i=0; i <= mbids.length - 50; i+=50){
    const batch = mbids.slice(i, i+50)
    const jobUrl = sitemap
    const jobId = await createJob(db, jobUrl);
    const message = JSON.stringify({"jobID": jobId, "albums": batch})
    await sendMessage(message)    
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
// args - username, loading strategy (users, sitemap), then file name if using sitemap
(async () => {
  const args = process.argv.slice(2);

  if (!args.length) {
    throw new Error("Missing strategy parameter")
  }

  const strategyChoice = args[0];
  console.log(strategyChoice)
  if (strategyChoice === "users") {
    let startingUser = "ZoiAran";
    if (args.length > 1) {
      startingUser = args[1];
    }
    await populateDB(lastfmUsers, startingUser);  

  }
  else if (strategyChoice === "sitemap") {
    let file = "sitemap.xml"
    if (args.length > 1) {
      file = args[1];
    }
    if (!fs.existsSync(file)) {
      throw Error(`File does not exist: ${file}`)
    }
    await populateDB(importFromSitemap, file);  
  } else {
    throw new Error("Invalid strategy")
  }
})();
