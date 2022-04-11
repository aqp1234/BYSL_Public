const mongoose = require('mongoose');

const { Schema } = mongoose;
const dashboardSchema = new Schema({
    workspace_id: {
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
    user_color: {
        type: String,
        required: true,
    },
    manager_id: {
        type: Number,
        required: true,
    },
    manager_name: {
        type: String,
        required: true,
    },
    manager_color: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true,
    },
    flag: {
        type: Number,
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

module.exports = mongoose.model('Dashboard', dashboardSchema);