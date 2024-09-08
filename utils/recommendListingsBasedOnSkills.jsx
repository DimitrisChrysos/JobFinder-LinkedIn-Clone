import { getUserById } from "./getUserFromID";

const baseUrl = 'https://localhost:3000'; // Base URL of the API

const getListings = async () => {
    try {
        const url = new URL('/api/listing/get-all-listings', baseUrl);
        const res = await fetch(url.toString());
        if (!res.ok) {
            throw new Error('Failed to fetch listings');
        }
        const data = await res.json();
        const listings = data.listings;
        return listings;
    } catch (error) {
        console.log("An error occurred while fetching listings:", error);
        throw error;
    }
};

// Get the match count of a user's skills to the descriptions of all listings
export async function geSkillsToDescriptionMatch(userId) {
    try {
        const user = await getUserById(userId);
        const skills = user.skills;

        // Remove any commas or periods from the skills string
        const lowerCaseSkills = skills.toLowerCase();
        const replaceCommasAndDots = lowerCaseSkills.replace(/[,.]/g, ' ')
        const cleanedSkills = replaceCommasAndDots.replace(/[!#$%^&*@()\[\]{}|\/'"?><~\\`+=-_]/g, '');
        const singleSpacedSkills = cleanedSkills.replace(/\s+/g, ' ');
        const trimmedSkills = singleSpacedSkills.trim();
        const skillsArray = trimmedSkills.split(' ');
        
        console.log("skills: ", skillsArray);

        // Fetch all listings
        const listings = await getListings();

        // Array to store tuples of listings and their match counts
        const listingsWithMatchCount = [];

        // For each skill, find the listings that include that skill
        for (let skill of skillsArray) {
            const regex = new RegExp(`\\b${skill}\\b`, 'i'); // Create a regex to match the skill as a whole word, case-insensitive
            
            for (let listing of listings) {
                    if (regex.test(listing.description)) {
                        // Find the listing in the array
                        const existingListing = listingsWithMatchCount.find(tuple => tuple[0]._id === listing._id);
                    if (existingListing) {
                        // Increment the match count if the listing is already in the array
                        existingListing[1] += 1;
                    } else {
                        // Add the listing to the array with an initial match count of 1
                        listingsWithMatchCount.push([listing, 1]);
                    }
                }
            }
        }

        console.log("Listings with match counts: ", listingsWithMatchCount);
        return listingsWithMatchCount;
    } catch (error) {
        console.log("Error in recommendListingsBasedOnSkills: ", error);
    }
}