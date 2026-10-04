import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { formatNumber, formatTime, formatRelativeTime } from "./format";

describe("format utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-04T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formatNumber formats decimals and limits", () => {
    expect(formatNumber(12.3456)).toBe("12.3");
    expect(formatNumber(null)).toBe("—");
  });

  it("formatTime formats time strings", () => {
    expect(formatTime(null)).toBe("—");
    expect(formatTime("2026-10-04T12:00:00Z")).toBeDefined();
  });

  it("formatRelativeTime formats correctly", () => {
    expect(formatRelativeTime(null)).toBe("—");
    expect(formatRelativeTime("2026-10-04T11:59:45Z")).toBe("just now");
    expect(formatRelativeTime("2026-10-04T11:55:00Z")).toBe("5 min ago");
    expect(formatRelativeTime("2026-10-04T09:00:00Z")).toBe("3 h ago");
    expect(formatRelativeTime("2026-10-02T12:00:00Z")).toBe("2 days ago");
    expect(formatRelativeTime("2026-10-03T12:00:00Z")).toBe("1 day ago");
  });
});
