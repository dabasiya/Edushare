const validateinput = require('./ValidInput');

function Register(req,res,conn) {
    username = req.body.username;
    password = req.body.password;
    email = req.body.email;

    if (validateinput.checkUsername(req, res, conn) && validateinput.checkemail(req,res,conn) && validateinput.checkPassword(req, res) && validateinput.checkConformPassword(req, res) && email.includes("@gmail.com")) {
        strquery = "insert into accounts(username,password,email) values(?,sha1(?),?)";
        conn.query(strquery,[username,password,email]);
        res.send(true);
    } else {
        res.send(false);
    }
}

module.exports = { Register }