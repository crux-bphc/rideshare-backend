import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import process from "node:process";

const app = initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
  credential: applicationDefault(),
});

const messaging = getMessaging(app);

export default messaging;
