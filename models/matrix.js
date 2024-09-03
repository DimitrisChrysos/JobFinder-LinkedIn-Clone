import mongoose, { models, Schema } from "mongoose";

const matrixSchema = new Schema({
    data: {
        type: Array,
        required: true,
    }
}, { timestamps: true });

const Matrix = models.Matrix || mongoose.model("Matrix", matrixSchema);
export default Matrix;