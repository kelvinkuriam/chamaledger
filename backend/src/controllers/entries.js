const { createEntrySchema ,listEntriesQuerySchema}= require('../schemas/entries');

const {parseOrThrow} = require('../validate');

const entries = require('../db/entries');

async function create(req,res){
const data = parseOrThrow(createEntrySchema,req.body);

const entry = await entries.createEntries(data);

res.status(201).json(entry);
}


async function list(req,res){
    const query = parseOrThrow(listEntriesQuerySchema,req.query);

    res.json(await entries.listEntries(query));
}

module.exports = {create, list}