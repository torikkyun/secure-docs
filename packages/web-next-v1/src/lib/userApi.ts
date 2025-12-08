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
