/*
 * server.js  (backend/server.js, next to package.json)
 *
 * What this file is for: the entry point. After Concept 12 it only wires
 * things together: settings check, middleware chain, routers, last stops, and
 * opening the port. Routes, request handling and SQL live in src/. Reading
 * this file top to bottom shows the whole life of a request.
 */

// Load the Express library from node_modules (Concept 2).
const express = require("express");

// SETTINGS and FAIL FAST (Concept 4). filter() keeps the names for which the
// arrow function returns true, so `missing` lists the required settings that
// are unset or empty.
const required = ["PORT", "DATABASE_URL"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(
    "Missing required settings: " + missing.join(", ") +
      ". Add them to the .env file in the backend folder, then start with: " +
      "node --env-file=.env server.js"
  );
  // Exit code 1 means "failed". A server that starts with missing settings
  // would only fail later, on the first request that needs them.
  process.exit(1);
}
const port = process.env.PORT;

// ORDER MATTERS HERE. The routers below load the controllers, which load the
// services, which load db.js, which reads DATABASE_URL the moment it is
// loaded. So these requires must come AFTER the settings check above, or a
// missing DATABASE_URL would show up as a confusing database error instead of
// the clear message above.
const membersRouter = require("./src/routes/members");
const entriesRouter = require("./src/routes/entries");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

// Create the application (Concept 2).
const app = express();

// Logger (Concept 3): prints "METHOD /path" and passes on with next().
app.use((req, res, next) => {
  console.log(req.method + " " + req.path);
  next();
});

// Body parser (Concept 3): turns a JSON body into req.body. It must come
// BEFORE the routers, or the controllers would see req.body as undefined.
app.use(express.json());

// Mount each router at a path prefix (Concept 12). A request for POST
// /entries enters entriesRouter, whose "/" rule matches the rest of the path.
app.use("/members", membersRouter);
app.use("/entries", entriesRouter);

// Last two stops of the chain (Concept 11). They go AFTER every route:
// notFound answers requests no route matched, and errorHandler answers
// anything thrown above.
app.use(notFound);
app.use(errorHandler);

// Open the door (Concept 2).
app.listen(port, () => {
  console.log("Listening on http://localhost:" + port);
});