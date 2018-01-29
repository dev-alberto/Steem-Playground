var steem = require('steem');
const around = require('aspectjs').around;

// tell the api how many tranzactions you want fetched
const NUMBER_OF_TRANZACTIONS = 15;

// write your account name, or any other account here :)
const NAME = 'prometheus21';

// parse tranzaction
function process_tranzaction(transaction) {

  // get the transaction operation (type)
  var transactionOperation = transaction[1]['op'];

  // check to see whether the operation was a vote type operation and the voter is not yourself
  if (transactionOperation[0] === 'vote' && transactionOperation[1]['voter'] !== NAME) {
    return transactionOperation[1]['voter'];
  }

  return null;

}

var upvoteObject = {
  add: function(supporter){
      console.log('I have an upvote by ' + supporter)
  },
};

var api = {
  getUpvotes : function() {
    steem.api.getAccountHistory(NAME, 99999999, NUMBER_OF_TRANZACTIONS, function(err, accountHistory) {
      if (err) throw err

      for (var i=0; i < accountHistory.length; i++) {
        var name = process_tranzaction(accountHistory[i]);
        if (name) {
          upvoteObject.add(name)
        }
      }
    });
  },
}

var advice = {
   override: function(invocation) {
       console.log('Hey, I can do something cool before I find a new upvote')
       invocation.proceed();
       console.log('Hey, I can again do something cool, after I have found the upvote')
       console.log("************")
   }
};

around(upvoteObject, "add").add(advice, "override");

api.getUpvotes()
