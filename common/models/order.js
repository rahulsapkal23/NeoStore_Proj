'use strict';
var waterfall =require('async/waterfall');
var each =require('async/each');
var eachSeries=require('async/eachSeries')

var stripe = require('stripe')('sk_test_xoQyYRfMagOtTqkEAYGI2OGd');

module.exports = function(Order) {


  // Order.disableRemoteMethod('upsertWithWhere', true);
  // Order.disableRemoteMethod('replaceOrCreate', true);
  // Order.disableRemoteMethod('update', true);
  // Order.disableRemoteMethod('findById', true);
  // Order.disableRemoteMethod('patchOrCreate', true);
  // Order.disableRemoteMethod('createChangeStream', true);
  // Order.disableRemoteMethod('find', true);
  // Order.disableRemoteMethod('create', true);
  // Order.disableRemoteMethod('patchOrCreate', true);
  // Order.disableRemoteMethod('findById', true);
  // Order.disableRemoteMethod('destroyById', true);
  // Order.disableRemoteMethod('prototype.patchAttributes', true);
  // Order.disableRemoteMethod('replaceById', true);
  // Order.disableRemoteMethod('count', true);
  // Order.disableRemoteMethod('__create__orderitems', true);
  // Order.disableRemoteMethod('find', true);

  /********************* APi for Final order with stripe integration ***********************************/
  /****           fotmat of data to be post
   * {
    "userId":"5975ba6df6d9e115d3871e6a",
    "addressId":"007",
    "card": {
            "exp_month": 10,
            "exp_year": 2018,
            "number":4242424242424242,
            "cvc": 100
    },

    "products":[{
                 "productId":"59770dbcee32740640a49f59",
                "quantity":"1"
                },
                {
                "productId":"59771cc0ee32740640a49f5b",
                "quantity":"1"
                },
                {
                "productId":"59771d97ee32740640a49f5d",
                "quantity":"1"
                 }
                ]

      }**/

  Order.remoteMethod('orderpost', {
    description: "Placing final order by userId and product array",
    accepts: [{arg: 'data', type: 'object', http: {source: 'body'}, required: true}],
    returns: [{type: 'object', root: true}],
    http: {path: '/order', verb: 'post'},
  });

  Order.orderpost=function (data, cb) {

    waterfall([
      getUserDetails,
      myFirstFunction,
      verifyCard,
      getFullAddress,
      mySecondFunction,
      myThirdFunction,
      myLastFunction,
      DropMailToClient,
    ], function (err, result) {
      // result now equals 'done'
      if(err){
        cb(err)
      }
      else {
        cb(null,result)
        console.log("Final response->", result);
      }
    });


    function getUserDetails(callback) {
      console.log("data 1->", data);
      Order.app.models.user_account.find({where:{id:data.userId}},function (err,res) {
        console.log("res-->",res);
        if(err){
          callback(err);
        }
        else {
          if(res.length>0)
          {
            var userdeatils = res[0];
            callback(null, userdeatils);
          }
          else {
            callback("Invalid User");
          }
        }
      });

    }

    function myFirstFunction(userdeatils,callback) {
      //calculating toal cost of product and giving it to second function with product array
      //console.log("myFirstFunction->"+data.products.length);

      Order.app.models.shoppingcart.find({where:{userId:data.userId}},function (err,res) {
        if(err){
          console.log("error while finding instat in shoppingcart",err)
        }
        else {
          if(res.length>0) {
            console.log("shoppingcart ",res);
            var  productArray=res;
            var toatalcost=0;
            if(productArray.length>0) {
              each(productArray, function (product, callback) {
                console.log("product->", product.productid);

                Order.app.models.product.find({where:{id:product.productid}},function (err,res) {
                  console.log("cost-->",res[0].product_cost);
                  console.log("qty-->",parseInt(product.productqty));
                  product.product_cost=res[0].product_cost
                  toatalcost=toatalcost+(parseInt(res[0].product_cost) * parseInt(product.productqty));
                  console.log("toatalcost-->",toatalcost)
                  callback(null,toatalcost,productArray);
                });

              }, function (err, res) {
                if (err) {
                  console.log('some thing went wrong');
                  callback('some thing went wrong');
                } else {
                  console.log('total cost to be inserted',toatalcost);
                  callback(null, data,userdeatils, toatalcost,productArray);
                }
              });
            }

          }
          else {
            console.log("no product found ");
            callback("no product found in shopping cart");
          }
        }
      });
    }

    function verifyCard(data,userdeatils,toatalcost,productArray,callback) {

      // console.log(productArray,"<----in veryfy--->",toatalcost);
      stripe.customers.create({
        email: userdeatils.email
      }).then(function(customer){
        return stripe.customers.createSource(customer.id, {
          source: {
            object: 'card',
            exp_month: data.card.exp_month,
            exp_year: data.card.exp_year,
            number:data.card.number,
            cvc: data.card.cvc
          }
        });
      }).then(function(source) {
        console.log("source--> ",source)
        var num=0.00;
        num=(toatalcost*100);
        return stripe.charges.create({
          amount: num,
          currency: 'INR',
          customer: source.customer,
          source:source.id
        });
      }).then(function(charge) {
        console.log("charges sucesss-->",charge)
        callback(null,userdeatils, data, toatalcost,productArray);
        // New charge created on a new customer
      }).catch(function(err) {
        console.log("err-->",err)
        callback(err);
        // Deal with an error
      });
    }
    function getFullAddress(userdeatils,data, toatalcost,productArray,callback) {
      //------------------ get full address of user -----------------------
      Order.app.models.address.find({where:{id:data.addressId}},function (err,res) {
        if(res.length>0){
          //console.log("-->",res);
          var address=res[0];
          callback(null,userdeatils,address,data,toatalcost,productArray)
        }
        else {
          //console.log("no such orders")
          callback("address not valid");
        }
      });
    }

    function mySecondFunction(userdeatils,address,data, toatalcost,productArray, callback) {
      //----------- inserting the entry in order table ----------------------
      //console.log(data,"<---data2  product_name->",toatalcost);
      var createdate = new Date().toDateString()
      if(data.userId && toatalcost) {
        Order.create({
          createon: createdate,
          userId: data.userId,
          orderstatus: "transit",
          ordertotal: toatalcost,
          address:address
        }, function (err, res) {
          console.log("success insert in order->", res);
          if(err){
            console.log("error while inserting", err)
          }
          else {
            callback(null,userdeatils, res,data,productArray);
          }
        });
      }
    }
    function myThirdFunction(userdeatils,resSecond,data,productArray, callback) {
      // inserting product in orderitem table
      //console.log(data,"<--data3->",resSecond);
      //console.log("<--data3->",productArray);
      if(productArray.length>0) {
        each(productArray, function (product, callback) {
          Order.app.models.orderitems.create({
              productId: product.productid,
              productprice: product.product_cost,
              productqty: product.productqty,
              orderId: resSecond.id
            }

            ,function (err,res) {
              console.log("3-->",res.id);
              if(err){
                console.log("error while inserting in order items",err)
                callback("error while inserting in order items");
              }
              else {
                console.log("order item success");
                callback(null, "success");
              }
            });


        }, function (err, res) {
          if (err) {
            console.log('some thing went wrong');
          } else {
            console.log('order item inserted',res);
            //callback(null, data, toatalcost);
            callback(null,userdeatils, data,resSecond);
          }
        });
      }
    }

    function myLastFunction(userdeatils,data,resSecond, callback) {
      // remove product from cart table
      console.log("data4->",data.userId);
      Order.app.models.shoppingcart.find({where:{userId:data.userId}},function (err,res) {
        if(err){
          console.log("error while finding instat in shoppingcart",err)
        }
        else {
          if(res.length>0) {
            each(res, function (product, callback) {
              console.log("id to delete->",product.id)
              Order.app.models.shoppingcart.destroyById(product.id,function (err,res) {
                console.log("deleted-->",res);
                callback(null, 'loop delete success');
              });

            }, function (err, res) {
              if (err) {
                console.log('some thing went wrong while deleting');
              } else {
                console.log('order item inserted');
                console.log("final order-->",resSecond)
                var obj={};
                obj.orderId=resSecond.id;
                obj.message="order placed successfully";
                callback(null,userdeatils, obj);
              }
            });
          }
          else {
            console.log("no product found to delete");
            callback("no product found to delete");
          }
        }
      });
    }
    function DropMailToClient(userdeatils,obj,callback) {
      // mail to client regarding generated order
      //console.log("userdeatils->",userdeatils)
      Order.app.models.Email.send({
        to:userdeatils.email, //"suhel.khan@neosofttech.com",//"sandip.ghadge@wwindia.com",//info.email,
        from:"aniket.pracheta@neosofttech.com",
        subject: "Order Placed Successfully",
        //html: "<a href='" + setURL + "'>Click Me to Change Password</a>"
        html:"Hello User,<br>Your order is placed successfully kindly login with your credentials on site for more information.Your order no is -"+obj.orderId//html_body
      }, function (err, mail) {

        if (!err) {
          console.log("mail send");
          //cb(null,"Mail sent successfully")
          callback(null, obj);
        } else {
          console.log(err);
          callback(null, obj);
        }
      });
    }
  }





  /******** get Particualr Order Details from order no *****************/
  /******** posting the order no to get full order details in path ************/

  Order.remoteMethod('getParticularOrderDetails', {
    description: "get Particular Order Details from order no",
    accepts: [ {arg: 'orderno', type: 'string', require: true}],
    returns: [{type: 'object', root: true}],
    http : {verb : 'get', path : '/orderno/:orderno'}
  });

  Order.getParticularOrderDetails=function (orderno,cb) {

    waterfall([
      myFirstFunction,
      mySecondFunction,
      myLastFunction,
      finalResponseFunction
    ], function (err, result) {
      //--- Final call back----------------
      console.log("final order-->");
      if(err){
        cb(err);
      }
      else {
        cb(null,result);
        console.log("Final response->", result);
      }
    });
    function myFirstFunction(callback) {
      //------------ finding the order ---------------------//
      console.log("data->",orderno);
      Order.find({where:{id:orderno}},function (err,res) {

        if(res.length==1){
          //console.log("cost-->",res);
          var FirstResponse=res[0];
          callback(null,FirstResponse)
        }
        else {
          console.log("no such orders")
          callback("No such order found");
        }
      });
    }

    function mySecondFunction(FirstResponse, callback) {
      //--------- taking  out orderitems of that order and passing it to next fun. to get images------//

      console.log(" mySecondFunction-->",FirstResponse.id);
      Order.app.models.orderitems.find({where:{orderId:FirstResponse.id}},function (err,res) {
        if(res.length>0){
          var SecondProductArray=res;
          callback(null,FirstResponse,SecondProductArray)
        }
        else {
          console.log("no such orders")
          callback("No such order found");
        }

      });

    }
    function myLastFunction(FirstResponse,SecondProductArray, callback) {
      //------ firing query at product table to get all details of product and passing its array to next --------------------------
      // console.log(FirstResponse,"<---three--->",SecondProductArray.length);
      var productArray=[];

      each(SecondProductArray, function(cartData, callbackeach) {
        Order.app.models.product.findById(cartData.productId,
          {
            include: {
              relation: 'images',
            }
          }

          ,function (err,res) {
            console.log('pro ->',res);
            var imgpro=JSON.stringify(res);
            var img=JSON.parse(imgpro);
            console.log('pro img->',img.images[0]);
            var obj={
              productId: res.id,
              product_producer:res.product_producer,
              product_name:res.product_name,
              product_avg_rating: res.product_avg_rating,
              productqty: cartData.productqty,
              product_cost:cartData.productprice,
              instock: true,
              images:img.images[0]
            }
            productArray.push(obj)
            callbackeach(null,productArray);
          })

      }, function(err,res) {
        if( err ) {
          console.log('some thing went wrong');
        } else {
          // console.log('All files have been processed successfully',productArray);
          FirstResponse.products=productArray;
          callback(null,FirstResponse,productArray);
        }
      });

    }

    function finalResponseFunction(FirstResponse,productArray,callback) {
      //--------------- prepare final response-------------------------------
      // console.log(FirstResponse,"final res-->",productArray)
      var finalResponse={
        orderId:FirstResponse.id,
        userId:FirstResponse.userId,
        createon:FirstResponse.createon,
        orderstatus:FirstResponse.orderstatus,
        ordertotal: FirstResponse.ordertotal,
        address: FirstResponse.address,
        products: productArray
      }
      //console.log("--final final-->",finalResponse)
      callback(null,finalResponse );
    }
  }



  /******** get all Order Details from userId only from order table *****************/
  /******** posting the userId no to get full order details in path ************/

  Order.remoteMethod('getAllOrderDetailsofUser', {
    description: "get all Order Details from userId",
    accepts: [ {arg: 'userId', type: 'string', require: true}],
    returns: [{type: 'object', root: true}],
    //http: {path: '/orderno', verb: 'post'}
    http : {verb : 'get', path : '/orderofuser/:userId'}
  });

  Order.getAllOrderDetailsofUser=function (userId,callbackeach) {
    console.log(userId);
    Order.find({where:{userId:userId}},function (err,res) {
      console.log('res ->',res);
      if(err){
        callbackeach(err)
      }
      else {
        if (res.length > 0)
        {
          callbackeach(null, res);
          //var respo=  Order.getParticularOrderDetails("59a81a077bf2080cf4d8b186");
          //console.log("i want-->",respo);
        }
        else {
          callbackeach(null, "No orders found for this user");
        }
      }

    })
  }


  /******** get all Order Details from userId in order screen *****************/
  /******** posting the userId no to get full order details in path ************/

  Order.remoteMethod('OrderDetailsofUser', {
    description: "get all Order Details from userId in order screen",
    accepts: [ {arg: 'userId', type: 'string', require: true}],
    returns: [{type: 'object', root: true}],
    http : {verb : 'get', path : '/allorderofuser/:userId'}
  });

  Order.OrderDetailsofUser=function (userId,cb) {
    console.log(userId);

    waterfall([
      myFirstFunction,
      mySecondFunction,
      myLastFunction
    ], function (err, result) {
      // result now equals 'done'
      if(err){
        cb(err);
      }
      else {
        cb(null,result);
      }
    });
    function myFirstFunction(callback) {
      //---------------get all order for user----------------------
      Order.find({where:{userId:userId}},function (err,res) {
        console.log(res.length,'pro ->',res);
        if(err){
          callbackeach(err)
        }
        else {
          if (res.length > 0)
          {
            var allOrders=res;
            callback(null, allOrders);
          }
          else {
            callback("No orders found for this user");
          }
        }

      })

    }
    function mySecondFunction(allOrders, callback) {
      //---------------- get product in a particular order from orderitems -------------
      var allorderArray=[];
      each(allOrders, function(orders, callbackeach) {
        Order.app.models.orderitems.find({where:{orderId:orders.id}},function (err,res) {
          //console.log('pro ->',res);
          var obj={
            order: orders,
            products:res
          }
          allorderArray.push(obj);

          callbackeach(null,allorderArray);
        })

      }, function(err,res) {
        if( err ) {
          console.log('some thing went wrong');
        } else {
          callback(null,allorderArray);
        }
      });


    }
    function myLastFunction(allorderArray, callback) {
      //---------------- get product in a details from product table -------------
      //console.log("-final array-->",allorderArray)
      var finalResponse=[];
      eachSeries(allorderArray, function (order, callbackbigeach) {
        //console.log("-order no-->",order.order.id)
        var  productArray=[];
        eachSeries(order.products, function(cartData, callbackeachsmall) {
          //console.log("-- befor query-->>",cartData);

          Order.app.models.product.findById(cartData.productId,
            {
              include: {
                relation: 'images',
              }
            }
            ,function (err,res) {
              //console.log('in query products ->',res);
              var imgpro=JSON.stringify(res);
              var img=JSON.parse(imgpro);
              // console.log('pro img->',img);
              var obj={
                productId: res.id,
                product_producer:res.product_producer,
                product_name:res.product_name,
                product_avg_rating: res.product_avg_rating,
                productqty: cartData.productqty,
                product_cost:cartData.productprice,
                instock: true,
                images:img.images[0]
              }
              productArray.push(obj)
              obj={}
              callbackeachsmall(null,productArray);
            })
        }, function(err,res) {
          if( err ) {
            console.log('some thing went wrong');
          } else {
            var obj2={};
            obj2.order=order.order;
            obj2.products=productArray
            finalResponse.push(obj2);
            callbackbigeach(null,finalResponse)
          }
        });
      },function(err){
        console.log('Process Finished');
        //console.log(" final respose-->",JSON.stringify(finalResponse))
        callback(null,finalResponse)
      });
    }
  }


};
