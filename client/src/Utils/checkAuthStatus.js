export const checkAuthStatus = async () => {
  const apiUrl = process.env.API_URL;

  try {
    const response = await fetch(`${apiUrl}/api/auth/check`, {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return data.authenticated;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
};
