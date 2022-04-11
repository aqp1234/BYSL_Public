const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types: { ObjectId }} = Schema;

const sharecommentSchema = new Schema({
    share_id: {
        type: ObjectId,
        required: true,
        ref: 'Share',
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
    file: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Sharecomment', sharecommentSchema);