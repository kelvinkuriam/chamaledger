function notFound(req, res) {
  // 404 Not Found (Concept 1). req.method and req.path are the two parts a
  // route must match, so the message tells the client exactly what it asked.
  // We never call next(): a response has been sent, which ends the chain.
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "No route for " + req.method + " " + req.path,
    },
  });
}

// errorHandler has FOUR parameters, and the count IS the signal. Express
// treats a four-parameter function as the place errors go, and calls it when
// a handler throws, or returns a rejected promise (Express 5 does this for
// async handlers on its own).
// Silent failure: delete the unused `next` and Express sees three parameters,
// treats this as ordinary middleware, and never calls it for errors. The
// client then gets Express's default HTML page with a stack trace, and
// nothing warns you. (Tested in Concept 11.) Keep `next` even though the
// body never uses it.
function errorHandler(err, req, res, next) {
  // CASE 1: an error WE threw on purpose with appError (errors.js). We trust
  // its status, code and message, because we wrote them.
  if (err.isAppError) {
    // Build the inner object first so `details` can be added only when it
    // exists. A response with "details": undefined would be sent without the
    // key anyway, but the explicit check keeps that intention visible.
    const body = { code: err.code, message: err.message };
    if (err.details) body.details = err.details;
    // return stops the function here, so the later cases do not also run
    // and try to send a second response (which would crash with an error).
    return res.status(err.status).json({ error: body });
  }

  // CASE 2: express.json (Concept 3) throws an error with type
  // "entity.parse.failed" when the body is not valid JSON, for example
  // {"name":  cut off halfway. The client caused it, so it is a 400, not a
  // 500. Without this case the client would be told the SERVER failed.
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "The request body is not valid JSON.",
      },
    });
  }

  // CASE 3: everything else is OUR bug or a failure we did not plan for (the
  // database is down, a typo in SQL). console.error writes the full error,
  // with its stack, to the terminal where only we read it. The client gets a
  // generic message, because err.message can contain table names, SQL, user
  // names or file paths that help an attacker and mean nothing to a treasurer.
  console.error(err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong on our side.",
    },
  });
}

// Export both so server.js can register them (Concept 2: require/exports).
module.exports = { notFound, errorHandler };