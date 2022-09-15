const { getTopAlbums, getFriends } = require("../../lib/lastfm.js");
const { getLabels, getRelease } = require("../../lib/musicbrainz.js");
const musicbrainzRes = require("../testdata/musicbrainzRes.json");
const lastfmFriendsRes = require("../testdata/lastfmFriendsRes.json");
const userAlbumsJson = require("../testdata/useralbums.json");
const fetch = require("node-fetch");
const { RateLimitedError, NotFoundError } = require("../../lib/errors.js");
jest.mock("node-fetch");

describe("last.fm", () => {
  test("get user top albums", async () => {
    const testAlbums = userAlbumsJson[0].albums;
    const responseBody = { topalbums: { album: testAlbums } };
    const response = Promise.resolve({
      ok: true,
      status: 200,
      json: () => responseBody,
    });

    fetch.mockImplementation(() => response);

    const topAlbums = await getTopAlbums("ZoiAran");
    expect(topAlbums).toHaveProperty("albums");
    expect(topAlbums.albums).toEqual(testAlbums);
  });

  test("get user friends", async () => {
    const mbid = "mbid";
    const response = Promise.resolve({
      ok: true,
      status: 200,
      json: () => lastfmFriendsRes,
    });
    fetch.mockImplementation(() => response);
    const friends = await getFriends(mbid);
    expect(friends).toEqual({"users": ["fake_user", "Fake_user3"]});
  });


  test("user not found", async () => {
    const fakeUser = "awererwt";
    const response = Promise.resolve({
      ok: false,
      status: 404,
      json: () => {
        ({
          message: "User not found",
          error: 6,
        });
      },
    });

    fetch.mockImplementation(() => response);
    await expect(getTopAlbums(fakeUser)).rejects.toThrow("User not found");
  });

  test("time out last.fm api", async () => {
    const fakeUser = "awererwt";
    const limit = 100;
    const numTries = 4;
    const response = Promise.resolve({
      ok: false,
      status: 429,
      json: () => ({
        message: "Rate limit exceeded",
        error: 29,
      }),
    });

    fetch.mockImplementation(() => response);
    await expect(getTopAlbums(fakeUser, limit, numTries)).rejects.toThrow("Too many requests - try again later");
    expect(fetch).toBeCalled();
    expect(fetch).toHaveBeenCalledTimes(numTries);
  }, 25000);
});

describe("musicbrainz", () => {
  test("get release info for album", async () => {
    const mbid = musicbrainzRes.id;
    const response = Promise.resolve({
      ok: true,
      status: 200,
      json: () => musicbrainzRes,
    });
    fetch.mockImplementation(() => response);
    // check that release info is returned
    const releaseInfo = await getRelease(mbid);
    expect(releaseInfo).toBe(musicbrainzRes);
  });

  test("get no release info for a nonexistent album", async () => {
    const fakeMbid = "123";
    const responseBody = {
      help: "For usage, please see: https://musicbrainz.org/development/mmd",
      error: "Invalid mbid.",
    };
    const response = {
      ok: false,
      status: 400,
      json: () => responseBody,
    };
    fetch.mockImplementation(() => Promise.resolve(response));
    // check that release info is returned
    await expect(getRelease(fakeMbid)).rejects.toThrow(NotFoundError);
  });

  test("musicbrainz times out for album release info", async () => {
    const mbid = musicbrainzRes.id;

    const response = {
      ok: false,
      status: 503,
      json: () => "Limit access to one request per second"
    };

    fetch.mockImplementation(() => Promise.resolve(response));
    await expect(getRelease(mbid)).rejects.toThrowError(RateLimitedError);
    expect(fetch).toBeCalled();
    expect(fetch).toHaveBeenCalledTimes(5);
  }, 25000);

  test("get labels for album", async () => {
    const mbid = musicbrainzRes.id;
    const response = Promise.resolve({
      ok: true,
      status: 200,
      json: () => musicbrainzRes,
    });
    fetch.mockImplementation(() => response);
    const labels = await getLabels(mbid);
    expect(labels).toEqual(["Perpetual Novice"]);
  });

});
