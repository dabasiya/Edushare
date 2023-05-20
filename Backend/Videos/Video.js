const fs = require('fs');
const util = require('util');
const formdb = undefined;

async function ytvideoDetail(req, res, conn) {
    const query = util.promisify(conn.query).bind(conn);

    strquery = "select * from videos where id = ?";
    result = await query(strquery, [req.query.id]);

    result1 = await query("select link from youtube_videos where video_id = ?", [req.query.id]);

    result2 = await query("select username from accounts where id = ?", [result[0].uploader_id]);

    result[0].link = result1[0].link;
    result[0].uploader = result2[0].username;

    await query("update videos set video_views = (select video_views from videos where id = ?)+1 where id = ?", [req.query.id, req.query.id]);

    var data = JSON.stringify(result);
    return data;
}

async function filevideodetail(req, res, conn, rootdir) {
    
    const query = util.promisify(conn.query).bind(conn);
    result = await query("select videos.*, accounts.username as uploader from videos,accounts where videos.id = ? and accounts.id = videos.uploader_id",[req.query.id]);
    
    await conn.query("update videos set video_views = video_views+1");

    await res.render(rootdir+"/Frontend/Video.ejs",{videodata : JSON.stringify(result)});

    // await conn.query("select * from videos where id = ?",[req.query.id],(err,result) => {
    //     conn.query("select username from accounts where id = ?", [result[0].uploader_id], async (err,result1)=> {
    //         result[0].uploader = result1[0].username;
    //         conn.query("update videos set video_views = (select video_views from videos where id = ?)+1 where id = ?", [req.query.id, req.query.id]);
    //         res.render(rootdir+"/Frontend/Video.ejs",{videodata : JSON.stringify(result)});
    //     });
    // })
}

async function type(req, res, conn) {
    const query = util.promisify(conn.query).bind(conn);

    strquery = "select video_type from videos where id = ?";
    result = await query(strquery, [req.query.id]);

    if (result[0] != null)
        return result[0].video_type;
    else
        return null;
}

async function streamvideo(req, res, conn, rootdir) {

    await conn.query("select video_type from videos where id = ?", [req.query.id], (err, result) => {
        if (err) throw err;

        try {
            const range = req.headers.range;
            if (!range) {
                res.status(400).send("Requires Range header");
            }
            const videoPath = `${rootdir}/Backend/Data/Videos/${req.query.id}.${result[0].video_type}`;
            const videoSize = fs.statSync(videoPath).size;
            const CHUNK_SIZE = 10 ** 6;
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
            const contentLength = end - start + 1;
            const headers = {
                "Content-Range": `bytes ${start}-${end}/${videoSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": "video/" + result[0].video_type,
            };
            res.writeHead(206, headers);
            const videoStream = fs.createReadStream(videoPath, { start, end });
            videoStream.pipe(res);
        } catch(err) {
            console.log(err);
            res.redirect('/videos?id='+req.query.id);
        }
    });
}

async function getRandomVideosContainer(req, res, conn) {
    const query = await util.promisify(conn.query).bind(conn);

    result = await query("select videos.*, get_video_link_or_type(videos.id,videos.video_type) as link_thumbnil, accounts.username from videos,accounts where accounts.id = videos.uploader_id and videos.id > ? order by videos.id limit 4",[req.session.video_ptr]);
    if(result[result.length-1]) {
        req.session.video_ptr = (result[result.length-1].id);
    }
    result = await JSON.stringify(result);

    return await result;
}

async function like(req, res, conn) {
    const query = util.promisify(conn.query).bind(conn);

    var data = await query("select id from accounts where username = ?", [req.session.username]);

    var data2 = await query("select * from liked_videos where account_id = ? and video_id = ?", [data[0].id, req.body.id]);

    class likedetail {
        count = 0;
        liked = false;
    };

    if (data2[0] == null) {
        senddata = new likedetail();
        await query("insert into liked_videos values(?,?)", [data[0].id, req.body.id]);
        data = await query("update videos set likes = (select likes from videos where id = ?)+1 where id = ?", [req.body.id, req.body.id]);
        data = await query("select likes from videos where id = ?", [req.body.id]);
        senddata.count = data[0].likes;
        senddata.liked = true;
        res.send(senddata);
    } else {
        senddata = new likedetail();
        await query("delete from liked_videos where account_id = ? and video_id = ?", [data[0].id, req.body.id]);
        await query("update videos set likes = (select likes from videos where id = ?)-1 where id = ?", [req.body.id, req.body.id]);
        data = await query("select likes from videos where id = ?", [req.body.id]);
        senddata.count = data[0].likes;
        senddata.liked = false;
        res.send(senddata);
    }
}

async function liked(req, res, conn) {
    const query = util.promisify(conn.query).bind(conn);

    id = await query("select id from accounts where username = ?", [req.session.username]);

    data = await query("select * from liked_videos where account_id = ? and video_id = ?", [id[0].id, req.body.id]);

    if (data[0] != null) {
        res.send(true);
    } else {
        res.send(false);
    }
}

async function save(req, res, conn) {
    const query = util.promisify(conn.query).bind(conn);
    if (req.session.username) {
        id = await query("select id from accounts where username = ?", [req.session.username]);
        data = await query("select * from saved_videos where account_id = ? and video_id = ?", [id[0].id, req.body.id]);
        if (data[0] != null) {
            await query("delete from saved_videos where account_id = ? and video_id = ?", [id[0].id, req.body.id]);
            res.send(false);
        } else {
            await query("insert into saved_videos values(?,?)", [id[0].id, req.body.id]);
            res.send(true);
        }
    } else {
        res.send("login");
    }
}

async function saved(req, res, conn) {
    const query = util.promisify(conn.query).bind(conn);

    if (req.session.username) {
        id = await query("select id from accounts where username = ?", [req.session.username]);

        data = await query("select * from saved_videos where account_id = ? and video_id = ?", [id[0].id, req.body.id]);

        if (data[0] != null) {
            res.send(true);
        } else {
            res.send(false);
        }
    } else {
        res.send(false);
    }
}

async function likedvideos(req, res, conn) {
    const query = util.promisify(conn.query).bind(conn);

    result = await query("select videos.*, accounts.username as uploader, get_video_link_or_type(videos.id,videos.video_type) as link_thumbnil from videos, liked_videos,accounts where liked_videos.account_id = (select accounts.id from accounts where accounts.username = ?) and videos.id = liked_videos.video_id and accounts.id = liked_videos.account_id",[req.session.username]);

    if (result[0] != null) {
        return JSON.stringify(result);
    } else {
        return false;
    }
}

async function savedvideos(req, res, conn) {
    const query = util.promisify(conn.query).bind(conn);

    result = await query("select videos.*, accounts.username as uploader,get_video_link_or_type(videos.id,videos.video_type) as link_thumbnil from accounts,videos,saved_videos where accounts.id = videos.uploader_id and videos.id = saved_videos.video_id and saved_videos.account_id = (select id from accounts where username = ?)",[req.session.username]);
    return JSON.stringify(result);
}

async function uservideos(req, res, conn) {
    const query = util.promisify(conn.query).bind(conn);

    result = await query("select * from videos where uploader_id = (select id from accounts where username = ?)", [req.session.username]);
    index = 0;
    while (result[index] != null) {
        if (result[index].video_type == 'ytube') {
            link = await query("select link from youtube_videos where video_id = ?", [result[index].id]);
            result[index].link =  link[0].link;
        } else {
            data = await query("select type as thumbnil_type from thumbnil where id = ?",[result[index].id]);
            result[index].thumbnil_type = data[0].thumbnil_type;
        }
        result[index].uploader = req.session.username;
        index++;
    }

    if (result[0] != null) {
        return JSON.stringify(result);
    } else {
        return false;
    }
}

async function getvideodetail(req,res,conn) {
    const query = util.promisify(conn.query).bind(conn);

    check = await query("select videos.id from videos where videos.id = ? and videos.uploader_id = (select id from accounts where username = ?)",[req.query.id,req.session.username]);
    if(check[0]==null) {
        res.redirect('/likedvideos');
    }

    data = await query("select videos.title, tags.tags, videos.id from videos,tags where videos.id = ? and tags.video_id = ?",[req.query.id,req.query.id]);

    return data;
}

async function searchvideos(req,res,conn) {
    const query = util.promisify(conn.query).bind(conn);

    searchkeyword = req.query.keyword;
    searchkeyword = searchkeyword.replace(new RegExp(" ","g"),'%\' or tags.tags like \'%');

    result = await query("select videos.*, accounts.username as uploader, get_video_link_or_type(videos.id,videos.video_type) as link_thumbnil from videos,accounts,tags where videos.id = tags.video_id and accounts.id = videos.uploader_id and (tags.tags like '%"+searchkeyword+"%')");
    return result;
}

async function editvideos(req,res,conn) {
    const query = util.promisify(conn.query).bind(conn);
    await query("update videos set title = ? where id = ?",[req.body.title,req.body.videoid]);
    await query("update tags set tags = ? where video_id = ?",[req.body.tags,req.body.videoid]);
}


async function reportvideos(req,res,conn) {
    const query = util.promisify(conn.query).bind(conn);

    result = await query("select * from reported_videos where video_id = ?",[req.body.id]);

    if(req.session.username) {
        if(result[0]) {
            await query("update reported_videos set count = count+1 where video_id = ?",[req.body.id]);
        } else {
            await query("insert into reported_videos values(?,1)",[req.body.id]);
        }
        res.send(true);
    }
    else {
        res.send(false);
    }
}


async function deletevideos(req,res,conn,rootdir) {
    const query = util.promisify(conn.query).bind(conn);
    result = await query("select * from videos where id = ? and uploader_id = (select id from accounts where username = ?)",[req.body.videoid,req.session.username]);
    if(result[0].video_type != 'ytube') {
        type = await query("select video_type from videos where id = ?",[req.body.videoid]);
        fs.unlinkSync(rootdir+"/Backend/Data/Videos/"+req.body.videoid+"."+result[0].video_type);
        ttype = await query("select type from thumbnil where id = ?",[req.body.videoid]);
        fs.unlinkSync(rootdir+"/Backend/Data/Thumbnils/"+req.body.videoid+"."+ttype[0].type);
    }
    if(result[0]) {
        await query("delete from videos where id = ?",[req.body.videoid]);
    }
    res.send(true);
}

module.exports = { ytvideoDetail, deletevideos, reportvideos, editvideos, searchvideos, type, filevideodetail, streamvideo, getRandomVideosContainer, uservideos, like, liked, save, saved, likedvideos, savedvideos, getvideodetail }