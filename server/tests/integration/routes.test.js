const request = require("supertest");
const { FAILURE, SUCCESS } = require("../../lib/constants");
const fetch = require("node-fetch");
const {
  closeConnection,
  connectToCluster,
  openDb,
} = require("../../lib/db/conn");
const { createJob } = require("../../lib/jobs.js");
const { seedData } = require("../testdata/seed.js");
const { updateJob } = require("../../lib/db/records.js");
const createServer = require("../../server.js");
jest.mock("node-fetch");
const app = createServer();

const VALID_USER = "ZoiAran";
jest.setTimeout(5000);

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ rates: { CAD: 1.42 } }),
  })
);

describe("/jobs/:jobId", () => {
  const jobUrl = `/api/labels/${VALID_USER}`;
  let jobId;
  let cluster;
  let db;

  beforeAll(async () => {
    cluster = await connectToCluster();
    db = await openDb(cluster);
    await seedData(db);

    // create job to test with
    jobId = await createJob(db, jobUrl);
  });

  afterAll(async () => {
    await closeConnection(cluster);
    await new Promise((resolve) => setTimeout(() => resolve(), 1000)); // avoid jest open handle error
  });

  test("make sure fake job does not exist", async () => {
    const url = `/api/jobs/aerbvihbt5yQHUT`;
    const res = await request(app).get(url).expect(404);
  });

  test("job success", async () => {
    // set job success in the database
    const updated = await updateJob(db, jobId, SUCCESS);
    // check that the api shows this job as succeeded and returns the job url
    const url = `/api/jobs/${jobId}`;
    const res = await request(app)
      .get(url)
      .expect((res) =>
        expect(res.body).toEqual({ status: SUCCESS, href: jobUrl })
      )
      .expect(200)
      .expect("Content-Type", /json/);
  });

  test("job failure", async () => {
    // set job as failed in the database
    const updated = await updateJob(db, jobId, FAILURE);
    // check that the api shows this job as failed and returns the job url
    const url = `/api/jobs/${jobId}`;
    const res = await request(app)
      .get(url)
      .expect((res) =>
        expect(res.body).toEqual({ status: FAILURE, href: jobUrl })
      )
      .expect("Content-Type", /json/)
      .expect(200);
  });

  test("user not found", async () => {});
  test("time out, try for 30 seconds then return an error", async () => {});
});

describe("/labels/:username", () => {
  test("get all top labels for user", async () => {
    const url = `/api/labels/ZoiAran`;
    const res = await request(app)
      .get(url)
      .expect((res) => expect(res.body).toHaveProperty("labels"))
      .expect(200);
  });

  test("/labels/:username?limit=10 - get top 10 labels for user", async () => {
    const url = `/api/labels/ZoiAran?limit=10`;
    const res = await request(app)
      .get(url)
      .expect((res) => expect(res.body).toHaveProperty("labels"))
      .expect(200);
  });

  test("state that the job has been started if it will be long running", async () => {
    const unprocessedUserAlbumsJson = require("../testdata/unprocessedUserAlbumsRes.json")

    const response = {
      ok: true,
      status: 200,
      json: () => unprocessedUserAlbumsJson,
    };
    fetch.mockImplementation(() => Promise.resolve(response));
    const url = `/api/labels/aweewa`;
    const res = await request(app).get(url).expect(202);
  });

  test("labels/:username - return 404 when user is not found", async () => {
    const response = {
      ok: false,
      status: 404,
      json: () => ({
        message: "User not found",
        error: 6,
      }),
    };
    fetch.mockImplementation(() => Promise.resolve(response));
    const url = `/api/labels/aweewa`;
    const res = await request(app).get(url).expect(404);
  }, 30000);
});
