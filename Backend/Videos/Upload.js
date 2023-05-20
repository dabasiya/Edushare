const util = require('util');
const fs = require('fs');

async function uploadbyfile(req,res,rootdir,form,conn) {

    date = new Date(Date.now());

    day = date.getDate();
    month = date.getMonth() + 1;
    year = date.getFullYear();

    full_date = year + "-" + month + "-" + day;

    const query = util.promisify(conn.query).bind(conn);

    form.parse(req, async function(err, fields, files){

        title = fields.title;
        tags = fields.tags;

        var type = files['video'].mimetype;
        type = type.replace("video/","");

        uid = await query("select id from accounts where username = '" + req.session.username + "'");
        strquery = "insert into videos(title,video_views,likes,upload_date,uploader_id,video_type) values ('" + title + "'," + 0 + "," + 0 + ",'" + full_date + "'," + uid[0].id + ",'" + type + "')"; 
        result = await query(strquery);

        await query("insert into tags values(" + result.insertId + ",'" + tags + "')");

        var old = files['video'].filepath;
        var upd = rootdir + "/Backend/Data/Videos/" + result.insertId + "." + type;
        fs.rename(old,upd,function(err) {
            if(err) throw err;
        });


        type = files['thumbnil'].mimetype;
        type = type.replace("image/","");

        thumbnil_query = "insert into thumbnil values(" + result.insertId + ",'" + type + "')";
        await query(thumbnil_query);

        var old = files['thumbnil'].filepath;
        var upd = rootdir + "/Backend/Data/Thumbnils/" + result.insertId + "." + type;
        fs.rename(old, upd, function(err) {
            if(err) throw err;
        });
        
        res.end();
    });
}

async function uploadbyyoutube(req,res,conn) {
    username = req.session.username;
    link = req.body.link;
    title = req.body.title;
    tags = req.body.tags;

    link = link.replace("https://", "");
    link = link.replace("www.youtube.com/watch?v=","");

    date = new Date(Date.now());

    day = date.getDate();
    month = date.getMonth() + 1;
    year = date.getFullYear();

    full_date = year + "-" + month + "-" + day;

    const query = util.promisify(conn.query).bind(conn);

    uid = await query("select id from accounts where username = '" + req.session.username + "'");
    strquery = "insert into videos(title,video_views,likes,upload_date,uploader_id,video_type) values ('" + title + "'," + 0 + "," + 0 + ",'" + full_date + "'," + uid[0].id + ",'ytube');"; 
    
    result = await query(strquery);

    await query("insert into tags values(" + result.insertId + ",'" + tags + "')");
    await query("insert into youtube_videos values(" + result.insertId + ",'" + link + "')");
    res.redirect('/uploadbyyoutube');
}

module.exports = { uploadbyfile, uploadbyyoutube };