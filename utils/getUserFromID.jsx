export async function getUserById(userId) {
    try {
        const res = await fetch(`/api/profile_info/${userId}`, {cache: "no-store"});
        if (!res.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await res.json();
        return data.user;
    } catch (error) {
        console.error("An error occurred while fetching user:", error);
        throw error;
    }
}