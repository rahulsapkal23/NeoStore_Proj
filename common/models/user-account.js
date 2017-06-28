'use strict';

module.exports = function(Useraccount) {

  Useraccount.validatesInclusionOf('gender', {in: ['male', 'female'],message:{in:'In valid gender'}});
  Useraccount.validatesInclusionOf('is_active', {in: [true, false],message:{in:'Only True and false are allowed'}});

  Useraccount.disableRemoteMethodByName("findOne");

  Useraccount.disableRemoteMethodByName('prototype.__count__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__create__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__delete__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__destroyById__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__findById__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__get__accessTokens');
  Useraccount.disableRemoteMethodByName('prototype.__updateById__accessTokens');

  Useraccount.disableRemoteMethodByName('PATCH');
  //Useraccount.disableRemoteMethodByName('prototype.__create__accessTokens');
  //Useraccount.disableRemoteMethodByName('prototype.__delete__accessTokens');

};
