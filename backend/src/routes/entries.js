const express = require('express');
const entries = require('../controllers/entries');
const router = express.Router();

router.post('/',entries.create);

module.exports = router;

