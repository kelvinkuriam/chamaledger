const { appError } = require("./errors");


function parseOrThrow(schema,input){
const result = schema.safeParse(input)


if(!result.success){
    throw appError(
        400,
        'VALIDATION_ERROR',
        'The request is not valid',


        result.error.issues.map((issue)=>({
            field:issue.path.join('.') || "(body)",
            message: issue.message,
        }))
    )
}

return result.data;
}

module.exports = { parseOrThrow }