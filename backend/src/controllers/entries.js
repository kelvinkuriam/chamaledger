const { createEntrySchema }= require('../schemas/entries');

const {parseOrThrow} = require('../validate');

const entries = require('../db/entries');

async function create(req,res){
const data = parseOrThrow(createEntrySchema,req.body);

const entry = await entries.createEntries(data);

res.status(201).json(entry);
}

module.exports = {create}