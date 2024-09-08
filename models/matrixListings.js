import mongoose, { models, Schema } from "mongoose";

const matrixListingsSchema = new Schema({
    data: {
        type: Array,
        required: true,
    }
}, { timestamps: true });

const MatrixListings = models.MatrixListings || mongoose.model("MatrixListings", matrixListingsSchema);
export default MatrixListings;