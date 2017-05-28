# Reddit thread to CSV
### Recursively compiles all comments and subsequent replies in a Reddit thread to a CSV

My girlfriend needed a way to run sentiment analysis on Reddit threads in bulk, so I built this. It's a one-field web app that takes a thread ID and returns a CSV of all responses' authors, comments, and post dates.

To use, clone the repo and run `npm install`. In lines 11-16 of `index.js`, add your API credentials. I recommend Not an Aardvark's [Reddit Oauth Helper](https://devhub.io/repos/not-an-aardvark-reddit-oauth-helper) for getting these. Then run `node index.js` and browse to http://localhost:3000.

This tool uses [snoowrap](https://github.com/not-an-aardvark/snoowrap) for its API calls.