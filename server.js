const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const Twitter = require('twitter');
const bodyParser = require('body-parser')

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// open the database connection
let db = new sqlite3.Database('twitter.db');

db.run('CREATE TABLE IF NOT EXISTS tweets (id INTEGER PRIMARY KEY, username TEXT, tweet TEXT, created_on TEXT, retweet_count INTEGER, favorite_count INTEGER)');

let client = new Twitter({
    consumer_key: 'yGRbR4sGdD5ZDJYjVzrQkhsDR',
    consumer_secret: 'L5zTxOtsMtrYLzSawJ0RoFHUlrHa7qLCFwKAss64EdHS5PWsR0',
    access_token_key: '245015989-K6xJ7PYrit59mwyJRp9H0264LrvpPNxJFhmMrCY0',
    access_token_secret: 'kVQbqaKbRkDnGqHoT6DkCB22FngaBbjPw5ZuKzE9sjx6b'
});

let params = {
    q: '#liveperson',
    result_type: "recent",
    count: 100
};

client.get('search/tweets', params).catch(function (err) {
    console.log('caught error', err)
}).then(function (result) {
    for (let i = 0; i < result.statuses.length; i++) {
        let tweet = result.statuses[i];
        db.run("INSERT INTO tweets (id, username, tweet, created_on, retweet_count, favorite_count) VALUES (?,?,?,?,?,?)", [tweet.id, tweet.user.name, tweet.text, tweet.created_at, tweet.retweet_count, tweet.favorite_count], function (err) {
            if (err != null && err.code === "SQLITE_CONSTRAINT") console.log(tweet.id + " already exists in the database");
        });
    }
});

//Listen for get request on root url. eg. http://localhost:3000
app.listen(port, () => console.log(`Hello Chris app listening on port ${port}!`))

app.get('/', function (req, res) {
    db.all("SELECT * FROM tweets", function (err, rows) {
        res.render('index.ejs', {
            tweets: rows
        })
    });
});