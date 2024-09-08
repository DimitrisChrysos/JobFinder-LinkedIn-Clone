import mongoose, { models, Schema } from "mongoose";

const matrixPostsSchema = new Schema({
    data: {
        type: Array,
        required: true,
    }
}, { timestamps: true });

const MatrixPosts = models.MatrixPosts || mongoose.model("MatrixPosts", matrixPostsSchema);
export default MatrixPosts;