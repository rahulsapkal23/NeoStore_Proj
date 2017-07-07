'use strict';

var path = require('path');
var apiRootUrl = "http://0.0.0.0:3000/api/";
module.exports = function(Useraccount) {

  Useraccount.validatesInclusionOf('gender', {in: ['male', 'female'],message:{in:'In valid gender'}});
  Useraccount.validatesInclusionOf('is_active', {in: [true, false],message:{in:'Only True and false are allowed'}});

  Useraccount.disableRemoteMethodByName("findOne");

  Useraccount.disableRemoteMethodByName('prototype.__count__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__create__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__delete__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__destroyById__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__findById__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__get__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__updateById__accessTokens');

  Useraccount.disableRemoteMethodByName('PATCH');
  //Useraccount.disableRemoteMethodByName('prototype.__create__accessTokens');
  //Useraccount.disableRemoteMethodByName('prototype.__delete__accessTokens');


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








};
