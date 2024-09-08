import { getMatrixListings } from "./getMatrixListings";


export async function selectListings(userId, seenListingIndexStart, seenListingIndexEnd) {
    try {
      const matrix = await getMatrixListings();
      if (matrix) {
        console.log("matrix here:", matrix);
        
        // Find the row corresponding to the user
        const userRow = matrix.find(row => row[0] === userId);
        console.log("userRow here:", userRow);
  
        const actualRow = userRow.slice(1); // Remove the userId from the row
        const listingIds = matrix[0].slice(1); // Extract the listing IDs from the first row
  
        // Create an array of objects with listingId and value pairs
        const listingValuePairs = listingIds.map((listingId, index) => ({
            listingId,
            value: actualRow[index]
        }));
  
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
        console.log("how many listings?", data.listings.length);
        return data.listings;
      }
      else {
        // Select the listings with the most views
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
      }
    } catch (error) {
      console.error('Error selecting listings:', error);
    }
  }