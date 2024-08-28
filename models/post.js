import mongoose, { models, Schema } from "mongoose";

const commentSchema = new Schema({
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

const postSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    like: {
        type: Array,
        default: []
    },
    comment: [commentSchema]
}, {timestamps: true});

const Post = models.Post || mongoose.model("Post", postSchema);
export default Post;