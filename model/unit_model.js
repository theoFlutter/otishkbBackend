const mongoose = require('mongoose');

const unitSchema = mongoose.Schema({
    contractNo:{type: String, required: true},
    unitNo:{type: String, required: true},
    bName:{type: String},
    bAdd:{type: String},
    cbName:{type: String},
    unitName:{type: String, required: true},
    model:{type: String, required: true},
    machine:{type: String, required: true},
    installationYear:{type: Number, required: true},
    visor:{type: String, required: true},
    route:{type: String, required: true},
    customerName:{type: String},
    customerAdd:{type: String},
    speed:{type: Number, required: true},
    travel:{type: Number, required: true},
    load:{type: Number, required: true},
    stops:{type: Number, required: true},
    openings:{type: Number, required: true},
    ropeRatio:{type: String, required: true},
});

const unitModel = mongoose.model('Unit', unitSchema);

module.exports = unitModel;