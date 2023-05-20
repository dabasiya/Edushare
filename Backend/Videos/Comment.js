const util = require('util')
function comment(req,res,conn) {
    conn.query("select id from accounts where username = ?",[req.session.username],(err,result)=>{
        if(err) throw err;
        conn.query("insert into comments values(?,?,?)",[result[0].id,req.body.id,req.body.comment]);
    });
    res.send({username : req.session.username});
}

async function getcomments(req,res,conn) {
    const query = util.promisify(conn.query).bind(conn);
    result = await query("select accounts.username, comments.comment from comments, accounts where comments.video_id = ? and accounts.id = comments.account_id",[req.body.id]);
    res.send(result);
}

module.exports = {comment,getcomments}