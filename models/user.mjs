import mongoose from "mongoose";
const { models, Schema } = mongoose;

const notificationSchema = new Schema({
    description: {
        type: String,
        default: ""
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    postId: {
        type: String,
        default: ""
    }
}, {timestamps: true});

const userSchema = new Schema({
    admin: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone_number: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    path: {
        type: String,
        required: true
    },
    post_counter: {
        type: Number,
        required: true
    },
    listing_counter: {
        type: Number,
        required: true
    },
    job_position: {
        type : String,
        default : ""
    },
    employment_agency: {
        type : String,
        default : ""
    },
    experience: {
        type : String,
        default : ""
    },
    education: {
        type : String,
        default : ""
    },
    skills: {
        type : String,
        default : ""
    },
    connections : {
        type: Array,
        default: []
    },
    connectionRequests : {
        type: Array,
        default: []
    },
    interactedWithPosts : {
        type: Array,
        default: []
    },
    publicInfo: {
        type: Array,
        default: []
    },
    chats: { // Array of chatIds
        type: Array,
        default: []
    },
    lastChatId: {
        type: String,
        default: ""
    },
    // likedPosts: {
    //     type: Array,
    //     default: []
    // },
    // commentedPosts: {
    //     type: Array,
    //     default: []
    // },
    likedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    commentedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    notifications: [notificationSchema]
}, {timestamps: true});

const User = models.User || mongoose.model("User", userSchema);
export default User;