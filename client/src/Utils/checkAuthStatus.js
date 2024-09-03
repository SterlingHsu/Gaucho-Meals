export const checkAuthStatus = async () => {
  const apiUrl = process.env.REACT_APP_API_URL;

  try {
    console.log("Call check in checkAuthStatus")
    const response = await fetch(`${apiUrl}/api/auth/check`, {
      method: "GET",
      credentials: "include",
    });
    console.log("After call check in checkAuthStatus", response)
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
