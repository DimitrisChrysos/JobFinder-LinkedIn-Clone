import { getMatrix } from "./getMatrix";

export async function selectPosts() {
    try {
        const matrix = await getMatrix();
        console.log("matrix here:", matrix);
    } catch (error) {
        console.error('Error selecting posts:', error);
    }
}
