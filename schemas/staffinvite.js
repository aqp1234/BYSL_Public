const mongoose = require('mongoose');

const { Schema } = mongoose;
const staffinviteSchema = new Schema({
    url: {
        type: String,
        required: true,
    },
    type: {
        type: String,
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
    staff_id: {
        type: Number,
    },
    staff_name: {
        type: String,
    },
    staff_email: {
        type: String,
        required: true,
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

module.exports = mongoose.model('StaffInvite', staffinviteSchema);