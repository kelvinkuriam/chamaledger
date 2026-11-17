const express = require('express');
const entries = require('../controllers/entries');
const router = express.Router();
router.get('/',entries.list);
router.post('/',entries.create);

module.exports = router;

