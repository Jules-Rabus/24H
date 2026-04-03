export { authHandlers } from "./auth";
export { runnersHandlers } from "./runners";
export { raceHandlers } from "./race";
export { mediaHandlers } from "./media";
export { weatherHandlers } from "./weather";
export { adminHandlers } from "./admin";

import { authHandlers } from "./auth";
import { runnersHandlers } from "./runners";
import { raceHandlers } from "./race";
import { mediaHandlers } from "./media";
import { weatherHandlers } from "./weather";
import { adminHandlers } from "./admin";

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
  ...runnersHandlers,
  ...raceHandlers,
  ...mediaHandlers,
  ...weatherHandlers,
];
