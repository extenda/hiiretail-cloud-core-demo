import type { ReadOutcome, Snapshot } from "../api/read";

export class ReadError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ReadError";
    this.status = status;
  }
}

export function unwrap<T>(outcome: ReadOutcome<T>): Snapshot<T> {
  if (outcome.kind === "error") {
    throw new ReadError(outcome.status, outcome.message);
  }
  if (outcome.kind === "notModified") {
    throw new ReadError(304, "Unexpected 304 on an unconditional request.");
  }

  return outcome.snapshot;
}
