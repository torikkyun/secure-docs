/**
 * API helper for user search
 */

import type { UserSearchResult } from "./validation";
import { validateUserData } from "./validation";

export async function searchUserByEmail(
  email: string,
  authToken: string
): Promise<UserSearchResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2412";
  const url = `${apiUrl}/api/users/email/${encodeURIComponent(email)}`;

  console.log("Fetching user from:", url);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error("User not found with this email");
  }

  const data = await response.json();
  console.log("User data received:", data);

  // Backend may return data directly or wrapped in {data: ...}
  const userData = data.data || data;

  // Validate user data
  const validation = validateUserData(userData);

  if (!validation.valid) {
    throw new Error(validation.error || "Invalid user data");
  }

  if (!validation.data) {
    throw new Error("User data is missing");
  }

  return validation.data;
}

/**
 * Search users by partial email match (for autocomplete)
 */
export async function searchUsersByEmail(
  query: string,
  authToken: string
): Promise<UserSearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2412";
  const url = `${apiUrl}/api/users?search=${encodeURIComponent(query)}&limit=5`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      console.error("Search users failed:", response.statusText);
      return [];
    }

    const data = await response.json();

    const payload = data.data || data;
    const users = payload.users || [];

    return users
      .map((user: unknown) => {
        if (!user || typeof user !== "object") {
          return null;
        }
        const validation = validateUserData(user as Record<string, unknown>);
        return validation.valid ? validation.data : null;
      })
      .filter(Boolean) as UserSearchResult[];
  } catch (error) {
    console.error("Search users error:", error);
    return [];
  }
}
