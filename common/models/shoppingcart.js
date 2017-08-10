'use strict';

module.exports = function (Shoppingcart) {


  Shoppingcart.beforeRemote('create', function (context, user, next) {

    context.args.data.createdate = new Date();
    //    context.args.data.modified_date=new Date();
    //context.args.data.publisherId = context.req.accessToken.userId;
    //Useraccount.validatesPresenceOf('password', {message: 'Cannot be blank'});

    console.log("-->" + JSON.stringify((context.args.data)));
    var getProdId = context.args.data.productid;

    Shoppingcart.app.models.Product.find({where: {id: getProdId}}, function (err, cart) {
      // console.log("get data ---> "+ JSON.stringify(cart));
      if (err) {
        console.log("error");
        cb({"message": "Something went wrong"});
        return;
      }
      else {
        if (context.args.data) {
          console.log("in side update of date-->" + JSON.stringify((context.args.data)));
          context.args.data.product_description = cart[0].product_description;
          context.args.data.product_cost = cart[0].product_cost;
          next();
          // ctx.data.modified_date = new Date();
        }
      }
    })

    //context.args.data.product_description=pro_desc;

    //console.log("-insert->" + JSON.stringify((context.args.data.email)));
    //checkemail(context.args.data.email);

  });


  Shoppingcart.remoteMethod('getCartDetails', {
    description: "get All CartDetails for a particular user",
    accepts: [{arg: 'userid', type: 'string', require: true}],
    returns: [{arg: 'response', type: 'object'}],
    http: {path: '/getCart', verb: 'get'},
  });

  Shoppingcart.getCartDetails = function (userid, cb) {

    var userID = userid.toString();
    console.log("id placed-->" + userID);
    //Shoppingcart.find({filter:{'where':{'userid':userid}}},function (err, cart) { 
    Shoppingcart.find({where: {userId: userID}}, function (err, cart) {
      console.log("get data ---> " + JSON.stringify(cart));
      if (err) {
        console.log("error");
        cb({"message": "Something went wrong"});
        return;
      }
      else {
        console.log("success", JSON.stringify(cart));

        cb(null, cart);
      }
    });
  }


};
