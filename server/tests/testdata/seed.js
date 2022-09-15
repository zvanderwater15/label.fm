const { USER_ALBUMS, USER_FRIENDS, ALBUMS, JOBS } = require("../../lib/constants");
const userAlbumsJson = require('./useralbums.json');
const userFriendsJson = require('./userfriends.json');
const albumsJson = require('./albums.json');
const jobsJson = require('./jobs.json');

const seedData = async (db) => {
    await db.collection(ALBUMS).insertMany(albumsJson);
    await db.collection(USER_FRIENDS).insertMany(userFriendsJson);
    await db.collection(USER_ALBUMS).insertMany(userAlbumsJson);
    await db.collection(JOBS).insertMany(jobsJson);
}

module.exports = { seedData }