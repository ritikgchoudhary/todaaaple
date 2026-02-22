import mongoose from 'mongoose';

const ExtraScheme = mongoose.Schema({
    id: {
        type: Number,
    },
    mines:{
        type: Object,
    },
    fastParity:{
        type: Object,
    },
    wingo:{
        type: Object,
    },
    aviator: {
        type: Object,
    },
    gateway: {
        type: String,
    },
    gatewayOut: {
        type: String,
    },
    upi: {
        type: Object
    },
    cricket: {
        type: Object

    },
    notice: {
        type: Object
    },
    ip: {
        type: Array
    },
    rechargeEnabled: {
        type: Boolean,
        default: true
    },
    gatewayOrder: {
        type: Array,
        default: ["auto", "manual", "card", "lgpay", "watchpay", "rupeerush"]
    },
    gatewayEnabled: {
        type: Object,
        default: () => ({ auto: true, manual: true, card: true, lgpay: true, watchpay: true, rupeerush: true })
    },
    carouselImages: {
        type: [String],
        default: []
    },
    siteLogoUrl: {
        type: String,
        default: ""
    },
    apkDownloadUrl: {
        type: String,
        default: ""
    }
});

export default mongoose.model('Extra', ExtraScheme);
