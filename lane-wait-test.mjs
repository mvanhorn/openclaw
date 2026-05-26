// Real behavior proof for openclaw #86676 / #14747
// Exercises the built command-queue against the runtime snapshot to prove the
// configurable diagnostics.laneWaitWarnMs threshold is honored at runtime.

import {
  i as enqueueCommandInLane,
  m as setCommandLaneConcurrency,
  f as resetAllLanes,
} from "/Users/mvanhorn/.osc/workspaces/openclaw-openclaw-PLAN-2026-05-25-040-feat-openclaw-cron-job-summary-ui/dist/command-queue-Flr5BAJS.js";
import {
  v as setRuntimeConfigSnapshot,
} from "/Users/mvanhorn/.osc/workspaces/openclaw-openclaw-PLAN-2026-05-25-040-feat-openclaw-cron-job-summary-ui/dist/runtime-snapshot-D93_HOsR.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run(label, warnMs) {
  console.log(`\n=== ${label}: diagnostics.laneWaitWarnMs=${warnMs} ===`);
  resetAllLanes();
  setCommandLaneConcurrency("test-lane", 1);
  setRuntimeConfigSnapshot({ diagnostics: { laneWaitWarnMs: warnMs } });

  // Task A: holds the lane for 500ms
  const a = enqueueCommandInLane("test-lane", async () => {
    await sleep(500);
    return "A done";
  });
  // Task B: enqueued immediately - waits for A
  const b = enqueueCommandInLane("test-lane", async () => "B done");
  const [resA, resB] = await Promise.all([a, b]);
  console.log(`  task A: ${resA}, task B: ${resB}`);
}

await run("Default threshold (2000ms - warn should NOT fire)", undefined);
await run("Custom threshold 100ms (warn SHOULD fire on Task B)", 100);

console.log("\n=== Done ===");
process.exit(0);
