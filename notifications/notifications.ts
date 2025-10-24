import { pg } from "./db.ts";
import messaging from "./firebase.ts";

export const sendMessage = async (
  title: string,
  message: string,
  tokens: string[],
) => {
  try {
    const msg = {
      tokens,
      notification: { title, body: message },
    };
    const res = await messaging.sendEachForMulticast(msg);

    for (const [index, response] of res.responses.entries()) {
      if (
        !response.success &&
        [
          "messaging/registration-token-not-registered",
          "messaging/invalid-registration-token",
          "messaging/invalid-argument",
        ].includes(response.error?.code ?? "")
      ) {
        // index corresponds to the token according to the docs
        // Purge stale token
        await pg`
          UPDATE users
          SET tokens = array_remove(tokens, ${tokens[index]})
          WHERE ${tokens[index]} = ANY(tokens)
        `;
      }
    }
  } catch (e) {
    console.error("Failed to send multicast notifications", e);
  }
};
