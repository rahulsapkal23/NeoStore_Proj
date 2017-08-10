'use strict';
var loopback = require('loopback');
var Product = loopback.getModel("product");
module.exports = function (Shoppingcart) {


  Shoppingcart.beforeRemote('create', function (context, user, next) {

    console.log("into before remote method");

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

  /**************************** add to cart **********************************************/

  Shoppingcart.remoteMethod('addToCart', {
    description: "Adding product to cart",
    accepts: [
      {arg: 'data', type: 'object', http: {source: 'body'}, required: true},
    ],
    returns: [

      {type: 'object', root: true}

    ],
    http: {path: '/addToCart', verb: 'post'},
  });

  Shoppingcart.addToCart = function (data, cb) {

    //console.log("into add to cart", data);

    //var objectData = data; // Aniket uncomment and check it and comment the below hardCoded data


    // need to insert data into db

    var objectData = {
      "userId": "5950c54a6e8be65c5925bffa",
      "products": [
        {
          "productId": "595376cdbf493511744064b0", "qty": "5"
        },
        {
          "productId": "5953770dbf493511744064b1", "qty": "5"
        }
      ],
      "createdate": new Date()
    };

    for (var i = 0; i < objectData.products.length; i++) {

      console.log("products Length ---->", i);


      var productId = objectData.products[i].productId;
      var productQty = objectData.products[i].qty;

      Product.find({where: {_id: productId}}, function (productErr, productData) {

        if (productErr) {
          console.log("unable to get Product Data : error");
        }
        else {
          //console.log("get product data ----> ", productData);
          console.log("get product data ----> ", productData[0].product_description);

          var updateShoppingCart = {
            userId: objectData.userId,
            productid: productId,
            productqty: productQty,
            instock: true,
            product_cost: productData[0].product_cost,
            product_description: productData[0].product_description,
            createdate: objectData.createdate
          };

          // ****************
          Shoppingcart.upsert(updateShoppingCart, function (err, res) {
            if (err) {
              console.log("error");
              cb({"message": "Something went wrong while adding data to cart"});
              return;
            }
            else {
              cb(null, {"message": "Product add to cart successfully"});
            }
          });
          // ****************

        }
      });


    }


  }


}
;
