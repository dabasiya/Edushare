function Login(req,res,conn) {
    username = req.body.username;
    password = req.body.password;


    strquery = "select * from accounts where username = ? and password = sha1(?)";
    conn.query(strquery,[username,password],(err,result) => {
        if(err) throw err;
        if(result[0] != null) {
            req.session.username = username;
            res.send(true);
        } else {
            res.send(false);
        }
    })
}

module.exports = {Login}