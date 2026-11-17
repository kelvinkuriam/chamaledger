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



const listEntriesQuerySchema = z.object({

member_id:z.coerce
         .number({error:'member_id must be a number.'})
         .int('member_id must be a whole number.')
         .positive('member_id must be above zero.')
         .optional(),
         type:z.enum(["CONTRIBUTION","PAYOUT","FINE","REVERSAL"],{error:'type must be one of: CONTRIBUTION, PAYOUT, FINE, REVERSAL'})
         .optional(),

         from:z.iso.date({error:'from must be a valid ISO 8601 date (YYYY-MM-DD).'})
            .optional(),
        to:z.iso.date({error:'to must be a valid ISO 8601 date (YYYY-MM-DD).'})
        .optional(),


        page:z.coerce
        .number({error:'page must be a number.'})
        .int('page must be a whole number.')
        .min(1,'page must be atleast 1.')
        .default(1),


        page_size: z.coerce.number({error:'page_size must be a number.'})
        .int('page_size must be a whole number.')
        .min(1,'page_size must be atleast 1.')
        .max(100,'page_size must be at most 100.')
        .default(20),
})


.refine((q)=> !q.from || !q.to || q.from <= q.to, {
    message:'from date must be before or equal to to date.',
path:['from'],
})












module.exports =    { createEntrySchema , listEntriesQuerySchema }