import { describe, it, expect, beforeEach } from "vitest";
import {
  logger,
  setMinLogLevel,
  setCorrelationId,
  getLogBuffer,
  clearLogBuffer,
} from "../structured-logger";
import {
  computeHealthIndex,
  PERFORMANCE_BUDGETS,
} from "../health-index";
import {
  SITA_SLOS,
  computeSLOStatus,
} from "../slo-tracking";
import {
  detectAnomaly,
  mean,
  standardDeviation,
} from "../anomaly-detection";
import {
  generateTraceId,
  generateSpanId,
} from "../distributed-tracing";

describe("StructuredLogger", () => {
  beforeEach(() => {
    clearLogBuffer();
    setMinLogLevel("debug");
  });

  it("logs entries to buffer", () => {
    logger.info("test message");
    const buffer = getLogBuffer();
    expect(buffer.length).toBe(1);
    expect(buffer[0].message).toBe("test message");
    expect(buffer[0].level).toBe("info");
  });

  it("setMinLogLevel filters correctly", () => {
    setMinLogLevel("error");
    logger.info("should be filtered");
    logger.error("should pass", new Error("e"));
    const buffer = getLogBuffer();
    expect(buffer.length).toBe(1);
    expect(buffer[0].level).toBe("error");
  });

  it("setCorrelationId propagates to entries", () => {
    setCorrelationId("cor-123");
    logger.info("correlated");
    const buffer = getLogBuffer();
    expect(buffer[0].correlationId).toBe("cor-123");
  });

  it("clearLogBuffer resets buffer", () => {
    logger.info("a");
    logger.info("b");
    expect(getLogBuffer().length).toBe(2);
    clearLogBuffer();
    expect(getLogBuffer().length).toBe(0);
  });

  it("buffer respects MAX_BUFFER (500)", () => {
    for (let i = 0; i < 510; i++) {
      logger.debug(`msg-${i}`);
    }
    expect(getLogBuffer().length).toBe(500);
  });

  it("correlationId generator produces prefixed IDs", () => {
    const id = logger.correlationId();
    expect(id.startsWith("cor_")).toBe(true);
  });
});

describe("Health Index", () => {
  it("PERFORMANCE_BUDGETS has entries", () => {
    expect(Object.keys(PERFORMANCE_BUDGETS).length).toBeGreaterThan(0);
  });

  it("computeHealthIndex returns valid index", () => {
    const index = computeHealthIndex({});
    expect(index).toBeDefined();
    expect(index.overallScore).toBeGreaterThanOrEqual(0);
    expect(index.overallScore).toBeLessThanOrEqual(100);
    expect(index.grade).toBeTruthy();
  });
});

describe("SLO Tracking", () => {
  it("SITA_SLOS has definitions", () => {
    expect(SITA_SLOS.length).toBeGreaterThan(0);
  });

  it("computeSLOStatus returns valid status", () => {
    const slo = SITA_SLOS[0];
    const status = computeSLOStatus(slo, 99.9);
    expect(status).toBeDefined();
    expect(typeof status.met).toBe("boolean");
  });
});

describe("Anomaly Detection", () => {
  it("mean computes correctly", () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
  });

  it("standardDeviation computes correctly", () => {
    const sd = standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(sd).toBeGreaterThan(0);
  });

  it("detectAnomaly flags outliers", () => {
    const data = [10, 10, 10, 10, 10, 100];
    const result = detectAnomaly(data);
    expect(result.isAnomaly).toBe(true);
  });
});

describe("Distributed Tracing", () => {
  it("generateTraceId returns 32-char hex", () => {
    const id = generateTraceId();
    expect(id.length).toBe(32);
    expect(/^[0-9a-f]+$/.test(id)).toBe(true);
  });

  it("generateSpanId returns 16-char hex", () => {
    const id = generateSpanId();
    expect(id.length).toBe(16);
    expect(/^[0-9a-f]+$/.test(id)).toBe(true);
  });
});