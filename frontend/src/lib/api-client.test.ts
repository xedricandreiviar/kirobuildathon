import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createCard } from "./api-client";
import type { CardPayload, CardResponse } from "../types";

const mockPayload: CardPayload = {
  fullName: "Juan Dela Cruz",
  bloodType: "O+",
  allergies: ["Peanuts"],
  conditions: ["Asthma"],
  medications: ["Salbutamol"],
  emergencyContacts: [
    { name: "Maria", relationship: "Mother", phone: "09171234567" },
  ],
  notes: "No other notes",
};

const mockResponse: CardResponse = {
  id: "abc-123",
  fullName: "Juan Dela Cruz",
  bloodType: "O+",
  allergies: ["Peanuts"],
  conditions: ["Asthma"],
  medications: ["Salbutamol"],
  emergencyContacts: [
    { name: "Maria", relationship: "Mother", phone: "09171234567" },
  ],
  notes: "No other notes",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

describe("api-client createCard", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("sends POST to /api/cards with JSON content-type and returns response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockResponse),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await createCard(mockPayload);

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:3001/api/cards");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(options.body)).toEqual(mockPayload);
    expect(result).toEqual(mockResponse);
  });

  it("uses VITE_API_URL when defined", async () => {
    vi.stubEnv("VITE_API_URL", "https://api.example.com");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockResponse),
    });
    vi.stubGlobal("fetch", mockFetch);

    await createCard(mockPayload);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("https://api.example.com/api/cards");
  });

  it("falls back to default URL when VITE_API_URL is empty string", async () => {
    vi.stubEnv("VITE_API_URL", "");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockResponse),
    });
    vi.stubGlobal("fetch", mockFetch);

    await createCard(mockPayload);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe("http://localhost:3001/api/cards");
  });

  it("throws user-friendly message on HTTP 4xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
      })
    );

    await expect(createCard(mockPayload)).rejects.toThrow(
      "Submission failed. Please check your data and try again."
    );
  });

  it("throws user-friendly message on HTTP 5xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    );

    await expect(createCard(mockPayload)).rejects.toThrow(
      "Something went wrong on our end. Please try again."
    );
  });

  it("throws network error message when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch"))
    );

    await expect(createCard(mockPayload)).rejects.toThrow(
      "Unable to reach the server. Check your connection and try again."
    );
  });

  it("throws timeout error when request exceeds 10 seconds", async () => {
    vi.useFakeTimers();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        (_url: string, options: { signal: AbortSignal }) =>
          new Promise((_resolve, reject) => {
            options.signal.addEventListener("abort", () => {
              const err = Object.assign(new Error("The operation was aborted."), {
                name: "AbortError",
              });
              reject(err);
            });
          })
      )
    );

    const promise = createCard(mockPayload);
    vi.advanceTimersByTime(10_000);

    await expect(promise).rejects.toThrow(
      "The server is taking too long to respond. Please try again."
    );

    vi.useRealTimers();
  });
});
