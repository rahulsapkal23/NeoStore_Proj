'use strict';
var loopback = require('loopback');
var Product = loopback.getModel("product");
var Promise = require('bluebird');
var waterfall =require('async/waterfall');
var each =require('async/each');
var eachSeries=require('async/eachSeries')

module.exports = function (Shoppingcart) {


  Shoppingcart.beforeRemote('create', function (context, user, next) {

    console.log("into before remote method");

    context.args.data.createdate = new Date();
    //context.args.data.modified_date=new Date();
    //context.args.data.publisherId = context.req.accessToken.userId;
    //Useraccount.validatesPresenceOf('password', {message: 'Cannot be blank'});

    console.log("-->" + JSON.stringify((context.args.data)));
    var getProdId = context.args.data.productid;
    next();
  });


  Shoppingcart.remoteMethod('getCartDetails', {
    description: "get All CartDetails for a particular user",
    accepts: [{arg: 'userid', type: 'string', require: true}],
    returns: [{type: 'object', root: true}],
    http: {path: '/getCart', verb: 'get'},
  });

  /******************************* get cart details of particular user *****************************************/
  Shoppingcart.getCartDetails = function (userid, cb) {
     // console.log("userid->",userid)
     waterfall([
      myFirstFunction,
      mySecondFunction,
      myLastFunction,
    ], function (err, result) {
       //final call back
      console.log("done final->"+result)
       if(!err)
       {
         cb(null,result)
       }
       else {
        cb("something went wrong");
       }
    });
    function myFirstFunction(callback) {
      //get the cart of a user and return it
      var cartData;
      console.log("userid->",userid)
      var imgmodel= Shoppingcart.app.models.image;
      Shoppingcart.find({'where':{userId:userid},order:'product_name ASC'},function (err, cart) {
      //Shoppingcart.find({'where':{userId:userid}},function (err, cart) {
      cartData = cart
        console.log("len-->",cartData.length)
        //console.log("one-->",cartData[0].product_name);
        //console.log("two-->",cartData[1].product_name);
        callback(null,cartData);
      })


    }
    function mySecondFunction(cartData, callback) {
      //loop for image and push it
      //console.log("second", cartData.productid)
      var  finalarry=[];
      var imgmodel= Shoppingcart.app.models.image;

      eachSeries(cartData, function(cartData, callback) {
        imgmodel.find({where:{productId:cartData.productid},order:'productId ASC'},function (err,res) {
              //console.log('pro img->',res[0]);
             var obj={
               id:cartData.id,
               productId: res[0].productId,
               product_producer:cartData.product_producer,
               product_name:cartData.product_name,
               productqty: cartData.productqty, 
               instock: true, 
               product_cost:cartData.product_cost ,
               images:[res[0]]
              }
          finalarry.push(obj)
          callback(null,finalarry);
            })

      }, function(err,res) {
              if( err ) {
                   console.log('some thing went wrong');
        } else {
          //console.log(finalarry[0].product_name,'All files have been processed successfully',finalarry[1].product_name);
          callback(null,finalarry);
        }
      });
    }
    function myLastFunction(arg1, callback) {
          // console.log("done1--->",arg1)
           callback(null, arg1);

    }
  }

  /**************************** add to cart **********************************************/
  /**************** Format of posting Data
   {
    "userid":"5975ba6df6d9e115d3871e6a",
     "products":[{
                 "productId":"59770dbcee32740640a49f59",
                "qty":"1"
                },
                {
                "productId":"59771cc0ee32740640a49f5b",
                "qty":"1"
                },
                {
                "productId":"59771d97ee32740640a49f5d",
                "qty":"1"
                 }
                ]

      }
   */

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

    console.log("into add to cart", JSON.stringify(data));

    var objectData = data;

    // var today = new Date();
    objectData.createdate = new Date();
    var insertCartArr = [];


// console.log("objectData.products" , objectData.products);

    Promise.mapSeries(objectData.products, function (product) {

      var productId = product.productId;
      var productQty = product.qty;
       console.log("get product data ----> ", productId,"-->",productQty);

      //debugger;
      var updateShoppingCart = {
        userId: objectData.userid,
        productid: productId,
        productqty: productQty,
        instock: true,
        product_cost: null,
        product_name: null,
        product_producer:null,
        createdate: objectData.createdate
      };
      return Product.find({where: {_id: productId}})
        .then(function (productData) {
          updateShoppingCart.product_cost = productData[0].product_cost;
          updateShoppingCart.product_name = productData[0].product_name;
          updateShoppingCart.product_producer = productData[0].product_producer;

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

  /*****************getting cart count of partcular user ************************/
  Shoppingcart.remoteMethod('getCartCount', {
    description: "Getting cart count of partcular user",
    accepts: [
      {arg: 'userAccountId', type: 'string', require: true}
    ],
    returns: [
      {type: 'array', root: true}
    ],
    //http: {path: '/getAddressbyUserId', verb: 'get'}
    http : {verb : 'get', path : '/cartcount/:userAccountId'}
  });

  Shoppingcart.getCartCount=function (userAccountId,cb) {
    console.log("-->",userAccountId);
    Shoppingcart.find({'where':{userId:userAccountId}},function (err, cart) {
      //cartData = cart
      console.log("two-->",cart.length)
      if(cart.length){
        var obj={
          userId:userAccountId,
          cartCount:cart.length
        }

      }else {
        var obj={
          userId:userAccountId,
          cartCount:0
        }
      }
      cb(null,obj);

    })
  }


};
