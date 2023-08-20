const mongoose = require("mongoose");

const unitSchema = mongoose.Schema({
  contractNo: { type: String, required: true },
  unitNo: { type: String, required: true },
  bName: { type: String },
  bAdd: { type: String },
  cbName: { type: String },
  unitName: { type: String, required: true },
  model: { type: String, required: true },
  machine: { type: String },
  installationYear: { type: Number, required: true },
  visor: { type: String, required: true },
  route: { type: String, required: true },
  customerName: { type: String },
  customerAdd: { type: String },
  customerfax: {type: String},
  customerMainContact: {type:String},
  customerMainContactTel: {type:String},
  customerMainContactEmail: {type: String},
  customerSecondContact: {type:String},
  customerSecondContactTel:{type: String},
  customerSecondContactEmail: {type: String},
  customerRemarks:{type: String},
  speed: { type: Number },
  travel: { type: Number },
  load: { type: String },
  stops: { type: Number },
  openings: { type: Number },
  ropeRatio: { type: String },
  inclination: { type: Number },
  stepWidth: { type: Number },
  overheadRunByCar: { type: Number },
  overheadRunByCwt: { type: Number },
  bufferRunByCar: { type: Number },
  pitDepth: { type: Number },
  brake: { type: String },
  carBuffer: { type: String },
  carDoorLock: { type: String },
  controller: { type: String },
  doorLocks: { type: String },
  doorOperator: { type: String },
  doorSafety: { type: String },
  doorSystem: { type: String },
  governorCar: { type: String },
  governorCwt: { type: String },
  safetyTypeCar: { type: String },
  selector: { type: String },
  motorPower: { type: String },
  governorRopeDiameter: { type: String },
  hoistingRopeDiameter: { type: String },
  governorRopeLength: { type: Number },
  hoistingRopeLength: { type: Number },
  hoistingRopeQuantity: { type: Number },
});

const unitModel = mongoose.model("Unit", unitSchema);

module.exports = unitModel;
