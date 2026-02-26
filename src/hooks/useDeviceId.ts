"use client";

import { v4 as uuidv4 } from "uuid";

const DEVICE_ID_KEY = "device_id";

/**
 * Returns a stable device identifier persisted in localStorage.
 * Generates one on first call and reuses it thereafter.
 */
export function getDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}
