'use strict';
var loopback = require('loopback');
var Product = loopback.getModel("product");
var Category = loopback.getModel("category");

var UserAcc = loopback.getModel("user_account");

// var Product =require("product");
module.exports = function(Image) {

  var thumb = require('node-thumbnail').thumb;
  var imgURL = "http://10.0.100.213:8081";
  var containerName = 'image';
  var thumbpath;
  var imgType;




  Image.profileData = function (ctx,options, cb) {


    ctx.req.params.container = containerName;
    Image.app.models.container.upload(ctx.req, ctx.result, function (err, fileObj) {
      if (err) {
        console.log('err', err);
        cb({"statusCode" : 402,"message": "file is not uploaded please attach file"});
        return;
      }else if (fileObj.fields.userId == undefined && fileObj.fields.productId == undefined && fileObj.fields.categoryId == undefined)
      {
        cb({"statusCode" : 400,"message": "Either productId or userId or categoryId is required"});
        return;
      }
      else if (fileObj.fields.userId == undefined && fileObj.fields.categoryId == undefined) {
        // if (fileObj.fields.productId == undefined)
        // {
        //   cb({"message": "product id required"});
        //   return;
        // }
        // else
        if (fileObj.fields.productId != "")
        {
          imgType = "Product";
          Product.find(
            {where: {id : fileObj.fields.productId[0]} },
            function(err, product){
              if(!err){
                console.log("sucess product"+JSON.stringify(product));
                console.log("sucess product.length"+JSON.stringify(product.length));
                if(product.length == 0){
                  console.log("no such user exist");
                  cb({"statusCode" : 401,"message": "product id is Invalid"});
                  return;
                }
                else {
                  console.log('success fileObj123', JSON.stringify(fileObj));
                  var fileInfo = fileObj.files.file[0];
                  // let id = (fileObj.fields.productId[0] == "")?fileObj.fields.userId[0] : fileObj.fields.productId[0];
                  thumb({
                    prefix: '_',
                    suffix: '_250thumb',
                    source: 'storage/image/'+fileInfo.name, //please give server related path
                    destination: 'storage/thumbnail',
                    overwrite: true,
                    width: 250
                  }).then(function(files) {
                    console.log('Success');
                    var thumbpath1 =files[0].dstPath;

                    thumb({
                      prefix: '_',
                      suffix: '_100thumb',
                      source: 'storage/image/'+fileInfo.name, //please give server related path
                      destination: 'storage/thumbnail',
                      overwrite: true,
                      width: 100
                    }).then(function(files) {
                      console.log('Success');

                      var thumbpath2 =files[0].dstPath;

                      Product.find(
                        {where: {id : fileObj.fields.productId[0]} },
                        function(err, product){
                          if(!err){
                            console.log("sucess product"+JSON.stringify(product));
                            var imgData2 = product[0].product_img;
                            console.log("sucess imgData2 product"+JSON.stringify(imgData2));
                            imgData2.push({
                              ImgURL:  imgURL+"/storage/"+fileInfo.container +"/" + fileInfo.name,
                              ThumbURL250:imgURL+"/"+thumbpath1,
                              ThumbURL100:imgURL+"/"+thumbpath2

                            });
                            console.log("sucess imgData2 after push"+JSON.stringify(imgData2));

                            Product.upsertWithWhere(
                              {id : fileObj.fields.productId[0]} ,
                              {
                                product_img : imgData2
                              },
                              function(err, result) {
                                if(!err){
                                  console.log("sucess upsertWithWhere product"+JSON.stringify(result));
                                  Image.create({
                                    name: fileInfo.name,
                                    type: fileInfo.type,
                                    container: fileInfo.container,
                                    ImgURL:  imgURL+"/storage/"+fileInfo.container +"/" + fileInfo.name,
                                    ThumbURL250:imgURL+"/"+thumbpath1,
                                    ThumbURL100:imgURL+"/"+thumbpath2,
                                    productId : fileObj.fields.productId[0],
                                    // userId: fileObj.fields.userId[0]
                                  }, function (err, obj) {
                                    if (err !== null) {
                                      cb(err);
                                    } else {
                                      console.log("obj is  -->>>"+JSON.stringify(obj));
                                      var response ={
                                        "id":obj.id,
                                        // "userId": obj.userId,
                                        "productId": obj.productId,
                                        "ImgURL": obj.ImgURL,
                                        "ThumbURL250":obj.ThumbURL250,
                                        "ThumbURL100":obj.ThumbURL100

                                      };
                                      cb(null, response);
                                    }
                                  });
                                  // cb(product);
                                }else{
                                  console.log("error upsertWithWhere product"+JSON.stringify(err));
                                  cb(err);
                                  // reject(err);
                                }
                              });
                            // cb(product);
                          }else{
                            console.log(JSON.stringify(err));
                            cb(err);
                            // reject(err);
                          }
                        }
                      )










                    }).catch(function(e) {
                      console.log('Error', e.toString());
                    });
                  }).catch(function(e) {
                    console.log('Error', e.toString());
                  });
                }
              }else{
                console.log("error is",JSON.stringify(err));
                cb(err);
                // reject(err);
              }
            }
          )
        }
        else
        {
          cb({"statusCode" : 401,"message": "product id should not null"});
          return;
        }

      }else if (fileObj.fields.productId == undefined && fileObj.fields.categoryId == undefined) {
        if (fileObj.fields.userId != "")
        {
          imgType = "UserAcc";
          UserAcc.find(
            {where: {id : fileObj.fields.userId[0]} },
            function(err, useracc){
              if(!err){
                console.log("sucess useracc"+JSON.stringify(useracc));
                console.log("sucess useracc.length"+JSON.stringify(useracc.length));
                if(useracc.length == 0){
                  console.log("no such user exist");
                  cb({"statusCode" : 401,"message": "no such user exist"});
                  return;
                }
                else {
                  console.log('success fileObj123', JSON.stringify(fileObj));
                  var fileInfo = fileObj.files.file[0];
                  // let id = (fileObj.fields.productId[0] == "")?fileObj.fields.userId[0] : fileObj.fields.productId[0];
                  thumb({
                    prefix: '_',
                    suffix: '_thumb',
                    source: 'storage/image/'+fileInfo.name, //please give server related path
                    destination: 'storage/thumbnail',
                    overwrite: true,
                    width: 200
                  }).then(function(files) {
                    console.log('Success');
                    var thumbpath2 =files[0].dstPath;
                    UserAcc.find(
                      {where: {id : fileObj.fields.userId[0]} },
                      function(err, useracc){
                        if(!err){
                          console.log("sucess useracc"+JSON.stringify(useracc));
                          // var imgData2 = product[0].Product_IMG;
                          // console.log("sucess imgData2 product"+JSON.stringify(imgData2));
                          // imgData2.push({
                          //   ImgURL:  imgURL+"/storage/"+fileInfo.container +"/" + fileInfo.name,
                          //   ThumbURL:imgURL+"/"+thumbpath1
                          // });
                          // console.log("sucess imgData2 after push"+JSON.stringify(imgData2));

                          UserAcc.upsertWithWhere(
                            {id : fileObj.fields.userId[0]} ,
                            {
                              Profile_IMG : {
                                ImgURL:  imgURL+"/storage/"+fileInfo.container +"/" + fileInfo.name,
                                ThumbURL:imgURL+"/"+thumbpath2
                              }
                            },
                            function(err, result) {
                              if(!err){
                                console.log("sucess upsertWithWhere useracc"+JSON.stringify(result));
                                Image.create({
                                  name: fileInfo.name,
                                  type: fileInfo.type,
                                  container: fileInfo.container,
                                  ImgURL:  imgURL+"/storage/"+fileInfo.container +"/" + fileInfo.name,
                                  ThumbURL:imgURL+"/"+thumbpath2,
                                  // productId : fileObj.fields.productId[0],
                                  userId: fileObj.fields.userId[0]
                                }, function (err, obj) {
                                  if (err !== null) {
                                    cb(err);
                                  } else {
                                    console.log("obj is  -->>>"+JSON.stringify(obj));
                                    var response ={
                                      "id":obj.id,
                                      "userId": obj.userId,
                                      // "productId": obj.productId,
                                      "ImgURL": obj.ImgURL,
                                      "ThumbURL":obj.ThumbURL
                                    };
                                    cb(null, response);
                                  }
                                });
                                // cb(product);
                              }else{
                                console.log("error upsertWithWhere useracc"+JSON.stringify(err));
                                cb(err);
                                // reject(err);
                              }
                            });
                          // cb(product);
                        }else{
                          console.log(JSON.stringify(err));
                          cb(err);
                          // reject(err);
                        }
                      }
                    )
                  }).catch(function(e) {
                    console.log('Error', e.toString());
                  });
                }
              }else{
                console.log(JSON.stringify(err));
                cb(err);
                // reject(err);
              }
            }
          )

        }else {
          cb({"statusCode" : 401,"message": "user id should not null"});
          return;
        }
      }
      else {
        if (fileObj.fields.categoryId != "")
        {
          imgType = "Category";
          Category.find(
            {where: {id : fileObj.fields.categoryId[0]} },
            function(err, category){
              if(!err){
                console.log("sucess category"+JSON.stringify(category));
                console.log("sucess category.length"+JSON.stringify(category.length));
                if(category.length == 0){
                  console.log("no such category exist");
                  cb({"statusCode" : 401,"message": "no such category exist"});
                  return;
                }
                else {
                  console.log('success fileObj123', JSON.stringify(fileObj));
                  var fileInfo = fileObj.files.file[0];
                  // let id = (fileObj.fields.productId[0] == "")?fileObj.fields.userId[0] : fileObj.fields.productId[0];
                  thumb({
                    prefix: '_',
                    suffix: '_thumb',
                    source: 'storage/image/'+fileInfo.name, //please give server related path
                    destination: 'storage/thumbnail',
                    overwrite: true,
                    width: 200
                  }).then(function(files) {
                    console.log('Success');
                    var thumbpath2 =files[0].dstPath;
                    Category.find(
                      {where: {id : fileObj.fields.categoryId[0]} },
                      function(err, category){
                        if(!err){
                          console.log("sucess category"+JSON.stringify(category));


                          Category.upsertWithWhere(
                            {id : fileObj.fields.categoryId[0]} ,
                            {
                              category_img : {
                                ImgURL:  imgURL+"/storage/"+fileInfo.container +"/" + fileInfo.name,
                                ThumbURL:imgURL+"/"+thumbpath2
                              }
                            },
                            function(err, result) {
                              if(!err){
                                console.log("sucess upsertWithWhere category"+JSON.stringify(result));
                                Image.create({
                                  name: fileInfo.name,
                                  type: fileInfo.type,
                                  container: fileInfo.container,
                                  ImgURL:  imgURL+"/storage/"+fileInfo.container +"/" + fileInfo.name,
                                  ThumbURL:imgURL+"/"+thumbpath2,
                                  // productId : fileObj.fields.productId[0],
                                  categoryId: fileObj.fields.categoryId[0]
                                }, function (err, obj) {
                                  if (err !== null) {
                                    cb(err);
                                  } else {
                                    console.log("obj is  -->>>"+JSON.stringify(obj));
                                    var response ={
                                      "id":obj.id,
                                      "categoryId": obj.categoryId,
                                      // "productId": obj.productId,
                                      "ImgURL": obj.ImgURL,
                                      "ThumbURL":obj.ThumbURL
                                    };
                                    cb(null, response);
                                  }
                                });
                                // cb(product);
                              }else{
                                console.log("error upsertWithWhere useracc"+JSON.stringify(err));
                                cb(err);
                                // reject(err);
                              }
                            });
                          // cb(product);
                        }else{
                          console.log(JSON.stringify(err));
                          cb(err);
                          // reject(err);
                        }
                      }
                    )
                  }).catch(function(e) {
                    console.log('Error', e.toString());
                  });
                }
              }else{
                console.log(JSON.stringify(err));
                cb(err);
                // reject(err);
              }
            }
          )

        }else {
          cb({"statusCode" : 401,"message": "categoryId  should not null"});
          return;
        }
      }
    });
  }


  Image.remoteMethod(
    'profileData',
    {

      accepts: [
        {arg: 'ctx', type: 'object', http: {source: 'context'} },
        {arg: 'options', type: 'object', http:{ source: 'query'}}

      ],
      returns: {arg: 'fileObject', type: 'object', root: true},
      http: {path: '/upload', verb: 'post'}


    });




};
