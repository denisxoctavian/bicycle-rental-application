const express = require('express');
const path = require("path");
const mysql = require("mysql");
const dotenv = require("dotenv");
const { resolveSoa } = require("dns");


dotenv.config({path:'./.env'})

const app = express();

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

db.connect((error)=>{
    if(error){
        console.log(error)
    }else{
        console.log("MYSQL Connected")
    }
});

const publicDirectory = path.join(__dirname,'./public')
app.use(express.static(publicDirectory))
app.set('views', path.join(__dirname, "views"));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.set('view engine', 'hbs');
app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));
app.listen(5050,()=>{
    console.log("Server started on Port 5050");
})