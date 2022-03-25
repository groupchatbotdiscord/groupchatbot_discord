const mongoose = require("mongoose")

const User = new mongoose.Schema({
    id: {
        type: mongoose.SchemaTypes.String,
        unique: true
    },
    settings_passiveMode: {
        type: mongoose.SchemaTypes.Boolean,
        default: false
    },
    settings_showUsernameOnGlobalLeaderboard: {
        type: mongoose.SchemaTypes.Boolean,
        default: false
    },

    currency_wallet: {
        type: mongoose.SchemaTypes.Number,
        default: 0
    },
    currency_bank: {
        type: mongoose.SchemaTypes.Number,
        default: 0
    },
    currency_bankLimit: {
        type: mongoose.SchemaTypes.Number,
        default: 5000
    },
    currency_logs: {
        type: mongoose.SchemaTypes.Array,
        default: []
    },
    currency_inventory: {
        padlock: {
            type: mongoose.SchemaTypes.Number,
            default: 0
        },
        invisibilityPotion: {
            type: mongoose.SchemaTypes.Number,
            default: 0
        }
    },
    currency_commandUsageCount: {
        type: mongoose.SchemaTypes.Number,
        default: 0
    },
    currency_activeItems: {
        type: mongoose.SchemaTypes.Mixed,

        padlock: mongoose.SchemaTypes.Number,
        invisibilityPotion: mongoose.SchemaTypes.Number,

        default: {}
    },

    afk_reason: mongoose.SchemaTypes.String,
    afk_since: mongoose.SchemaTypes.Number,

    currency_policeCaught: mongoose.SchemaTypes.String,
    currency_prison: mongoose.SchemaTypes.Number,
    currency_prisonUrl: mongoose.SchemaTypes.String
})

module.exports = mongoose.model("User", User)