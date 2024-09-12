// Get the factorized matrix for the posts
export async function getMatrixPosts() {
    try {
        const res = await fetch('/api/matrix-factorization-posts/matrix-exists');
        if (!res.ok) {
            throw new Error('Failed to fetch the matrix');
        }
        const data = await res.json();
        if (data.message === "Matrix exists") {
            return data.data;
        }
        else if (data.message === "Matrix does not exist") {
            return null;
        }
        else {
            throw new Error('Failed to fetch the matrix: ' + data.error);
        }
    } catch (error) {
        console.log("An error occurred while fetching the matrix:", error);
        throw error;
    }
};