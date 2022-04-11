const mongoose = require('mongoose');

const { Schema } = mongoose;
const studentbookSchema = new Schema({
    solo_workspace_id: {
        type: Number,
        required: true,
    },
    user_id: {
        type: Number,
        required: true,
    },
    user_name: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
    },
    content: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Studentbook', studentbookSchema);