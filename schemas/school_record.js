const mongoose = require('mongoose');

const { Schema } = mongoose;
const schoolRecordSchema = new Schema({
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
    subject: {
        type: String,
    },
    content: {
        type: String,
    },
    file_path: {
        type: Schema.Types.Mixed, // Mixed 로 바꿔야 될지 고민중 (파일이 여러개인 경우 Mixed 로 json 파일로 {'파일명': '파일url'} 식으로 해야될거같음)
    },
    file_name: {
        type: Schema.Types.Mixed,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('SchoolRecord', schoolRecordSchema);