'use strict';

const app = require('express')();
const http = require('http').Server(app);
const express = require('express');
const nunjucks = require('nunjucks');
const snoowrap = require('snoowrap');
const json2csv = require('json2csv');
const fs = require('fs');

const r = new snoowrap({
    userAgent: 'scraper',
    clientId: '_kw55G1ZnaMxKg',
    clientSecret: 'Hwbsl9Cuv0LMhCZUa3L-LjiNvRk',
    refreshToken: '465365290-2y5YyMOOpLXvDqci78m66fEUPIQ'
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

    if (!request.query.hasOwnProperty('threadId')) {
        resolve.render('index.njk');
        return;
    }

    r.getSubmission(request.query.threadId).expandReplies({
        limit: Infinity,
        depth: Infinity
    }).then((response) => {

        let json = thread2json(response);

        let csv = json2csv({
            data: json,
            fields: ['author', 'content', 'timestamp']
        });

        // fs.writeFile('file.csv', csv, function(err) {
        //     if (err) throw err;
        //     console.log('file saved');
        // });

        resolve.set({
            "Content-Disposition": "attachment; filename=" + request.query.threadId + ".csv"
        });

        resolve.send(csv);

    });

});

app.listen(3000);


function thread2json(redditResponse) {

    let output = [
        reduceReply(redditResponse)
    ];

    for (let c = 0; c < redditResponse.comments.length; c++) {
        dig(output, redditResponse.comments[c]);
    }

    return output;

}

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

let reduceReply = function(reply) {

    let day = new Date(reply.created * 1000);

    return {
        author: reply.author.name,
        content: reply.hasOwnProperty('selftext') ? reply.selftext : reply.body,
        timestamp: day.toString()
    }
}