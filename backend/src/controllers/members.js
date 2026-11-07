const { createMemberSchema } = require('../schemas/members');

const members = require('../serrvices/members');


async function list(req,res){
    const allMembers = await members.listMembers();

    res.json(allMembers)
}

async function create(req,res){
    const parsed = createMemberSchema.safeParse(req.body)

    if(!parsed.success){
        throw appError(
            400,
            'VALIDATION_ERROR',
            'The request body is not valid.',
            parsed.error.issues.map((issue)=>({
                field:issue.path.join('.')|| '(body)',
                message:issue.message
            }))
        )
    }

const newMember = await members.createMember(parsed.data);

    res.status(201).json(newMember)


}

module.exports = { list ,create}


