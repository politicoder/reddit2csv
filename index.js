'use strict';

const app = require('express')();
const http = require('http').Server(app);
const express = require('express');
const nunjucks = require('nunjucks');
const snoowrap = require('snoowrap');
const json2csv = require('json2csv');
const fs = require('fs');

const r = new snoowrap({
    userAgent: '',
    clientId: '',
    clientSecret: '',
    refreshToken: ''
});

r.config({
    requestDelay: 500
});

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use(express.static('static'));

app.get('/', (request, resolve) => {

    /* No request made yet; render the page */
    if (!request.query.hasOwnProperty('threadId')) {
        resolve.render('index.njk');
        return;
    }

    /* Request made; make the API call */
    r.getSubmission(request.query.threadId).expandReplies({
        limit: Infinity,
        depth: Infinity
    }).then((response) => {

        /* Convert response to JSON */
        let json = thread2json(response);

        /* Convert JSON to CSV */
        let csv = json2csv({
            data: json,
            fields: ['author', 'content', 'timestamp']
        });

        /* Set browser file headers */
        resolve.set({
            "Content-Disposition": "attachment; filename=" + request.query.threadId + ".csv"
        });

        /* Send CSV */
        resolve.send(csv);

    });

});

app.listen(3000);


/**
 * Converts raw reddit API response to JSON object
 *
 * @param response
 * @return object
 */

function thread2json(redditResponse) {

    let output = [
        reduceReply(redditResponse)
    ];

    for (let c = 0; c < redditResponse.comments.length; c++) {
        dig(output, redditResponse.comments[c]);
    }

    return output;

}


/**
 * Recursively adds thread responses to
 * the given container array
 */

let dig = function(container, reply) {

    if (reply.body != '[removed]' && reply.body != '[deleted]' && reply.body.length > 0) {
        container.push(reduceReply(reply));
    }

    if (reply.replies.length === 0) {
        return;
    }

    for (let r = 0; r < reply.replies.length; r++) {
        dig(container, reply.replies[r]);
    }

}


/**
 * Throws out extraneous reply info
 *
 * @param reddit reply
 * @return object
 */

let reduceReply = function(reply) {

    let day = new Date(reply.created * 1000);

    return {
        author: reply.author.name,
        content: reply.hasOwnProperty('selftext') ? reply.selftext : reply.body,
        timestamp: day.toString()
    }
}