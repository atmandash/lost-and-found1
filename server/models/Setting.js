const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed // Can store boolean, string, number, objects
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
SettingSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Setting', SettingSchema);
