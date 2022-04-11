const mongoose = require('mongoose');

const { Schema } = mongoose;
const inviteSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    key: {
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
    workspace_id: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60*60*24*3, // 3일후에 DB 자동 삭제 60*60*24*3 (백그라운드에서 1분마다 체크해서 자동으로 삭제해주는듯)
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

inviteSchema.index({ createdAt: 1 }, { expireAfterSeconds: 259200, background: true });

module.exports = mongoose.model('Invite', inviteSchema);