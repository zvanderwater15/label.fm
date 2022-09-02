import { v4 as uuidv4 } from "uuid";
import {
  PENDING,
  insertJob,
} from "./db/records";

export async function createJob(db, url) {
  const jobId = uuidv4();
  await insertJob(db, jobId, url, PENDING);
  return jobId
}
