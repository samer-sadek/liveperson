const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const Twitter = require('twitter');
const bodyParser = require('body-parser')

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// open the database connection
let db = new sqlite3.Database('twitter.db');

// create database table if doesn't exist
db.run('CREATE TABLE IF NOT EXISTS tweets (id INTEGER PRIMARY KEY, username TEXT, tweet TEXT, created_on TEXT, retweet_count INTEGER, favorite_count INTEGER)');

let client = new Twitter({
    // You can use the below keys which will be revoked once project reviewed
    consumer_key: 'yGRbR4sGdD5ZDJYjVzrQkhsDR',
    consumer_secret: 'L5zTxOtsMtrYLzSawJ0RoFHUlrHa7qLCFwKAss64EdHS5PWsR0',
    access_token_key: '245015989-K6xJ7PYrit59mwyJRp9H0264LrvpPNxJFhmMrCY0',
    access_token_secret: 'kVQbqaKbRkDnGqHoT6DkCB22FngaBbjPw5ZuKzE9sjx6b'
});

let params = {
    // Search Hashtag can be changed here
    q: '#liveperson',
    result_type: "popular",
    count: 100
};
// Looping twitter response and insert to the database table
// Using Twitter ID as primary key, if exist will give an error and skip
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
app.listen(port, () => console.log(`Hello Chris please open this: http://localhost:3000`))

//Select and render data
app.get('/', function (req, res) {
    db.all("SELECT * FROM tweets", function (err, rows) {
        res.render('index.ejs', {
            tweets: rows
        })
    });
});