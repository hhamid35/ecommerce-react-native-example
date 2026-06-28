import { track, SCAN_EVENTS } from "../utils/scanAnalytics";

describe("scanAnalytics", () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it("exposes the formalized scan event names", () => {
    expect(SCAN_EVENTS).toEqual({
      STARTED: "scan_started",
      PERMISSION_DENIED: "scan_permission_denied",
      LOOKUP_SUCCESS: "scan_lookup_success",
      LOOKUP_MULTIPLE: "scan_lookup_multiple",
      LOOKUP_NOT_FOUND: "scan_lookup_not_found",
      LOOKUP_ERROR: "scan_lookup_error",
    });
  });

  it("forwards the event name and payload to console.log", () => {
    track(SCAN_EVENTS.LOOKUP_MULTIPLE, { scannedCode: "DUP-001", matchCount: 2 });
    expect(logSpy).toHaveBeenCalledWith("scan_lookup_multiple", {
      scannedCode: "DUP-001",
      matchCount: 2,
    });
  });

  it("defaults the payload to an empty object", () => {
    track(SCAN_EVENTS.STARTED);
    expect(logSpy).toHaveBeenCalledWith("scan_started", {});
  });
});
