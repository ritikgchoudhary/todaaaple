// router.get('/fixLevel0', async(req,res)=> {
  
//   const getUser = await User.find();
//   getUser.forEach( async element => {
//     var level0 = [];
//     var level1 = [];
//     var level2 = [];
//     if(element.level0.length > 0){
//        element.level0.forEach(doc => {
//         if(!doc.phone){
//           level0.push({mobile: doc.mobile, datetime: doc.datetime});
//         }else{
//           level0.push({mobile: doc.phone, datetime: doc.date})
//         }
        
//        });
//     }
//     if(element.level1.length > 0){
//       element.level1.forEach(doc => {
//        if(!doc.phone){
//          level1.push({mobile: doc.mobile, datetime: doc.datetime});
//        }else{
//          level1.push({mobile: doc.phone, datetime: doc.date})
//        }
       
//       });
//    }
//    if(element.level2.length > 0){
//     element.level2.forEach(doc => {
//      if(!doc.phone){
//        level2.push({mobile: doc.mobile, datetime: doc.datetime});
//      }else{
//        level2.push({mobile: doc.phone, datetime: doc.date})
//      }
     
//     });
//  }
//     level0.sort(function(a, b) {
//       var keyA = new Date(a.datetime),
//         keyB = new Date(b.datetime);
//       // Compare the 2 dates
//       if (keyA < keyB) return -1;
//       if (keyA > keyB) return 1;
//       return 0;
//     });
//     level1.sort(function(a, b) {
//       var keyA = new Date(a.datetime),
//         keyB = new Date(b.datetime);
//       // Compare the 2 dates
//       if (keyA < keyB) return -1;
//       if (keyA > keyB) return 1;
//       return 0;
//     });
//     level2.sort(function(a, b) {
//       var keyA = new Date(a.datetime),
//         keyB = new Date(b.datetime);
//       // Compare the 2 dates
//       if (keyA < keyB) return -1;
//       if (keyA > keyB) return 1;
//       return 0;
//     });
//     await User.updateOne({id: element.id}, {level0,level1,level2});
    

    
    
//   });
  
  
//   res.status(200).send('done');

// });

// router.get('/migrateusers',async(req,res) => {
//   con.query(`select * from users where veryfied_user=1`,function (err, result, fields) {
//     if (err) throw err;
//     result.forEach( async element => {
//       await User.create({id: element.id, phone: element.mobile, password: element.password, upLine: [element.refered_by],date: element.datetime, balance: element.wallet,username: element.fullname })
//     });
    
    
//   });
//   res.send('done',200)

// })


// router.get('/migratelevel0', async(req, res) => {
//   const getUser = await User.find();
  
  
//   // con.query(`select id, mobile, datetime from users where refered_by=1003`, function (err, result, fields) {
//   //   if (err) throw err;
    
//   //   res.send(result, 200);
    
//   // });
  
//   getUser.forEach( element => {
    

//     con.query(`select id, mobile, datetime from users where refered_by=${element.id}`,async function (err, result, fields) {
//       if (err) throw err;
//       await User.updateOne({id: element.id}, {$push: {'level0': result}});
      
  
    
//   });
    
//   });

 

//   res.send('Done', 200);

    
   
    
  
// });

// router.get('/migratelevel1', async(req, res) => {
//   const getUser = await User.find();
  
  
//   // con.query(`select id, mobile, datetime from users where refered_by=1003`, function (err, result, fields) {
//   //   if (err) throw err;
    
//   //   res.send(result, 200);
    
//   // });
  
//   getUser.forEach( element => {
    

//     con.query(`select id, mobile, datetime from users where refered_by=${element.id}`,async function (err, result, fields) {
//       if (err) throw err;
//       var _levData = ['first'];
//       result.forEach(doc => {
        
//         con.query(`select id, mobile, datetime from users where refered_by=${doc.id}`,async function (err, resultt, fields) {
//           if (err) throw err;
          
//           await User.updateOne({id: element.id}, {$push: {'level1': resultt}});
          
//         });
      
     
      
      
//     });
//     //console.log(_levData);
    
//   });
    
//   });

 

//   res.send('Done', 200);

    
   
    
  
// });
// router.get('/migratelevel2', async(req, res) => {
//   const getUser = await User.find();
//   getUser.forEach(  element => {
    
//     element.level0.forEach( async doc => {
//       const fetchLevel2 = await User.findOne({id: doc.id});
//       await User.updateOne({id: element.id}, {$push: {'level2': fetchLevel2.level1}});
//     })
    
//   });

 

//   res.send('Done', 200);

    
   
    
  
// });


// router.get('/migrateupline2', async(req,res) => {

//   const getUser = await User.find();
//   getUser.forEach( async element => {

//     const getLevel1 = await User.findOne({id: element.upLine[0]});
//     if(getLevel1.upLine[0]){
      
//       await User.updateOne({id: element.id},{$push: {upLine: getLevel1.upLine[0]}})
//     }
   




//   });
//   res.send('done', 200)

// });

// router.get('/migrateupline3', async(req,res) => {

//   const getUser = await User.find();
//   getUser.forEach( async element => {

//     const getLevel1 = await User.findOne({id: element.upLine[1]});
//     if(getLevel1.upLine[0]){
      
//       await User.updateOne({id: element.id},{$push: {upLine: getLevel1.upLine[0]}})
//     }
   




//   });
//   res.send('done', 200)

// });



// router.get('/migratewithdrawal', async(req,res) => {

//   con.query(`select * from withdrawal_request`,async function (err, result, fields) {
//     if (err) throw err;
//     result.forEach( async element => {
//       if(element.status === 1)
//       await Withdrawal.create({id: element.id,userId: element.user_id,amount: element.amount,status: 'Success',date: element.datetime});
//       if(element.status === 2)
//       await Withdrawal.create({id: element.id,userId: element.user_id,amount: element.amount,status: element.reason,date: element.datetime});
//       if(element.status === 0)
//       await Withdrawal.create({id: element.id,userId: element.user_id,amount: element.amount,status: 'Pending',date: element.datetime});

      
//     });

//   });
//   res.send('done', 200)
  

// })
// router.get('/migraterecharge', async(req,res) => {

//   const getUser = await User.find();
//   getUser.forEach( element => {
   

//     con.query(`select * from recharge_history where user_id=${element.id} and status=1`,async function (err, result, fields) {
//       if (err) throw err;
//     if(result.length !== 0){
//       await User.updateOne({id: element.id}, {rechargeHistory: [{'date': result[0]['datetime'], 'amount': result[0]['amount'],'status':'Success'}]});
//     }else{
//       await User.updateOne({id: element.id}, {rechargeHistory: []});
//     }  
   
//     });



//   });
//   res.send('done', 200)

// })

// router.get('/migratebank', async(req,res) => {

//   const getUser = await User.find();
//   getUser.forEach( element => {
   

//     con.query(`select * from bank_details where user_id=${element.id}`,async function (err, result, fields) {
//       if (err) throw err;
//     if(result.length !== 0){
//       await User.updateOne({id: element.id}, {bank: [{'name': result[0]['acc_holder_name'], 'phone': result[0]['mobile'],'email':result[0]['email'],'account':result[0]['acc_number'],'ifsc':result[0]['ifsc_code'],'upi':result[0]['upi'],'bank_name':result[0]['bank_name']}]});
//     }else{
//       await User.updateOne({id: element.id}, {bank: []});
//     }  
   
//     });



//   });
//   res.send('done', 200)

// })

// router.get('/migratecont', async(req,res) =>{
//   // con.query(`select sum(amount) from bonus_wallet where user_id=1003`, function (err, result, fields) {
//   //   if (err) throw err;
    
//   //   res.send(result, 200);
    
//   // });
//   const getUser = await User.find();
  
  
  
  
//   getUser.forEach( element => {
    
//     con.query(`select sum(amount) from bonus_wallet where user_id=${element.id} and type=7 and level=1`,async function (err, result, fields) {
//     if (err) throw err;
//     await User.updateOne({id: element.id}, {level0contribution: result[0]['sum(amount)']??0});
//   });
//     con.query(`select sum(amount) from bonus_wallet where user_id=${element.id} and type=7 and level=2`,async function (err, result, fields) {
//       if (err) throw err;
//       await User.updateOne({id: element.id}, {level1contribution: result[0]['sum(amount)']??0});
//     });
//       con.query(`select sum(amount) from bonus_wallet where user_id=${element.id} and type=7 and level=3`,async function (err, result, fields) {
//         if (err) throw err;
//         await User.updateOne({id: element.id}, {level2contribution: result[0]['sum(amount)']??0});

//         });

//   });
//   res.send('done',200);


// });

// router.get('/migrateredenvelop', async(req,res) =>{

//   con.query(`select * from envelope_create`,async function (err, result, fields) {
//     if (err) throw err;
//     result.forEach(async element => {

      
//     });
    
    
//    //await Red.create({id: element.id}, {'bonus': result[0]['sum(amount)']??0});
    
//   });
//   res.send('done',200);


// });

// router.get('/migratebonus', async(req,res) =>{
//   // con.query(`select sum(amount) from bonus_wallet where user_id=1003`, function (err, result, fields) {
//   //   if (err) throw err;
    
//   //   res.send(result, 200);
    
//   // });
//   const getUser = await User.find();
  
  
  
  
//   getUser.forEach(  element => {
//     con.query(`select sum(amount) from bonus_wallet where user_id=${element.id} and status=0`,async function (err, result, fields) {
//     if (err) throw err;
    
//    await User.updateOne({id: element.id}, {'bonus': result[0]['sum(amount)']??0});
    
//   });

//   });
//   res.send('done',200);


// });
