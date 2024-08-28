import mongoose, { models, Schema } from "mongoose";

const messageSchema = new Schema({
    senderId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    chatId: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
}, { timestamps: true });

const chatSchema = new Schema({
    participants: {
        type: Array, // Array of two user IDs
        required: true
    },
    message: [messageSchema],
}, { timestamps: true });

const Chat = models.Chat || mongoose.model("Chat", chatSchema);
export default Chat;