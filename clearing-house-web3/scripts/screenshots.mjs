// npm run screenshots
// Runs the demo on a local anvil with three anvil accounts as participants
// (so the script can sign in place of the Flex), drives the page with Playwright
// and saves the screenshots used in the README. The agent step needs
// OPENROUTER_API_KEY in .env, it is skipped otherwise.
import { existsSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { chromium } from "playwright";
import { privateKeyToAccount } from "viem/accounts";
import { instructionToText, mandateToText } from "@chw3/protocol";
import { ROOT, startLocalStack } from "./local-stack.mjs";

const ENV_FILE = resolve(ROOT, ".env");
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const OUT_DIR = resolve(ROOT, "../docs-clearing-house-web3/screenshots");
const UNIT = 10n ** 6n;
const CYCLE = new Date().toISOString().slice(0, 10);
const VIEWPORT = { width: 1920, height: 1080 };

mkdirSync(OUT_DIR, { recursive: true });

// Anvil accounts 2, 3, 4 play A, B, C. Their keys come from the anvil banner.
const stack = await startLocalStack({ participants: (accounts) => accounts.slice(2, 5), storeDir: mkdtempSync(join(tmpdir(), "chw3-shots-")) });
const [, , keyA, keyB] = stack.keys;
const api = async (path, body) => {
  const res = await fetch(stack.serverUrl + path, { method: body ? "POST" : "GET", headers: { "content-type": "application/json" }, body: body && JSON.stringify(body) });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
};
const accountA = privateKeyToAccount(keyA);
const accountB = privateKeyToAccount(keyB);

async function signMandate(account, name) {
  const mandate = { participant: account.address, participantName: name, allowedFunds: ["Fund F"], maxCashPerCycle: 5_000_000n * UNIT, allowedSides: ["BUY", "SELL"], nonce: 1 };
  const signature = await account.signMessage({ message: mandateToText(mandate) });
  await api("/mandates", { mandate: { ...mandate, maxCashPerCycle: mandate.maxCashPerCycle.toString() }, signature });
}

async function signOrder(account, name, id, side, units, nonce, origin) {
  const instruction = { id, cycleId: CYCLE, fund: stack.deployer, participant: account.address, side, shares: units * UNIT };
  const payload = { instruction, fundName: "Fund F", participantName: name, nonce };
  const signature = await account.signMessage({ message: instructionToText(payload) });
  await api("/instructions", { ...payload, instruction: { ...instruction, shares: instruction.shares.toString() }, signature, origin });
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
const shot = async (name) => {
  await page.goto(stack.webUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: join(OUT_DIR, `${name}.png`), fullPage: true });
  console.log(`[shots] ${name}.png`);
};

try {
  await shot("01-empty");

  await signMandate(accountA, "Manager A");
  await signMandate(accountB, "Manager B");
  await shot("02-mandates");

  if (process.env.OPENROUTER_API_KEY) {
    await page.goto(stack.webUrl, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /New email order/ }).click();
    await page.getByTestId("agent-result").waitFor({ timeout: 60_000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(OUT_DIR, "03-agent-draft.png"), fullPage: true });
    console.log("[shots] 03-agent-draft.png");
  }

  await signOrder(accountA, "Manager A", "a1b2c3", "BUY", 100n, 1, "agent");
  await signOrder(accountB, "Manager B", "d4e5f6", "SELL", 40n, 1, "manual");
  await shot("04-orders-signed");

  if (process.env.OPENROUTER_API_KEY) {
    await page.goto(stack.webUrl, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Trapped email/ }).click();
    await page.getByTestId("agent-result").waitFor({ timeout: 60_000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: join(OUT_DIR, "05-trapped-email.png"), fullPage: true });
    console.log("[shots] 05-trapped-email.png");
  }

  const lot = await api(`/cycles/${CYCLE}/lots`, { mode: "netting" });
  await shot("06-lot-pending");

  for (const account of [accountA, accountB]) {
    const signature = await account.signMessage({ message: lot.texts[account.address] });
    await api(`/lots/${lot.id}/approvals`, { participant: account.address, signature });
  }
  await shot("07-lot-settled");

  await signOrder(accountA, "Manager A", "9f8e7d", "BUY", 10n, 2, "manual");
  const instant = await api(`/cycles/${CYCLE}/lots`, { mode: "instant" });
  const signature = await accountA.signMessage({ message: instant.texts[accountA.address] });
  await api(`/lots/${instant.id}/approvals`, { participant: accountA.address, signature });
  await shot("08-instant-settled");
} finally {
  await browser.close();
  stack.stop();
  process.exit(0);
}
