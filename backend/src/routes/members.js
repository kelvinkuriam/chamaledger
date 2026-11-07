const express = require('express');

const members = require('../controllers/members');


const router = express.Router();

router.get('/',members.list)

router.post('/',members.create);


module.exports = router;