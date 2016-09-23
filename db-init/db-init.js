// should be run to clear and init db
db.userlists.drop();
db.movies.drop();
db.activitystreams.drop();
db.wishlists.drop();
db.counters.drop();
db.counters.insert({ "_id" : "movieId", "seq" : 0 });
db.counters.insert({ "_id" : "userId", "seq" : 0 });
db.counters.insert({ "_id" : "listId", "seq" : 0 });
db.counters.insert({ "_id" : "actId", "seq" : 0 });