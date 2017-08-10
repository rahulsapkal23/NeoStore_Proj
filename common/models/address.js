'use strict';

module.exports = function(Address) {

  Address.remoteMethod('GetAllAddressOfUser', {
    description: "Get All Address Of User with User id",
    accepts: [
      {arg: 'userAccountId', type: 'string', require: true}
    ],
    returns: [
      {type: 'array', root: true}
    ],
    //http: {path: '/getAddressbyUserId', verb: 'get'}
    http : {verb : 'get', path : '/getAddressbyUserId/:userAccountId'}
  });
  Address.remoteMethod('postAddress', {
    description: "post user address",
    accepts: [
      { arg: 'userAccountId', type: 'string'},
      { arg: 'data', type: 'object', http: { source: 'body' } }
    ],
    returns: [
      //{arg: 'response', type: 'object'},
      {type: 'object', root: true}
    ],
       http : {verb : 'post', path : '/AddAddress/:userAccountId'}
  });

  //function to get all address of particular user from db
  Address.GetAllAddressOfUser = function (userAccountId, cb) {

    console.log("-->" + userAccountId);
    Address.app.models.user_account.find({where: {"id": userAccountId}} ,function (err, result) {
      console.log("Total product-->" + result.length)
      if (!err) {
        if(result.length){

          Address.find({where:{userAccountId: userAccountId}}, function (err, address) {

            if (err) {
              //custom logger 
              console.error(err);
              cb({"message": "some thing went Wrong"});
              return;
            }
            else {

              console.log(JSON.stringify(address)+"success=" + address.length);
              if (address.length) {
                cb(null,address);
                console.log("success=");
              }
              else {
                console.error(err);
                //cb(null,[]);
              }

            }
          });

        }else {
          cb("Invalid user ID");
        }
      }
      else {
        var err = new Error();
        err.statusCode = 404;
        err.message = 'something Went Wrong';
        cb(err);
        return;
      }
    });



  }


  //funtion for adding address to database
  Address.postAddress = function (userAccountId,data,cb) {

    console.log( JSON.stringify(data)+"-->"+ userAccountId );

    Address.app.models.user_account.find({where: {"id": userAccountId}} ,function (err, result) {
      console.log("Total product-->" + result.length)
      if (!err) {
       if(result.length){

         Address.create({ "fulladdress": data.fulladdress,
           "city": data.city,
           "state": data.state,
           "pincode": data.pincode,
           "country": data.country,
           "userAccountId": userAccountId},function (err, address) {

           if (err) {
             //custom logger 
             console.error(err);
             cb({"message": "some thing went Wrong"});
             return;
           }
           else {
             cb(null,address);
           }
         });

       }else {
         cb("Invalid user ID");
       }
      }
      else {
        var err = new Error();
        err.statusCode = 404;
        err.message = 'something Went Wrong';
        cb(err);
        return;
      }
    });
  }

};
