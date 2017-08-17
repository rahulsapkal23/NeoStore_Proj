'use strict';
var loopback = require('loopback');
var Product = loopback.getModel("product");
var Promise = require('bluebird');
module.exports = function (Shoppingcart) {


  Shoppingcart.beforeRemote('create', function (context, user, next) {

    console.log("into before remote method");

    context.args.data.createdate = new Date();
    //    context.args.data.modified_date=new Date();
    //context.args.data.publisherId = context.req.accessToken.userId;
    //Useraccount.validatesPresenceOf('password', {message: 'Cannot be blank'});

    console.log("-->" + JSON.stringify((context.args.data)));
    var getProdId = context.args.data.productid;

    // Shoppingcart.app.models.Product.find({where: {id: getProdId}}, function (err, cart) {
    //   // console.log("get data ---> "+ JSON.stringify(cart));
    //   if (err) {
    //     console.log("error");
    //     cb({"message": "Something went wrong"});
    //     return;
    //   }
    //   else {
    //     if (context.args.data) {
    //       console.log("in side update of date-->" + JSON.stringify((context.args.data)));
    //       //context.args.data.product_description = cart[0].product_description;
    //       //context.args.data.product_cost = cart[0].product_cost;
    //      //next();
    //       // ctx.data.modified_date = new Date();
    //     }
    //   }
    // })

    //context.args.data.product_description=pro_desc;

    //console.log("-insert->" + JSON.stringify((context.args.data.email)));
    //checkemail(context.args.data.email);
    next();
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
      {arg: 'data', type: 'object', http: {source: 'body'}, required: true}
    ],
    returns: [

      {type: 'object', root: true}

    ],
    http: {path: '/addToCart', verb: 'post'},
  });

  Shoppingcart.addToCart = function (data, cb) {

    //console.log("into add to cart", JSON.stringify(data));

    var objectData = data;

    // var today = new Date();
    objectData.createdate = new Date();
    var insertCartArr = [];


// console.log("objectData.products" , objectData.products);

    Promise.mapSeries(objectData.products, function (product) {

      var productId = product.productId;
      var productQty = product.qty;
      // console.log("get product data ----> ", productId);

      //debugger;
      var updateShoppingCart = {
        userId: objectData.userid,
        productid: productId,
        productqty: productQty,
        instock: true,
        product_cost: null,
        product_description: null,
        createdate: objectData.createdate
      };
      return Product.find({where: {_id: productId}})
        .then(function (productData) {
          updateShoppingCart.product_cost = productData[0].product_cost;
          updateShoppingCart.product_description = productData[0].product_description;

          return Shoppingcart.find({where: {productid: productId}});
        })
        .then(function (getCartData) {
          console.log("Qty :", getCartData[0].productqty);
          if (getCartData.length != 0) {
            // console.log("qty merged : ");
            updateShoppingCart.productqty = parseInt(updateShoppingCart.productqty) + parseInt(getCartData[0].productqty);
           // console.log("qty value: "+ updateShoppingCart.productqty);
            // Shoppingcart.upsert(updateShoppingCart);
            //Shoppingcart.updateAttribute("productqty",updateShoppingCart.productqty);
            Shoppingcart.updateAll({"userId":objectData.userid,"productid":productId},{"productqty":updateShoppingCart.productqty});

          }
          else {
            // console.log("into else");
            insertCartArr.push(updateShoppingCart);
          }

        })
        .catch(function (productErr) {
          // console.log("Unable to get product data. ******* into catch ");
          insertCartArr.push(updateShoppingCart);
          return null;
          // Promise.resolve({});
        });
    })

      .then(function (data) {
        // console.log("show products into insertCartArr : ", insertCartArr);

        return Shoppingcart.create(insertCartArr);

      })
      .then(function (cartCreated) {

        cb(null, {"message": "Product add to cart successfully"});
      })
      .catch(function (error) {
        // console.log("i am last");
        cb(null, {"message": "Something went wrong"});
      })




  }


};
