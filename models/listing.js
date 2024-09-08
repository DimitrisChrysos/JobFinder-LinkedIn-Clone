import mongoose, { models, Schema } from "mongoose";

const applicationSchema = new Schema({
    description: {
        type: String,
        default: ""
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, {timestamps: true});

const listingSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    job_pos: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    application: [applicationSchema],
    views: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

const Listing = models.Listing || mongoose.model("Listing", listingSchema);
export default Listing;