const fs = require('fs');
const register = require('./Accounts/Register/Register');
const login = require('./Accounts/Login/Login');
const Upload = require('./Videos/Upload')
var formidable = require("formidable");
const video = require('./Videos/Video');
const thumbnil = require('./Videos/Thumbnil');
const comment = require('./Videos/Comment')

const validateinput = require('./Accounts/Register/ValidInput');

function route(app, rootdir, conn) {
    app.get('/', (req, res) => {
        req.session.video_ptr = 0;
        res.render(rootdir+"/Frontend/Home.ejs");
    });

    // for login and register

    app.post('/checkusername', async (req, res) => {
        if (await validateinput.checkUsername(req, res, conn)) {
            res.send(true);
        } else {
            res.send(false);
        }
    });

    app.post('/checkpassword', (req, res) => {
        if (validateinput.checkPassword(req, res))
            res.send(true);
        else
            res.send(false);
    });

    app.post('/checkemail', async (req, res) => {
        if (await validateinput.checkemail(req, res, conn)) {
            res.send(true);
        } else {
            res.send(false);
        }
    })

    app.post('/checkconformpassword', (req, res) => {
        if (validateinput.checkConformPassword(req, res))
            res.send(true);
        else
            res.send(false);
    });

    app.get('/register', (req, res) => {
        fs.createReadStream(rootdir + "/Frontend/Register.html").pipe(res);
    });

    app.post('/register', (req, res) => {
        register.Register(req, res, conn);
    });

    app.get('/login', (req, res) => {
        fs.createReadStream(rootdir + "/Frontend/Login.html").pipe(res);
    });

    app.post('/login', (req, res) => {
        login.Login(req, res, conn);
    });

    // library

    app.get('/library', (req, res) => {
        if (req.session.username)
            fs.createReadStream(rootdir + "/Frontend/Library.html").pipe(res);
        else
            res.redirect('/login');
    });



    // upload video

    app.get('/uploadbyfile', (req, res) => {
        if (req.session.username) {
            fs.createReadStream(rootdir + "/Frontend/UploadVideoByFile.html").pipe(res);
        } else {
            res.redirect('/login');
        }
    });

    app.get('/uploadbyyoutube', (req, res) => {
        if (req.session.username) {
            fs.createReadStream(rootdir + "/Frontend/UploadVideoByYoutube.html").pipe(res);
        } else {
            res.redirect('/login');
        }
    });

    // videos

    app.get('/video', async (req, res) => {
        if (req.query.id) {
            if (await video.type(req, res, conn) == 'ytube') {
                res.render(rootdir + "/Frontend/VideoOfYoutube.ejs", { videodata: await video.ytvideoDetail(req, res, conn) });
            } else if (await video.type(req, res, conn) != null) {
                await video.filevideodetail(req, res, conn, rootdir);
            } else
            fs.createReadStream(rootdir+"/Frontend/videonotfound.html").pipe(res);
        } else {
            fs.createReadStream(rootdir+"/Frontend/videonotfound.html").pipe(res);
        }
    });

    app.get('/videos', async (req, res) => {
        await video.streamvideo(req, res, conn, rootdir);
    });

    app.get('/Home.css', (req, res) => {
        fs.createReadStream(rootdir + "/Frontend/res/css/Home.css").pipe(res);
    });


    app.post('/uploadFile', (req, res) => {
        var form = new formidable.IncomingForm();
        Upload.uploadbyfile(req, res, rootdir, form, conn);
    });


    app.post('/uploadbyyoutube', (req, res) => {
        Upload.uploadbyyoutube(req, res, conn);
    });

    app.post('/getrandomvideoscontainer', async (req,res) => {
        res.contentType('json');
        await res.send(await video.getRandomVideosContainer(req,res,conn));
    });

    app.get('/thumbnil',async (req,res) => {
        fs.createReadStream(await thumbnil.sendthumbnil(req,res,conn,rootdir)).pipe(res);
    });

    app.post('/like', (req,res) => {
        if(req.session.username) {
            video.like(req,res,conn);
        } else {
            res.send("login");
        }
    });

    app.get('/search', async (req,res) => {
        if(!req.query.keyword) res.redirect('/');
        res.render(rootdir+"/Frontend/Search.ejs",{videosdata : JSON.stringify(await video.searchvideos(req,res,conn))});
    });


    app.post('/isliked', (req,res) => {
        if(req.session.username) {
            video.liked(req,res,conn);
        } else {
            res.send(false);
        }
    });

    app.get('/likedvideos', async (req,res) => {
        if(req.session.username) {
            res.render(rootdir+"/Frontend/VideosList.ejs",{videosdata : await video.likedvideos(req,res,conn)});
        } else {
            res.redirect('/login');
        }
    })

    app.post('/save',(req,res) => {
        video.save(req,res,conn);
    });

    app.post('/issaved',(req,res) => {
        video.saved(req,res,conn);
    });

    app.get('/savedvideos', async(req,res) => {
        if(req.session.username) {
            res.render(rootdir+"/Frontend/VideosList.ejs",{videosdata : await video.savedvideos(req,res,conn)});
        } else {
            res.redirect('/login');
        }
    });

  
    app.get('/uservideos', async(req,res) => {
        if(req.session.username) {
            res.render(rootdir+"/Frontend/UserVideos.ejs",{videosdata : await video.uservideos(req,res,conn)});
        } else {
            res.redirect('/login');
        }
    })

    app.post('/comment', (req,res) => {
        if(req.session.username) {
            comment.comment(req,res,conn);
        } else {
            res.send(false);
        }
    });

    app.post('/videocomments', async (req,res)=> {
        await comment.getcomments(req,res,conn);
    });

    app.get('/edit', async (req,res) => {
        if(req.session.username) {
            res.render(rootdir+"/Frontend/EditVideoDetail.ejs",{videodetail : JSON.stringify(await video.getvideodetail(req,res,conn))});
        } else {
            res.redirect('/login');
        }
    });

    app.post('/edit',(req,res)=>{
        video.editvideos(req,res,conn);
        res.send(true);
    });

    app.post('/loggedin',(req,res)=>{
        if(req.session.username)
            res.send(true);
        else 
            res.send(false);
    });

    app.post('/report',(req,res) => {
        video.reportvideos(req,res,conn);
    });

    app.post('/deletevideo', (req,res) => {
        video.deletevideos(req,res,conn,rootdir);
    });

    app.get('/logout',(req,res)=> {
        req.session.username = null;
        res.redirect('/');
    })
}

module.exports = { route };