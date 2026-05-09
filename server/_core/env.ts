export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // Email — set EMAIL_PROVIDER=sendgrid and SENDGRID_API_KEY to activate.
  // Leave unset in development; emails will be logged to console only.
  emailProvider: (process.env.EMAIL_PROVIDER ?? "console") as "sendgrid" | "aws-ses" | "console",
  sendgridApiKey: process.env.SENDGRID_API_KEY ?? "",
  awsRegion: process.env.AWS_REGION ?? "af-south-1",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
};
