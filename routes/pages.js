const express = require("express");

const router = express.Router();


router.get('/', (req,res)=>{
    res.render('login');
});

router.get('/register', (req,res)=>{
    res.render('register');
});

router.get('/login', (req,res)=>{
    res.render('login');
});

router.get('/password',(req,res)=>{
    res.render('password');
});

router.get('/index',(req,res)=>{
    res.render('index');
});

router.get('/details',(req,res)=>{
    res.render('acc_details');
});

router.get('/history',(req,res)=>{
    res.render('acc_history');
});

router.get('/locations',(req,res)=>{
    res.render('rent');
});


router.get('/rent',(req,res)=>{
    const displayNone ="display:none;";
    const displayBlock="display:block;";
    res.render('rent',{
        locations:displayBlock,
        vehicles:displayNone,
        tripProgress:displayNone,
        tripFinal:displayNone,
        pay:displayNone,
        pdf:displayNone

    });
});



module.exports = router;