const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jsPDF } = require("jspdf"); 

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

const displayNone ="display:none;";
const displayBlock="display:block;";
global.logged_email='default-email';
global.logged_name ='default-name';
global.logged_id ='default-id';
global.bike_id ='default-bike-id';
global.start_ride='default-date';
global.end_ride='default-date';
global.paid ='default-pay';
global.amount ="default-amount";
global.billing_address ="default-address";
global.rental_id = 0;
global.invoice_id = 0;


exports.register = (req, res) => {
   
    const { name, email, password, passwordconfirm} = req.body;

    db.query('SELECT email FROM customers WHERE email = ?',[email], async (error, results)=>{
        if(error){
            console.log(error);
        }

        if(results.length>0){
            return res.render('register',{
                message:'The email is already in use'
            })
        }else if(password != passwordconfirm){
            return res.render('register',{
                message:"Passwords don't match!"
            })
        }
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                db.query('INSERT INTO customers SET ?', {name:name, email:email, password:hash}, async(error, results)=>{
                    if(error){
                        console.log(error);
                    } else{
                        return res.render('login');
                    }
                })
            });
          });
    });
};

exports.login = (req,res) =>{
  
    const { email, password} = req.body;
    db.query('SELECT password from customers where email =? ',[email], async(err,result) =>{
        if(err){
            console.log(err);
        }
        if(result.length>0 && await bcrypt.compare(password, result[0].password)){
            global.logged_email = email;
            global.logged_name = result[0]?.name;
            global.logged_id = result[0]?.id;
            return res.render('index',{
                email : email
            });
        }else{
            return res.render('login',{
                message:"The email or password are wrong!"
            })
        }
    })
   
};

exports.details = (req,res) =>{
   
    db.query('SELECT * FROM customers where email=?',global.logged_email,async(err,result)=>{
        if(err){
            console.log(err);
        }
        if(result.length>0){
            global.logged_name = result[0].name;
            return res.render('acc_details',{
                email:global.logged_email,
                name:result[0].name,
                address:result[0].billing_address
            })
        }else{
            console.log("A crapat")
        }
    })
    
    
};

exports.saveaddress = (req,res)=>{
    const address = req.body.address;
    db.query(`UPDATE customers SET billing_address =? where email =?`,[address,global.logged_email], async(error, result)=>{
        if(error){
            console.log(error);
        } else{
            return res.render('acc_details',{
                email:global.logged_email,
                name:global.logged_name,
                address:address,
                message:'Address saved successfully'
            });
        }
    })
};

exports.locations = (req,res)=>{
    
    getUserId();
    db.query('SELECT bikes.id, bikes.type,bike_types.description,bike_types.price_per_minute FROM bikes inner join bike_types on bikes.type = bike_types.id', function (err, data) {
    if (err){
        throw err;
    }
    if(global.billing_address){
        res.render('rent',{
            result: data,
            id:data.id,
            type:data.type,
            price_per_minute:data.price_per_minute,
            locations:displayNone,
            vehicles:displayBlock,
            tripProgress:displayNone,
            tripFinal:displayNone,
            pay:displayNone,
            pdf:displayNone
            
        });
    }else{
            res.render('rent',{
                checkaddress:"Please set a billing address before using our services",
                locations:displayBlock,
                vehicles:displayNone,
                tripProgress:displayNone,
                tripFinal:displayNone,
                pay:displayNone,
                pdf:displayNone
            })
   
    }
    })
};

exports.vehicles = (req,res)=>{
    var string = JSON.stringify(req.body);
    var objectValue = JSON.parse(string);
    var vehId = objectValue['vehId'];
    global.bike_id = vehId;


    db.query("SELECT price_per_minute from bike_types inner join bikes on bike_types.id = bikes.type where bikes.id= ?",vehId,function(err,result){
        if(err){
            console.log(err);
        }else{
            db.query('INSERT INTO rentals SET ?',{customer_id:global.logged_id,bike_id:vehId},async(error,resultx)=>{
                if(error){
                    console.log(error);
                }else{
                    db.query('SELECT MAX(id) from rentals',async(err,resulty)=>{
                    var string = JSON.stringify(resulty[0]);
                    var objectValue = JSON.parse(string);
                    global.rental_id = objectValue['MAX(id)'];
                    });
                }
            })
            res.render('rent',{
                startDate: "startRide()",
                payPerMinute: result[0].price_per_minute,
                locations:displayNone,
                vehicles:displayNone,
                tripProgress:displayBlock,
                tripFinal:displayNone,
                pay:displayNone,
                pdf:displayNone,
                tripInProgress:"class=tripNotFinished"
        
            });
        }
    });

};

exports.history = (req,res)=>{
 
    db.query('SELECT end_date_time,start_date_time,bike_id FROM rentals where customer_id=? order by id desc limit 10',[global.logged_id],async(err,info,fields)=>{
    if(err){
        console.log(err);
    }else{
        res.render('acc_history',{
            result: info,
            stopridetime:info.end_date_time,
            start_date_time:info.start_date_time,
            bike_used:info.bike_id
        })
    }
    });
};

exports.tripprogress = (req,res)=>{
    var startDate = JSON.stringify(req.body);
    var objectValue1 = JSON.parse(startDate);
    var distance = objectValue1['distance'];
    console.log(objectValue1)
    global.start_ride = objectValue1['start'];
    global.end_ride = objectValue1['stop'];
    global.amount = parseFloat(objectValue1['amount']);
   
    res.render('rent',{
                endride:global.end_ride,
                distance:distance +" m",
                amount:global.amount,
                payPerMinute:res.price_per_minute,
                locations:displayNone,
                vehicles:displayNone,
                tripProgress:displayNone,
                tripFinal:displayBlock,
                pay:displayNone,
                pdf:displayNone
        
            
        })
};
    
exports.tripfinal = (req,res)=>{ 
    var gross_amount = Number(global.amount);
    var VAT = 19;
    var net_amount = gross_amount *VAT /100 + gross_amount;
    //Am setat la toate facturiile paid:0 pentru ca nu am folosit un Payment API
    db.query('INSERT INTO invoices SET ?',{paid:'not paid',gross_amount:gross_amount,VAT:VAT,net_amount:net_amount}, async(error,result)=>{
        if(error){
            console.log(error);
        }else{
           db.query('SELECT MAX(id) from invoices',async(err,ress)=>{
            if(err){
                console.log(err);
            }else{
                var string = JSON.stringify(ress[0]);
                var objectValue = JSON.parse(string);
                global.invoice_id = objectValue['MAX(id)'];
                console.log(global.invoice_id) 
                db.query(`UPDATE rentals SET start_date_time =?,end_date_time =?,invoice_id =? where id =?`,[global.start_ride,global.end_ride,Number(global.invoice_id),global.rental_id], async(error, result)=>{ 
                    if(error){
                    console.log(error);
                }else{
                    writePDF();
                    res.render('rent',{
                        netamount:net_amount,
                        locations:displayNone,
                        vehicles:displayNone,
                        tripProgress:displayNone,
                        tripFinal:displayNone,
                        pay:displayNone,
                        pdf:displayBlock
                
                    });
                }
            });
            }
           })
        }
    }) 
}

exports.pay = (req,res)=>{
   //PAYMENT APIS
};

function  writePDF(){
    
    var gross_amount = Number(global.amount);
    var VAT = 19;
    var net_amount = gross_amount *VAT/100 + gross_amount;
    db.query('SELECT * from customers where email =?',global.logged_email,(err,info)=>{
        if(err){
            console.log(err);
        }else{
           global.billing_address = info[0].billing_address;
           global.logged_name = info[0].name;
            const doc = new jsPDF();
            doc.setFont("arial", "bold");
            doc.text(70,15,"Thank you for using RideWithUs")
            doc.setFont("arial", "normal");
            doc.text(1,20,"===============================================================")
            doc.text(5,25,"NAME:"+String(global.logged_name))
            doc.text(5,31,"BILLING ADDRESS:"+String(global.billing_address))
            doc.text(5,37,"EMAIL: "+global.logged_email);
            doc.text(5,43,"START: "+global.start_ride);
            doc.text(5,50,"STOP: "+global.end_ride);
            doc.text(5,56,"GROSS AMOUNT:"+gross_amount.toFixed(2).toString())
            doc.text(5,62,"VAT:"+VAT.toString())
            doc.text(5,68,"FINAL AMOUNT:"+net_amount.toFixed(2).toString())
            doc.text(5,74,"STATUS: Not Paid")
            doc.text(1,80,"===============================================================")
            doc.setFont("arial", "bold");
            doc.text(5,86,"For complaints please contact us at the email address: ridewith@us.com")
            doc.setFont("arial", "normal");
            doc.text(1,92,"===============================================================")
            doc.save('invoice'+global.invoice_id+'.pdf')
        }
    })
    
};

function getUserId(){
    db.query('SELECT * from customers where email =?',global.logged_email,(err,info)=>{
        if(err){
            console.log(err);
        }else{
            global.logged_id = info[0]?.id;
            global.billing_address = info[0]?.billing_address;
            console.log(global.logged_id);
        }
    })

};



