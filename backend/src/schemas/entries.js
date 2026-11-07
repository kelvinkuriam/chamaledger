const { z } =  require ('zod');

const entryDate = z.iso.date({
error:"entry_date is required and must be a valid date in the format YYYY-MM-DD"
});

const note = z
             .string({error:'note must be text'})
             .trim()
             .max(200,'note must be at most 200 characters')
             .optional();


const amountCents = z
                    .number({error:'amount_cents is required and must be a number'})
                    .int('amount_cents must be a whole number of cents')   
                    .positive('amount_cents must be above zero') 
                    .max(1_000_000_000,'amount_cents must be at most 1 billion cents');
                    
                    
const id = (name) =>z
.number({error:`${name} is required and must be a number`})
.int(name + 'must be a whole number')
.positive(name + 'must be above zero');


const plainEntry = z.object({
    type:z.enum(['CONTRIBUTION','PAYOUT',FINE]),
    member_id:id('member_id'),
    amount_cents:amountCents,
    entry_date:entryDate,
    note,

});



const reversalEntry = z.object({
    type:z.literal('REVERSAL'),
    reverses_e:ntry_id:id(reverses_entry_id)
    entry_date:entryDate,
    note,
})


const  createEntrySchema = z.discriminatedUnion(
    'type',
    [plainEntry,reversalEntry],
    {error: 'type must be CONTRIBUTION, PAYOUT, FINE, or REVERSAL'}
)

module.exports = {createEntrySchema}