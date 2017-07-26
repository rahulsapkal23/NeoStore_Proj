'use strict';

module.exports = function(Shoppingcart) {


  Shoppingcart.remoteMethod('getCartDetails', {
    description: "get All CartDetails for a particular user",
    accepts: [
      {arg: 'userid', type: 'string', require: true},
    ],
    returns: [
      {arg: 'response', type: 'object'},
    ],
    http: {path: '/getCart', verb: 'get'},
  });




  Shoppingcart.getCartDetails = function (userid,cb){

    Shoppingcart.find({filter:{'where':{'userid':userid}}},function (err, cart) {

      //console.log("get data ---> "+ JSON.stringify(cart));
      if(err){
        console.log("error");
        cb({"message":"Something went wrong"});
        return;
      }
      else{
        console.log("success");
        cb(null,cart);
      }

    });


  }



};
