export { authHandlers } from "./auth";
export { runnersHandlers } from "./runners";
export { raceHandlers } from "./race";
export { mediaHandlers } from "./media";
export { weatherHandlers } from "./weather";

import { authHandlers } from "./auth";
import { runnersHandlers } from "./runners";
import { raceHandlers } from "./race";
import { mediaHandlers } from "./media";
import { weatherHandlers } from "./weather";

export const handlers = [
  ...authHandlers,
  ...runnersHandlers,
  ...raceHandlers,
  ...mediaHandlers,
  ...weatherHandlers,
];
