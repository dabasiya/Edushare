const util = require('util');

async function checkUsername(req,res,conn) {
    const username = req.body.username;
    strquery = "select * from accounts where username = ?";
    const query = util.promisify(conn.query).bind(conn);
    data = await query(strquery,[username]);
    if(data[0] == null) {
        return true;
    } else {
        return false;
    }
}

async function checkemail(req,res,conn) {
    const email = req.body.email;
    strquery = "select * from accounts where email = ?";
    const query = util.promisify(conn.query).bind(conn);
    data = await query(strquery,[email]);
    if(data[0] == null) {
        return true;
    } else {
        return false;
    }
}

function checkPassword(req,res) {
    const password = req.body.password;
    if(password.length < 8) {
        return false;
    } else if(password.length <= 20) {
        return true;
    } else {
        return false;
    }
}

function checkConformPassword(req,res) {
    if(req.body.password.length != 0 && req.body.conformpassword.length != 0) {
        if(req.body.password != req.body.conformpassword) {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

module.exports = {checkUsername, checkPassword, checkConformPassword, checkemail};