const getUserRow = async (userId) => {
  try {
    const res = await fetch(`/api/matrix-factorization-posts/return-userRow-postRow/${userId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch user row');
    }
    const data = await res.json();
    if (data.message == "User row not found") {
      return null;
    }
    else if (data.message == "User row found") {
      const userRow = data.userRow;
      const firstRow = data.firstRowOfFirstChunk;
      console.log("firstRow 123 123: ", firstRow.length);
      return { userRow, firstRow };
    }
    else {
      throw new Error('Failed to fetch user row');
    }
  } catch (error) {
    console.error('Error fetching user row:', error);    
  }
}


export async function selectPosts(userId, seenPostIndexStart, seenPostIndexEnd) {
  try {
      
    // Find the row corresponding to the user within the chunk
    const dataUser = await getUserRow(userId);
    const userRow = dataUser.userRow;
    const firstRow = dataUser.firstRow;

    if (userRow) {
      const actualRow = userRow.slice(1); // Remove the userId from the row
      const postIds = firstRow.slice(1); // Extract the post IDs from the first row

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
      console.log("data.posts: ", data.posts);
      return data.posts;
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
