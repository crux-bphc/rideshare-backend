// Use npm package or this?
import * as jwt from "https://deno.land/x/jose@v6.0.11/index.ts";
import { RequestHandler, Router } from "express";

export const oauth = Router();

const JWKSLogToURL = new URL("https://3r82t3.logto.app/oidc/jwks");

const jwtOptions = {
  audience: [Deno.env.get("LOGTO_APP_ID")!],
  maxTokenAge: 600000, // 10 min
};

const keyfunc = jwt.createRemoteJWKSet(JWKSLogToURL, {
  /* any options? */
});

export const ouathMiddleware: RequestHandler = async (req, res, next) => {
  console.log("verifying...");

  let token = (req.query.token ?? "") as string;

  if (req.query.token === undefined) {
    const auth_header = req.headers.authorization;
    if (auth_header === undefined || auth_header.trim() === "") {
      res
        .status(401) // Unauthorized - should it be bad request?
        .json({ message: "Missing or empty authorization header" });
      return;
    }

    // Bearer <token>
    const split = req.headers.authorization?.split(" ") ?? [];
    if (split.length != 2 || split[0].toLowerCase() !== "bearer") {
      res
        .status(400) // Bad request
        .json({ message: "Malformed authorization header" });
      return;
    }

    token = split[1];
  }

  try {
    const claims = await jwt.jwtVerify(token, keyfunc, jwtOptions);
    console.log("claims", claims);
  } catch (err) {
    res
      .status(400) // Bad request
      .json({ message: `Failed to verify user: ${err}` });
    return;
  }

  next();
};

// Add user verification through middleware
oauth.use(ouathMiddleware);
