'use strict';

module.exports = function (Shoppingcart) {


  /*To get Product added into Cart as per users id */

  Shoppingcart.remoteMethod('getCartDetails', {
    description: "get All CartDetails for a particular user",
    accepts: [
      {arg: 'userid', type: 'string', require: true},
    ],
    returns: [
      {arg: 'response', type: 'array'},
    ],
    http: {path: '/getCart', verb: 'get'},
  });

  Shoppingcart.getCartDetails = function (userid, cb) {
    console.log("userId: " + userid);
    Shoppingcart.find({},function (err,user) {
      if (err) {
        //custom logger 
        console.error(err);
        cb({"message": "some thing went Wrong"});
        return;
      }
      else {
        console.log(JSON.stringify(user) + "success=" + user.length);
      }
    })
// Shoppingcart.find({filter:{'where':{'userid':userid}}},function (err, cart) {

   // Shoppingcart.find({where: {userid:'59705d3c060f6670613ef592'}}, function (err, cart) {

    Shoppingcart.find({where: {and: [{userid: userid}]}} , function (err, cart) {

    //console.log("get data ---> "+ JSON.stringify(cart));
    if (err) {
      console.log("error");
      cb({"message": "Something went wrong"});
      return;
    }
    else {
      console.log("success" + JSON.stringify(cart));
      cb(null, cart);
    }

  });





}
/*To get Product added into Cart as per users id */


/*Operation Hooks for Add to Cart data*/

Shoppingcart.observe("before save", function updateAddToCartRequestParams(ctx, next) {
  if (ctx.instance) {

   // if (ctx.instance.createdate) {
      ctx.instance.createdate = new Date();
    //}

  }
  next();

});

/*Operation Hooks for Add to Cart data*/

};
