// run local postgres, load albums into mongodb
import pkg from 'pg';
const { Pool, Client } = pkg;
import 'dotenv/config'

const credentials = {
  user: "postgres",
  host: "localhost",
  database: "musicbrainztest",
  password: "buddyseven",
  port: 5432,
};

// Connect with a client.
async function clientDemo() {
  const client = new Client(credentials);
  await client.connect();
  const now = await client.query("SELECT NOW()");
  await client.end();

  return now;
}

// Use a self-calling function so we can use async / await.
(async () => {
  const poolResult = await poolDemo();
  console.log("Time with pool: " + poolResult.rows[0]["now"]);

  const clientResult = await clientDemo();
  console.log("Time with client: " + clientResult.rows[0]["now"]);
})();
