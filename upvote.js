var steem = require('steem');

var followers = {
  followers : [],
  populateFollowersList: function(apiResponse) {
    for(var i = 0; i < apiResponse.length; i++){
      this.followers.push(apiResponse[i]['follower'])
    }
  },
  getRandomFollower: function() {
    if (this.followers.length === 0) {
      return ''
    }
    return this.followers[Math.floor(Math.random() * this.followers.length)];
  },
}

var posts = {
  postData: [],
  populatePosts: function(apiResponse, randomFollower) {
    for(var i=0; i< apiResponse.length; i++) {
      var transactionOperation = apiResponse[i][1]['op'];
      if (this.isPost(transactionOperation, randomFollower)) {
        this.postData.push(transactionOperation[1])
      }
    }
  },
  isPost: function(operation, randomFollower) {
    return operation[0] === 'comment' && operation[1]['author'] === randomFollower && operation[1]['parent_author'] === ''
  },
  getRandomPost() {
    if (this.postData.length === 0) {
      return ''
    }
    return this.postData[Math.floor(Math.random() * this.postData.length)];
  }
}

// every steemit API invocation will return a promise
var apiInvocations = {
  followerRequest: function(user, limit) {
    return steem.api.getFollowersAsync(user, '', 'blog', limit)
  },
  accountHistoryRequest: function(user, limit) {
    return steem.api.getAccountHistoryAsync(user, 99999999, limit)
  },
  broadcastVote: function(postingKey, name, post, weight) {
    return steem.broadcast.voteAsync(postingKey, name, post.author, post.permlink, weight)
  }
}

async function start() {
  try {

    // private posting key
    const PASSWORD = ''
    // your account name
    const NAME = ''
    //account history tranzaction limit
    const TRANZACTION_LIMIT = 100
    const FOLLOWERS_LIMIT = 1000

    const apiFollowersResponse = await apiInvocations.followerRequest(NAME, FOLLOWERS_LIMIT)
    followers.populateFollowersList(apiFollowersResponse)
    const randomFollower = followers.getRandomFollower()
    console.log('random follower has been located' + randomFollower)

    const apiAccountHistoryResponse = await apiInvocations.accountHistoryRequest(
      randomFollower, TRANZACTION_LIMIT)
    posts.populatePosts(apiAccountHistoryResponse, randomFollower)
    const randomPost = posts.getRandomPost()

    if (randomPost === '') {
      console.log("Try running the script again, no post was found for limit " + TRANZACTION_LIMIT)
      return
    } else {
        console.log("A random post was found, now voting: "  + JSON.stringify(randomPost))
        upvoteRandomPost(PASSWORD, NAME, randomPost['author'], randomPost['permlink'])
        const voteResult = await apiInvocations.broadcastVote(PASSWORD, NAME, randomPost, 10000)
        console.log(voteResult)
        console.log("vote success")
    }
  }
  catch (rejectedValue) {
    // …
  }
}

start()
