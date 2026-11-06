const { z } = require('zod');

const createMemberSchema = z.object({
name:z.string({error:'name is required and must be text'})
     .trim()
     .min(1,'name must not be empty')
     .max(100,'name must be at most 100 characters'),
phone:z
      .string({error:'Number required'})
      .trim()
      .regex(/^\+254[17]\d{8}$/,'Invalid phone number. Must start with +254 and be followed by 9 digits')



});

module.exports={ createMemberSchema}