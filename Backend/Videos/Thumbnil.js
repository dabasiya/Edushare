const fs = require('fs');
const util = require('util');

async function sendthumbnil(req, res, conn, rootdir) {
    return `${rootdir}/Backend/Data/Thumbnils/${req.query.id}`;
}

module.exports = { sendthumbnil };