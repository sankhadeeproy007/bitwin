import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Player: a
    .model({
      userId: a.string().required(),
      score: a.integer().default(0),
      activeGuess: a.json(),
    })
    .authorization((allow) => [allow.publicApiKey()])
    .identifier(["userId"]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
