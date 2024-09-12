import { geSkillsToDescriptionMatch } from "./recommendListingsBasedOnSkills";

const getUserRow = async (userId) => {
  try {
    const res = await fetch(`/api/matrix-factorization-listings/return-userRow-listingRow/${userId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch user row');
    }
    const data = await res.json();
    if (data.message == "User row not found") {
      return null;
    }
    else if (data.message == "Fist chunk not found") {
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

export async function selectListings(userId, seenListingIndexStart, seenListingIndexEnd) {
    try {

      // Find the row corresponding to the user within the chunk
      const dataUser = await getUserRow(userId);
      const userRow = dataUser ? dataUser.userRow : null;
      const firstRow = dataUser ? dataUser.firstRow : null;

      const listingsWithMatchCount = await geSkillsToDescriptionMatch(userId);

      // If the userRow exists, use the matrix factorization to select the listings
      if (userRow) {
        const actualRow = userRow.slice(1); // Remove the userId from the row
        const listingIds = firstRow.slice(1); // Extract the listing IDs from the first row

        // Create an array of objects with listingId and value pairs (add the match count to the value)
        const listingValuePairs = listingIds.map((listingId, index) => {

          // Find the corresponding listing in listingsWithMatchCount
          const listingWithCount = listingsWithMatchCount.find(tuple => tuple[0]._id === listingId);
          const matchCount = listingWithCount ? listingWithCount[1] : 0; // Get the match count or default to 0

          return {
            listingId,
            value: actualRow[index] + matchCount*0.1*actualRow[index] // Add the match count to the value
          }
        });
        console.log("listingValuePairs here:", listingValuePairs);

        // Sort the pairs by value in descending order, then select the top pairs
        // and then extract the listing IDs from the top pairs
        const sortedPairs = listingValuePairs.sort((a, b) => b.value - a.value);
        const topPairs = sortedPairs.slice(seenListingIndexStart, seenListingIndexEnd);
        const topListingIds = topPairs.map(pair => pair.listingId);
  
        // If there are no listings to select, return an empty array
        if (topListingIds.length === 0) {
            return [];
        }
  
        // Fetch the listings from the topListingIds from the server and return them
        const res = await fetch('/api/listing/get-listings-from-ids', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ids: topListingIds }),
          });
  
        if (!res.ok) {
            throw new Error('Failed to fetch listings');
        }
        const data = await res.json();
        // console.log("how many listings?", data.listings.length);
        return data.listings;
      }

      // Else if userRow doesn't exist, select the listings with the most views
      const res = await fetch('/api/listing/get-all-listings');
      if (!res.ok) {
          throw new Error('Failed to fetch listings');
      }
      const data = await res.json();
      const listings = data.listings;

      // Sort the listings by views in descending order
      const sortedListings = listings.sort((a, b) => b.views - a.views);
      const topListings = sortedListings.slice(seenListingIndexStart, seenListingIndexEnd);
      return topListings;
    } catch (error) {
      console.error('Error selecting listings:', error);
    }
  }