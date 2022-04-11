const mongoose = require('mongoose');

const { Schema } = mongoose;
const chatroomSchema = new Schema({
    workspace_id: {
        type: Number,
        required: true,
    },
    roomname: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Chatroom', chatroomSchema);