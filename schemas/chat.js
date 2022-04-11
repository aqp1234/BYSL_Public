const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId }} = Schema;
const chatSchema = new Schema({
    room: {
        type: ObjectId,
        required: true,
        ref: 'Chatroom',
    },
    user_id: {
        type: Number,
        required: true,
    },
    user_name: {
        type: String,
        required: true,
    },
    user_color: {
        type: String,
        required: true,
    },
    chat: {
        type: String,
    },
    file: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Chat', chatSchema);