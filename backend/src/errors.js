function appError(status,code,message,details){
    const err = new Error(message);

    err.isAppError = true;
    err.status=status;
    err.code =   code;
    err.details = details;

return err;

}

module.exports = { appError }