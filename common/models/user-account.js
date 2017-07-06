'use strict';


module.exports = function(Useraccount) {
  var app = require('../../server/server');
  //var rate=require('/common/models/product');
  //console.log(app.datasources);

  //var zero=app.datasources.;
  //console.log("////->"+app);
  //  zero.collection('product').find().toArray(function (err,data) {
  //    console.log(data);
  // });

  Useraccount.validatesInclusionOf('gender', {in: ['male', 'female'], message: 'In valid gender'});
  Useraccount.validatesInclusionOf('is_active', {in: [true, false], message: 'Only True and false are allowed'});

  Useraccount.definition.properties.created_date.default = function() {
    return new Date();
  }

  Useraccount.disableRemoteMethodByName('prototype.__count__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__create__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__delete__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__destroyById__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__findById__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__get__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__updateById__accessTokens');

  //Useraccount.disableRemoteMethodByName('prototype.__create__accessTokens');
  //Useraccount.disableRemoteMethodByName('prototype.__delete__accessTokens');

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

}




