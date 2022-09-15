// server/index.js
require("dotenv/config");
const createServer = require("./server.js") 

const PORT = process.env.PORT || 3001;

const app = createServer() 

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

