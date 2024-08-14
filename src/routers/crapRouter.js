const {Router} = require("express");

const crapController = require("../controllers/crapController");
const validateId = require("../middlewares/validateId");
const isAuthenticated = require("../middlewares/isAuthenticated");
const attachImages = require("../middlewares/attachImage");
const sanitizedBody = require("../middlewares/sanitizedBody");
const debug = require("debug")("app:router");

const crapRouter = Router()


crapRouter.use(isAuthenticated);

crapRouter.post("/", 
attachImages, sanitizedBody, crapController.create)
crapRouter.post("/:id/interested", validateId, crapController.interested)
crapRouter.post("/:id/suggest", validateId, crapController.suggest);
crapRouter.post("/:id/agree", validateId, crapController.agree);
crapRouter.post("/:id/disagree", validateId, crapController.disagree);
crapRouter.post("/:id/reset", validateId, crapController.reset);
crapRouter.post("/:id/flush", validateId, crapController.flushed);

// getAll
crapRouter.get("/", crapController.getAll)
crapRouter.get("/mine", crapController.getMine)

crapRouter.get("/:id", validateId, crapController.getOne)
crapRouter.put("/:id", attachImages, validateId, crapController.replace)
crapRouter.patch("/:id", attachImages, validateId, crapController.update)
crapRouter.delete("/:id", validateId, crapController.deleteOne)


module.exports = crapRouter