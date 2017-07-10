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

  // Useraccount.definition.properties.created_date.default = function() {
  //   return new Date();
  // }

  Useraccount.disableRemoteMethodByName('prototype.__count__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__create__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__delete__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__destroyById__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__findById__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__get__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__updateById__accessTokens');

  Useraccount.beforeRemote('create', function(context, user, next) {

    context.args.data.created_date=new Date();

  //context.args.data.publisherId = context.req.accessToken.userId;
  Useraccount.validatesPresenceOf('password', {message: 'Cannot be blank'});

  console.log(JSON.stringify(user));
  console.log("-->"+JSON.stringify((context.args.data)));
  next();
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




