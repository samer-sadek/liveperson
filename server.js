const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const Twitter = require('twitter');

const app = express();
const port = 3000;

// open the database connection
let db = new sqlite3.Database('twitter.db');

db.run('CREATE TABLE IF NOT EXISTS tweets (id INTEGER PRIMARY KEY, username TEXT, tweet TEXT, created_on TEXT, retweet_count INTEGER, favorite_count INTEGER)');

let client = new Twitter({
    consumer_key: '6nEXSwtqsYEig02coOyCb5Ebj',
    consumer_secret: '8iguKIk3J5ZVan7OHBohQm44YKE5iBmboIUm0X7zWaPw4p2Onz',
    access_token_key: '245015989-SidQW9nZ33DZpZ2z5BaEL7dxy184EEi446Qp3aMD',
    access_token_secret: '1d1GlMVDggRFsl6CuAOFVefX38WeDDhEacNcOV3vEzB2h'
});

//Listen for get request on root url. eg. http://localhost:3000
app.listen(port, () => console.log(`Hello Chris app listening on port ${port}!`))

app.get('/tweets', function (req, res) {
    let params = {
        q: '#liveperson',
        //    count: 100,
        result_type: "mixed"
    };

    client.get('search/tweets', params).catch(function (err) {
        console.log('caught error', err.stack)
    }).then(function (result) {
        for (let i = 0; i < result.statuses.length; i++) {
            let tweet = result.statuses[i];
            db.run("INSERT INTO tweets (id, username, tweet, created_on, retweet_count, favorite_count) VALUES (?,?,?,?,?,?)", [tweet.id, tweet.user.name, tweet.text, tweet.created_at, tweet.retweet_count, tweet.favorite_count], function (err) {
                if (err != null && err.code === "SQLITE_CONSTRAINT") console.log(tweet.id + " already exists in the database");
            });
        }

        db.each("SELECT * FROM tweets", function (err, row) {
            console.log("Tweet id : " + row.id, row.created_on);
        });
    });
});