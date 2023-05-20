const express = require('express');
const app = express();
const router = require('./Backend/PageRoute');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'edushare'
});

conn.connect();

app.set('view engine' , 'ejs');
app.use(bodyparser.urlencoded({ extended: false }));
app.use(session({ secret: 'username', resave: false, saveUninitialized: false}));
app.use(express.json());

router.route(app,__dirname,conn);

app.listen(3000);