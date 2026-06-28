// Single choke point for scan telemetry so event names and fields stay
// consistent and a real analytics SDK can replace console.log later without
// touching call sites. Event names match the existing scan_* convention.

export const SCAN_EVENTS = {
  STARTED: "scan_started",
  PERMISSION_DENIED: "scan_permission_denied",
  LOOKUP_SUCCESS: "scan_lookup_success",
  LOOKUP_MULTIPLE: "scan_lookup_multiple",
  LOOKUP_NOT_FOUND: "scan_lookup_not_found",
  LOOKUP_ERROR: "scan_lookup_error",
};

/**
 * @param {string} event - one of SCAN_EVENTS
 * @param {object} [payload] - structured fields for the event
 */
export function track(event, payload) {
  console.log(event, payload ?? {});
}
