import { createHash } from "crypto";
import { getStore } from "./store";
import type { LedgerBlock, LedgerEventType } from "./types";

const GENESIS_HASH = "0".repeat(64);

function hashBlock(fields: Omit<LedgerBlock, "hash">): string {
  const payload = JSON.stringify({
    index: fields.index,
    timestamp: fields.timestamp,
    type: fields.type,
    summary: fields.summary,
    data: fields.data,
    prevHash: fields.prevHash,
  });
  return createHash("sha256").update(payload).digest("hex");
}

export function appendLedgerBlock(
  type: LedgerEventType,
  summary: string,
  data: Record<string, unknown>
): LedgerBlock {
  const store = getStore();
  const prevHash =
    store.ledger.length > 0
      ? store.ledger[store.ledger.length - 1].hash
      : GENESIS_HASH;

  const fields = {
    index: store.ledger.length,
    timestamp: new Date().toISOString(),
    type,
    summary,
    data,
    prevHash,
  };

  const block: LedgerBlock = { ...fields, hash: hashBlock(fields) };
  store.ledger.push(block);
  return block;
}

export function verifyLedger(): { valid: boolean; brokenAtIndex: number | null } {
  const store = getStore();
  let prevHash = GENESIS_HASH;

  for (const block of store.ledger) {
    if (block.prevHash !== prevHash) {
      return { valid: false, brokenAtIndex: block.index };
    }
    const recomputed = hashBlock(block);
    if (recomputed !== block.hash) {
      return { valid: false, brokenAtIndex: block.index };
    }
    prevHash = block.hash;
  }

  return { valid: true, brokenAtIndex: null };
}
