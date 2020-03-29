const canvasAPIRequest=(req, res, next) =>{
    console.log(req['query'])
    next()
}

module.exports = {canvasAPIRequest}