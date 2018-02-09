var steem = require('steem');

class Unfollow {
  constructor(user, listToUnfollow, password) {
    this.user = user;
    this.listToUnfollow = listToUnfollow;
    this.password = password;
  }

  setListToUnfollow(newList) {
    this.listToUnfollow = newList;
  }

  makeCustomJson(friend) {
    var result = []
    result.push('follow');
    const custom_json = {
      follower: this.user,
      following : friend,
      what: []
    }
    result.push(custom_json);
    return JSON.stringify(result);
  }

  makeTranzaction(friend) {
    var tranzaction = ['custom_json'];
    var json = {
      required_auths: [],
      required_posting_auths: [this.user],
      id: 'follow',
      json: this.makeCustomJson(friend)
    }
    tranzaction.push(json);
    return tranzaction;
  }

  unfollowFriends() {
    var tranzactions = []
    for(var i=0; i< this.listToUnfollow.length; i++) {
        tranzactions.push(this.makeTranzaction(this.listToUnfollow[i]));
    }

    return steem.broadcast.sendAsync(
      {
        extensions: [],
        operations: tranzactions
      }, [this.password]);
  }
}

function getListOfFriends(apiFollowingResponse) {
  var res = []
  for(var i=0; i<apiFollowingResponse.length; i++) {
    res.push(apiFollowingResponse[i]['following']);
  }
  return res;
}

async function main() {

  const LIMIT = 10;
  const NAME = ''

  var unf = new Unfollow(NAME, [], '');

  const apiListOfFollowing = await steem.api.getFollowingAsync(NAME, '', 'blog', LIMIT);

  unf.setListToUnfollow(getListOfFriends(apiListOfFollowing));

  const unfollowRes = await unf.unfollowFriends();

  // console.log(unfollowRes);

}

main()
