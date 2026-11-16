const { z } = require('zod');

const entryDate = z.iso.date({
    error:'Invalid date format. Please use ISO 8601 format (YYYY-MM-DD).'
})


const note = z .string({error:'Note must be a text.'})
            .trim()
            .max(200,'Note must be at most 200 characters long.')
            .optional();

const amountCents = z.number({error:'Amount must be a number.'})
.int('Amount must be a whole number of cents.')
.positive('Amount must be above zero')
.max(1_000_000_000,'Amount must be below 1 billion cents (10 million shillings).');


const id = (name) => z.number({error:`${name} must be a number.`})
.int(`${name} must be a whole number.`)
.positive(`${name} must be above zero.`)



const plainEntry = z.object({
type: z.enum(["CONTRIBUTION","PAYOUT","FINE"]),
member_id:id('member_id'),
amount_cents:amountCents,
entry_date:entryDate,
note,



});


const reversalEntry = z.object({
type:z.literal("REVERSAL"),
reverses_entry_id:id('reverses_entry_id'),
entry_date:entryDate,

note,

})


const createEntrySchema = z.discriminatedUnion(
    'type',
    [plainEntry,reversalEntry],
    {error: 'Invalid entry type.' }
)

module.exports =    { createEntrySchema }