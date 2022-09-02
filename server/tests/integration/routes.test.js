import request from "supertest";
import express from "express";
import {
  FAILURE,
  SUCCESS,
  deleteJob,
} from "../../lib/db/records";
import { closeConnection, connectToCluster, openDb } from "../../lib/db/conn";
import { createJob } from "../../lib/jobs.js";
const app = express();

const VALID_USER = "ZoiAran";

describe("/jobs/:jobId", () => {
  const jobUrl = `/labels/${VALID_USER}`;
  let jobId;
  let cluster;
  let db;

  beforeAll(async () => {
    // open db connection
    console.log("before");
    cluster = await connectToCluster();
    db = await openDb(cluster);

    jobId = await createJob(db, jobUrl);
  });

  afterAll(async () => {
    // remove job
    await deleteJob(db, jobUrl);
    // close db connection
    closeConnection(cluster);
  });

  test("make sure fake job does not exist", () => {
    const url = `/jobs/aerbvihbt5yQHUT`;
    request(app).get(url).expect(404);
  });

  test("job success", () => {
    // set success
    const url = `/jobs/${jobId}`;
    request(app)
      .get(url)
      .expect((res) => expect(res.body).toBe({ status: SUCCESS }))
      .expect(200);
  });

  test("job failure", () => {
    // set failure
    const url = `/jobs/${jobId}`;
    request(app)
      .get(url)
      .expect((res) => expect(res.body).toBe({ status: FAILURE }))
      .expect(200);
  });

  test("user not found", async () => {});
  test("time out, try for 30 seconds then return an error", async () => {});
});

describe("/labels/:username", () => {
  test("get all top labels for user", () => {});

  test("/labels/:username?limit=10 - get top 10 labels for user", () => {});

  test("labels/:username - return 404 when user is not found", () => {});
});
