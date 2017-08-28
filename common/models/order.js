'use strict';
var waterfall =require('async/waterfall');
var each =require('async/each');

module.exports = function(Order) {


  /********************* APi for Final order***********************************/
  /****           fotmat of data to be post
   * {
    "userId":"5975ba6df6d9e115d3871e6a",
    "addressId":"007",
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

    //console.log("data->", data);

    waterfall([
      myFirstFunction,
      mySecondFunction,
      myThirdFunction,
      myLastFunction,
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
    function myFirstFunction(callback) {
      //calculating toal cost of product and giving it to second function
      console.log("data 1->", data);
      var toatalcost=0;
      if(data.products.length>1) {
        each(data.products, function (product, callback) {
          console.log("product->", product.productId);

          Order.app.models.product.find({where:{id:product.productId}},function (err,res) {
            console.log("cost-->",res[0].product_cost);
            product.product_cost=res[0].product_cost
            toatalcost=toatalcost+(parseInt(res[0].product_cost) * parseInt(product.quantity));
            callback(null,toatalcost);
            //callback(null, '3');
          });


        }, function (err, res) {
          if (err) {
            console.log('some thing went wrong');
          } else {
            console.log('total cost to be inserted',toatalcost);
            callback(null, data, toatalcost);
          }
        });
      }

    }
    function mySecondFunction(data, toatalcost, callback) {
      // inserting the entry in order table
      console.log(data,"<---data2->",toatalcost);
     var createdate = new Date();
        if(data.userId && toatalcost) {
          Order.create({
            createon: createdate,
            userId: data.userId,
            orderstatus: "transit",
            ordertotal: toatalcost,
            addressId:data.addressId
          }, function (err, res) {
            console.log("success insert in order->", res);
            if(err){
              console.log("error while inserting", err)
            }
            else {
              callback(null, res,data);
            }
          });
        }
    }
    function myThirdFunction(resSecond,data, callback) {
      // inserting product in orderitem table
      console.log(data,"<--data3->",resSecond);

      if(data.products.length>1) {
        each(data.products, function (product, callback) {

          Order.app.models.orderitems.create({
              productId: product.productId,
              productprice: product.product_cost,
              productqty: product.quantity,
              orderId: resSecond.id

            }
          ,function (err,res) {
            console.log("3-->",res.id);
            if(err){
              console.log("error while inserting in order items",err)
              callback("error while inserting in order items");
            }
            else {
              console.log("order item sucess");
              callback(null, "success");
            }
          });


        }, function (err, res) {
          if (err) {
            console.log('some thing went wrong');
          } else {
            console.log('order item inserted',res);
            //callback(null, data, toatalcost);
            callback(null, data);
          }
        });
      }

    }
    function myLastFunction(data, callback) {
      // remove product from cart table
      console.log("data4->",data.userId);
      Order.app.models.shoppingcart.find({where:{userId:data.userId}},function (err,res) {
        if(err){
          console.log("error while finding instat in shoppingcart",err)
        }
        else {
          //console.log("4-->",res);

          if(res.length>1) {
            each(res, function (product, callback) {
             console.log("id to delete->",product.id)
              Order.app.models.shoppingcart.destroyById(product.id,function (err,res) {
                console.log("deleted-->",res);
                //callback(null, '3');
                callback(null, 'loop delete success');
              });

            }, function (err, res) {
              if (err) {
                console.log('some thing went wrong while deleting');
              } else {
                console.log('order item inserted');
                callback(null, 'order placed successfully');
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
  }


  //



};
