import * as jwt from "jose";
import { RequestHandler } from "express";
import { logtoClientId, logtoJwkUrl } from "../consts.ts";
import { RideShareJWTPayload } from "../types/jwt.ts";

const JWKSLogToURL = new URL(logtoJwkUrl);

const jwtOptions: jwt.JWTVerifyOptions = {
  audience: logtoClientId,
  maxTokenAge: 600000, // 10 min
};

const keyfunc = jwt.createRemoteJWKSet(JWKSLogToURL);

export const logtoMiddleware: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization?.trim();
  if (!authHeader) {
    res
      .status(400)
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

  const token = split[1];

  try {
    const claims = await jwt.jwtVerify<RideShareJWTPayload>(
      token,
      keyfunc,
      jwtOptions,
    );
    res.locals.user = claims.payload;
    console.log(
      `Verified user: Audience ${claims.payload.aud}, Sub ${claims.payload.sub}`,
    );
  } catch (_) {
    res
      .status(401) // Unauthorized
      .json({ message: "Invalid or expired token" });
    return;
  }

  next();
};

export const dummyLogtoMiddleware: RequestHandler = (req, res, next) => {
  res.locals.user = {
    sub: "user_123456",
    aud: "dummy-client-id",
    email: "testuser@example.com",
    name: "Test User",
    picture: "https://example.com/avatar.jpg",
    updated_at: Date.now(),
    username: "testuser",
    email_verified: true,
    created_at: Date.now(),
  };
  next();
};
