import { API_TIMEOUT_MS, DEFAULT_API_URL } from "../constants";
import type { CardPayload, CardResponse } from "../types";

/**
 * Fetches a card by ID.
 *
 * @param id - The card ID
 * @returns The card data
 * @throws Error with user-friendly message
 */
export async function getCard(id: string): Promise<CardResponse> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/cards/${id}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.status === 404) {
      throw new Error("Card not found");
    }

    if (!response.ok) {
      throw new Error("Failed to load card. Please try again.");
    }

    return await response.json();
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (
        error.message === "Card not found" ||
        error.message === "Failed to load card. Please try again."
      ) {
        throw error;
      }
      if (error.name === "AbortError" || error.message.includes("aborted")) {
        throw new Error("Request timed out. Please try again.");
      }
    }
    throw new Error("Unable to reach the server. Check your connection and try again.");
  }
}

/**
 * Determines the base URL for the API.
 * Uses VITE_API_URL environment variable if defined and non-empty,
 * otherwise falls back to DEFAULT_API_URL.
 */
function getBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  return envUrl && envUrl.trim() !== "" ? envUrl : DEFAULT_API_URL;
}

/**
 * Sends a POST request to create a new emergency card.
 *
 * @param payload - The card data to submit
 * @returns The created card response from the API
 * @throws Error with user-friendly message for network, timeout, and HTTP errors
 */
export async function createCard(
  payload: CardPayload
): Promise<CardResponse> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/cards`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status >= 500) {
        throw new Error(
          "Something went wrong on our end. Please try again."
        );
      }
      // 4xx errors
      throw new Error(
        "Submission failed. Please check your data and try again."
      );
    }

    const data: CardResponse = await response.json();
    return data;
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      // Re-throw our own HTTP error messages
      if (
        error.message ===
          "Something went wrong on our end. Please try again." ||
        error.message ===
          "Submission failed. Please check your data and try again."
      ) {
        throw error;
      }

      // AbortError means timeout (check both name and message for cross-env compatibility)
      if (
        error.name === "AbortError" ||
        error.message.includes("aborted")
      ) {
        throw new Error(
          "The server is taking too long to respond. Please try again."
        );
      }
    }

    // Network errors (TypeError from fetch when no network, etc.)
    throw new Error(
      "Unable to reach the server. Check your connection and try again."
    );
  }
}
