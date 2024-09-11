import { getMatrixPosts } from "./getMatrixPosts";

export async function selectPosts(userId, seenPostIndexStart, seenPostIndexEnd) {
  try {
    const matrix = await getMatrixPosts();
    if (matrix) {
      
      // Find the row corresponding to the user
      const userRow = matrix.find(row => row[0] === userId);

      if (userRow) {
        const actualRow = userRow.slice(1); // Remove the userId from the row
        const postIds = matrix[0].slice(1); // Extract the post IDs from the first row
  
        // Create an array of objects with postId and value pairs
        const postValuePairs = postIds.map((postId, index) => ({
            postId,
            value: actualRow[index]
        }));
  
        // Sort the pairs by value in descending order, then select the top pairs
        // and then extract the post IDs from the top pairs
        const sortedPairs = postValuePairs.sort((a, b) => b.value - a.value);
        const topPairs = sortedPairs.slice(seenPostIndexStart, seenPostIndexEnd);
        const topPostIds = topPairs.map(pair => pair.postId);
  
        // If there are no posts to select, return an empty array
        if (topPostIds.length === 0) {
            return [];
        }
  
        // Fetch the posts from the topPostIds from the server and return them
        const res = await fetch('/api/post/get-posts-from-ids', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: topPostIds }),
          });
  
        if (!res.ok) {
            throw new Error('Failed to fetch posts');
        }
        const data = await res.json();
        return data.posts;
      }
    }
    
    // Select the posts with the most views
    const res = await fetch('/api/post/get-all-posts');
    if (!res.ok) {
        throw new Error('Failed to fetch posts');
    }
    const data = await res.json();
    const posts = data.posts;

    // Sort the posts by views in descending order
    const sortedPosts = posts.sort((a, b) => b.views - a.views);
    const topPosts = sortedPosts.slice(seenPostIndexStart, seenPostIndexEnd);
    return topPosts;
  } catch (error) {
    console.error('Error selecting posts:', error);
  }
}
