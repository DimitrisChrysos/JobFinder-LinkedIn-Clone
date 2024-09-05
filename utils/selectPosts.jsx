import { getMatrix } from "./getMatrix";

export async function selectPosts(userId) {
    try {
        const matrix = await getMatrix();
        console.log("matrix here:", matrix);
        
        // Find the row corresponding to the user
        const userRow = matrix.find(row => row[0] === userId);
        console.log("userRow here:", userRow);

        const actualRow = userRow.slice(1); // Remove the userId from the row
        const postIds = matrix[0].slice(1); // Extract the post IDs from the first row

        // Create an array of objects with postId and value pairs
        const postValuePairs = postIds.map((postId, index) => ({
            postId,
            value: actualRow[index]
        }));

        const sortedPairs = postValuePairs.sort((a, b) => b.value - a.value); // Sort in descending order
        const top10Pairs = sortedPairs.slice(0, 10); // Select the top 10 pairs
        const top10PostIds = top10Pairs.map(pair => pair.postId); // Extract the post IDs from the top 10 pairs
        console.log("top 10 post ids: ", top10PostIds);

        const res = await fetch('/api/post/get-posts-from-ids', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: top10PostIds }),
          });

        if (!res.ok) {
            throw new Error('Failed to fetch posts');
        }
        const data = await res.json();
        return data.posts;
        
    } catch (error) {
        console.error('Error selecting posts:', error);
    }
}
