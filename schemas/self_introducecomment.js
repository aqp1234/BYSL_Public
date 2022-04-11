const mongoose = require('mongoose');

const { Schema } = mongoose;
const self_introduceCommentSchema = new Schema({
    solo_workspace_id: {
        type: Number,
        required: true,
    },
    selfcomment_id: {
        type: mongoose.Types.ObjectId,
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
    comment: {
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

module.exports = mongoose.model('SelfintroduceComment', self_introduceCommentSchema);