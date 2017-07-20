'use strict';

module.exports = function (Product) {

  Product.beforeRemote('create', function(context, product, cb) {
    if (context.args.data.product_img == undefined)
    {
      cb({"statusCode" : 400,"message": "product_img is required"});
      return;
    }else {
      console.log(context.args.data.categoryId);

      Product.app.models.Category.find(
        {where: {id : context.args.data.categoryId} },
        function (err, result) {
          if (!err) {
            if(result.length == 0){
              console.log("no such categoryId exist");
              cb({"statusCode" : 401,"message": "categoryId is Invalid"});
              return;
            }else {
              context.args.data.product_created_date=new Date();
              console.log(JSON.stringify(product));
              console.log("-->"+JSON.stringify((context.args.data)));
              cb();
            }
          }
          else {

            cb(err);

          }


        });
    }




  });



  // Product.beforeRemote('updateAttribute', function(context, user, next) {
  //
  //   context.args.data.updated_date=new Date();
  //
  //   //context.args.data.publisherId = context.req.accessToken.userId;
  //   // Product.validatesPresenceOf('password', {message: 'Cannot be blank'});
  //
  //   console.log(JSON.stringify(user));
  //   console.log("-->"+JSON.stringify((context.args.data)));
  //   next();
  // });

};





