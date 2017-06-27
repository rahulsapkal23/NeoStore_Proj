'use strict';

module.exports = function(Useraccount) {

  Useraccount.validatesInclusionOf('gender', {in: ['male', 'female'],message:{in:'In valid gender'}});
  Useraccount.validatesInclusionOf('is_active', {in: [true, false],message:{in:'Only True and false are allowed'}});

};
