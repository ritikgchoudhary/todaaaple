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
    withdrawalsEnabled: {
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
    platformMessageUrl: {
        type: String,
        default: ""
    },
    platformMessageEnabled: {
        type: Boolean,
        default: false
    },
    apkDownloadUrl: {
        type: String,
        default: ""
    },
    telegramLink: {
        type: String,
        default: ""
    },
    customerServiceLink: {
        type: String,
        default: ""
    },
    whatsappLink: {
        type: String,
        default: ""
    },
    // Home page category sections – admin: add/delete/reorder games per category
    homeCategorySports: { type: Array, default: [] },
    homeCategoryCasino: { type: Array, default: [] },
    homeCategoryCrash: { type: Array, default: [] },
    homeCategorySlot: { type: Array, default: [] },
    homeCategoryLottery: { type: Array, default: [] },
    homeCategoryCards: { type: Array, default: [] },
    slotProviders: { type: Array, default: [] },
    cardProviders: { type: Array, default: [] },
});

export default mongoose.model('Extra', ExtraScheme);
