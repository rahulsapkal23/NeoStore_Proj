'use strict';

module.exports = function (Product) {


  Product.beforeRemote('create', function(context, user, next) {

    context.args.data.created_date=new Date();

    //context.args.data.publisherId = context.req.accessToken.userId;
    // Product.validatesPresenceOf('password', {message: 'Cannot be blank'});

    console.log(JSON.stringify(user));
    console.log("-->"+JSON.stringify((context.args.data)));
    next();
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





