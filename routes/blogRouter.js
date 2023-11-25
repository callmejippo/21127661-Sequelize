const express = require("express");
const router = express.Router();
const controller = require("../controllers/blogController");

router.get("/", controller.showList);
router.get("/search", controller.showSearchResult);
router.get("/:id", controller.showDetails);
router.get("/category/:id", controller.showCategory);
router.get("/tag/:id", controller.showTag);

module.exports = router;
