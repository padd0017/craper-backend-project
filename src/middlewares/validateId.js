const { isValidObjectId } = require("mongoose");

const { BadRequestError } = require("../utils/error");
const debug = require("debug")("app:validId");
const validateId = (req, _res, next) => {
  debug("running")
  if (!isValidObjectId(req.params.id)) {
    throw new BadRequestError("Invalid id");
  }
  next();
};

module.exports = validateId;
