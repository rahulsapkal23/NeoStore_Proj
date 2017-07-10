'use strict';

var path = require('path');
var apiRootUrl = "http://0.0.0.0:3000/api/";
module.exports = function(Useraccount) {

  Useraccount.validatesInclusionOf('gender', {in: ['male', 'female'],message:{in:'In valid gender'}});
  Useraccount.validatesInclusionOf('is_active', {in: [true, false],message:{in:'Only True and false are allowed'}});


  // Useraccount.definition.properties.created_date.default = function() {
  //   return new Date();
  // }

  //Useraccount.disableRemoteMethodByName("findOne");


  Useraccount.disableRemoteMethodByName('prototype.__count__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__create__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__delete__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__destroyById__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__findById__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__get__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__updateById__accessTokens');

<<<<<<< HEAD
  Useraccount.beforeRemote('create', function(context, user, next) {

    context.args.data.created_date=new Date();

  //context.args.data.publisherId = context.req.accessToken.userId;
  Useraccount.validatesPresenceOf('password', {message: 'Cannot be blank'});

  console.log(JSON.stringify(user));
  console.log("-->"+JSON.stringify((context.args.data)));
  next();
});
=======
  Useraccount.disableRemoteMethodByName('PATCH');
  //Useraccount.disableRemoteMethodByName('prototype.__create__accessTokens');
  //Useraccount.disableRemoteMethodByName('prototype.__delete__accessTokens');
>>>>>>> bce1d92e80a1795f9cc10d3b5c7db10954942fa3


  /*
   Below event will be triggered over reset password request
   will create access token
   */

  Useraccount.on('resetPasswordRequest', function (info) {
    //console.log(info.email); // the email of the requested user
    console.log(info.accessToken.id); // the temp access token to allow password reset

    //console.log(JSON.stringify(info));

    //console.log("Useraccount: "+ Useraccount.app);
    console.log("Useraccount: 1 "+ Useraccount.definition.name);

    var tempAccessToken = info.accessToken.id;

    //POST /user_accounts/reset-password

    //http://0.0.0.0:3000/api/user_accounts/reset-password?access_token=5Ey8OK9olx6fJ3c5ZCUD9D77iCwwjBZelBfnDt8APrGU4CeRlTcFNTG1JdDrWhEd

    //http://apiRoot/modelName/methodName
    var modelName = Useraccount.definition.name;
    var methodName  = "reset-password"
    //var setURL = apiRootUrl+modelName +"/"+methodName +"access_token ="+tempAccessToken;
    var setURL = "file:///Users/webwerks/Documents/Darshana/NeoStore/changePassword.html" +"?access_token="+tempAccessToken;
    console.log("setURL : " +setURL);

    var options = {
      type: 'email',
      to: info.email,
      from: 'noreply@loopback.com',
      subject: 'Thanks for registering.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user: Useraccount
    };



    Useraccount.app.models.Email.send({
      to: "darshana.patil@wwindia.com",//"sandip.ghadge@wwindia.com",//info.email,
      from: 'darshana.patil@wwindia.com',
      subject: 'Forgot Email Id',
      html :"<a href='"+setURL+"'>Click Me to Change Password</a>"
      //html: 'my <em>html</em>'//html_body
    }, function(err, mail) {
      console.log('welcome email sent!');
      if(!err){
        console.log("mail send");
        return true;
      }else{
        return false;
      }
    });


    // requires AccessToken.belongsTo(User)
    info.accessToken.user(function (err, user) {
      console.log(user); // the actual user
    });



  });



  Useraccount.remoteMethod('AdminLogin', {
    accepts: [
      {arg: 'email', type: 'string', require: true},
      {arg: 'password', type: 'string', require: true}
    ],
    returns: [
      {arg: 'response', type: 'object'}
    ],
    http: {path: '/loginAdmin', verb: 'post'}
  });

<<<<<<< HEAD
  Useraccount.remoteMethod('updateFromAdmin', {
    accepts: [
      {arg: 'user_id', type: 'string', require: true},
      {arg: 'first_name', type: 'string', require: true},
      {arg: 'last_name', type: 'string', require: true},
      {arg: 'role', type: 'string', require: true},
      {arg: 'phone_no', type: 'string', require: true},
      {arg: 'birth_date', type: 'string', require: true}
    ],
    returns: [
      {arg: 'response', type: 'object'}
    ],
    http: {path: '/Update_user', verb: 'PUT'}
  });



=======
>>>>>>> bce1d92e80a1795f9cc10d3b5c7db10954942fa3
  Useraccount.AdminLogin = function (email, password, cb) {
    var UserModel = Useraccount;
    console.log("-->" + email);

    UserModel.find({where: {and: [{email: email}, {role: 'admin'}]}} , function (err, user) {

      if (err) {
        //custom logger 
        console.error(err);
        cb({"message": "some thing went Wrong"});
        return;
      }
      else {

        console.log("success=" + user.length);
        if(user.length) {

          UserModel.login({
            email: email,           // must provide email or "username"
            password: password              // required by default

          }, function (err, accessToken) {
            if (accessToken) {
              console.log(accessToken.userId);
              console.log(accessToken.id);      // => GOkZRwg... the access token
              //console.log(accessToken.ttl);     // => 1209600 time to live
              console.log(accessToken.created); // => 2013-12-20T21:10:20.377Z


              cb(null, accessToken);
            }
            else {
              //custom logger 
              console.error('-->' + err);
              cb(err);
            }
          });
        }

        else{
          console.error(err);
          cb({"message": "you ar not an admin"});

        }

      }
    });
  }



  Useraccount.remoteMethod('updateFromAdmin', {
    accepts: [
      {arg: 'user_id', type: 'string', require: true},
      {arg: 'first_name', type: 'string', require: true},
      {arg: 'last_name', type: 'string', require: true},
      {arg: 'role', type: 'string', require: true},
      {arg: 'phone_no', type: 'string', require: true},
      {arg: 'birth_date', type: 'string', require: true}
    ],
    returns: [
      {arg: 'response', type: 'object'}
    ],
    http: {path: '/Update_user', verb: 'PUT'}
  });


  Useraccount.updateFromAdmin=function (user_id,first_name,last_name,role,phone_no,birth_date,cb) {
    console.log("-->" + user_id+""+last_name+""+role+""+phone_no+""+birth_date);

    //let data={};
    //Useraccount.updateAttributes(data, callback)

    Useraccount.find({where: {"id": user_id}} , function (err, user) {
      console.log("data-->"+JSON.stringify(user)+"-------"+user.length);
      if(user.length){

      }
      else {
        console.log("no such user exist");
      }

    });
  }

<<<<<<< HEAD
  Useraccount.updateFromAdmin=function (user_id,first_name,last_name,role,phone_no,birth_date,cb) {
    console.log("-->" + user_id+""+last_name+""+role+""+phone_no+""+birth_date);

    //let data={};
    //Useraccount.updateAttributes(data, callback)

    Useraccount.find({where: {"id": user_id}} , function (err, user) {
      console.log("data-->"+JSON.stringify(user)+"-------"+user.length);
      if(user.length){

      }
      else {
        console.log("no such user exist");
      }

    });
  }

}
=======
>>>>>>> bce1d92e80a1795f9cc10d3b5c7db10954942fa3

  Useraccount.beforeRemote('create', function(context, user, next) {

    context.args.data.created_date=new Date();

    //context.args.data.publisherId = context.req.accessToken.userId;
    Useraccount.validatesPresenceOf('password', {message: 'Cannot be blank'});

    console.log(JSON.stringify(user));
    console.log("-->"+JSON.stringify((context.args.data)));
    next();
  });



};
