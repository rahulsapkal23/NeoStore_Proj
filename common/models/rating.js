'use strict';

module.exports = function (Rating) {

  //APi for inserting Rating if user is register
  Rating.remoteMethod('rateProduct', {
    description: "API for rating the products",
    accepts: [
      {arg: 'data', type: 'object', http: {source: 'body'}, require: true}
    ],
    returns: [
      {type: 'object', root: true}
    ],
    http: {path: '/rateProduct', verb: 'post'}
  });


  Rating.rateProduct = function (data, cb) {
    console.log("recived data-<", data)

      // Rating.upsertWithWhere({where: {and:[{user_id:data.user_id},{product_id:data.product_id}]}}, {
      //   user_id:data.user_id,
      //   product_id:data.product_id,
      //   rating:data.rating
      // }, function (err, rate) {
      //   if(err){ cb(err)}
      //   else {
      //     console.log(rate)
      //     cb(null,"Thanks for Rating")
      //   }
      // });

    Rating.find({where:{and:[{user_id:data.user_id},{product_id:data.product_id}]}},function (err,rate) {
       if (rate.length) {
        console.log("update->", rate)


        Rating.update({id: rate[0].id}, {rating:data.rating}, function(err, results) {
          updateRatingOfProduct(data)
          cb(err, "rating updated");
        });
      }
      else {
        console.log("insert->")
        Rating.create({user_id:data.user_id,
               product_id:data.product_id,
              rating:data.rating},function (err,productinserted) {
          if(err){
            console.log(err)
            cb("Some thing went wrong")
          }
          else {
            updateRatingOfProduct(data)
            cb(null,"Thanks for Rating")
          }

        })
      }
    })


  }

  function updateRatingOfProduct(data) {
    console.log(" updating rating in product table",data.product_id)
    Rating.find({where:{product_id:data.product_id}},function (err,rate) {
      var totalProduct=rate;
      var sumOfRating=0;

      for(var i=0;i<totalProduct.length;i++){
        sumOfRating=sumOfRating+totalProduct[i].rating
      }

      var finalRatingOfProduct=sumOfRating/totalProduct.length;
      console.log(sumOfRating,"totalProduct",totalProduct.length+"final=>"+finalRatingOfProduct)
      Rating.app.models.Product.update({id:data.product_id}, {product_avg_rating:finalRatingOfProduct},
        function (err, result) {
        //console.log("Total product-->" + result.length)
        if (!err) {
          console.log("updates successfully",result)
        }
        else {
           console.log("error->"+err)
        }
      });

    })

  }

};
