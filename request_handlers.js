var fs = require('fs');
var exec = require("child_process").exec;
var url = require('url');
var GitHubApi = require("github");

var github = new GitHubApi({
    // required
    version: "3.0.0",
    // optional
    debug: true,
});

function authenticate(postData, request, response) {
    console.log("Request handler 'authenticate' was called.");
    github.authenticate({
        type: "basic",
        username: postData.username,
        password: postData.password
    }, function(err) {
        console.log(err);
    });

    github.user.getFollowingFromUser({
        user: postData.username
    }, function(err, res) {
        response.writeHead(200, {
            'Set-Cookie': 'zinio-merge=' + postData.username,
            "Content-Type": "application/json"
        });
        if (err != null) {
            response.write(JSON.stringify(err));
        } else {
            response.write(JSON.stringify(res));
        }
        response.end();
    });
}

function getBranches(postData, request, response) {
    github.repos.getBranches({
        user: "vaswanijitesh",
        repo: "gitfun"
    }, function(err, res) {
        response.writeHead(200, {
            "Content-Type": "application/json"
        });
        if (err != null) {
            response.write(JSON.stringify(err));
        } else {
            response.write(JSON.stringify(res));
        }
        response.end();
    });
}

function start(postData, request, response) {
    console.log("Request handler 'start' was called.");
    var stream = fs.createReadStream('index.html');
    stream.pipe(response);
}

function merge(postData, request, response) {
    console.log("Request handler 'merge' was called.");
    github.repos.getBranch({
        user: "vaswanijitesh",
        repo: "gitfun",
        branch: "master"
    }, function(err, res) {
        createReference(postData, request, response, res.commit.sha);
    });
}

function createReference(postData, request, response, masterSha) {
    console.log("Request handler 'createReference' was called by " + get_cookies(request)['zinio-merge']);
    github.gitdata.createReference({
        user: "vaswanijitesh",
        repo: "gitfun",
        ref: "refs/heads/qa/" + get_cookies(request)['zinio-merge'] + "-" + postData.branchName + "-" + getDateTime(),
        sha: masterSha
    }, function(err, res) {
        if (err != null) {
            console.log("createReference err: " + JSON.stringify(err));
            response.writeHead(err.code, {
                "Content-Type": "application/json"
            });
            response.write(JSON.stringify(err));
            response.end();
        } else {
            console.log("createReference res: " + JSON.stringify(res));
            mergeBranches(postData, request, response, res.ref);
        }

    });
}

function mergeBranches(postData, request, response, newBranch) {
    console.log("Request handler 'mergeBranches' was called by " + get_cookies(request)['zinio-merge']);
    github.repos.merge({
        user: "vaswanijitesh",
        repo: "gitfun",
        base: newBranch,
        head: "refs/heads/" + postData.branchName
    }, function(err, res) {
        console.log("mergeBranches err: " + JSON.stringify(err));
        console.log("mergeBranches res: " + JSON.stringify(res));
        if (err != null) {
            console.log("mergeBranches err: " + JSON.stringify(err));
            response.writeHead(err.code, {
                "Content-Type": "application/json"
            });
            response.write(JSON.stringify(err));
        } else {
            response.writeHead(200, {
                "Content-Type": "application/json"
            });
            console.log("mergeBranches res: " + JSON.stringify(res));
            response.write(JSON.stringify(res));
        }
        response.end();
    });
}

function createPull(postData, request, response) {
    console.log("Request handler 'createPull' was called by " + get_cookies(request)['zinio-merge']);
    github.pullRequests.create({
        user: "vaswanijitesh",
        repo: "gitfun",
        title: "" + get_cookies(request)['zinio-merge'] + " created pull request for " + postData.branchName + "",
        base: "master",
        head: "refs/heads/" + postData.branchName
    }, function(err, res) {
        console.log("mergeBranches err: " + JSON.stringify(err));
        console.log("mergeBranches res: " + JSON.stringify(res));
        if (err != null) {
            console.log("mergeBranches err: " + JSON.stringify(err));
            response.writeHead(err.code, {
                "Content-Type": "application/json"
            });
            response.write(JSON.stringify(err));
        } else {
            response.writeHead(200, {
                "Content-Type": "application/json"
            });
            console.log("mergeBranches res: " + JSON.stringify(res));
            response.write(JSON.stringify(res));
        }
        response.end();
    });
}

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    hour = (hour < 10 ? "0" : "") + hour;
    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    return year + "-" + month + "-" + day + "-" + hour + "-" + min + "-" + sec;
}

var get_cookies = function(request) {
    var cookies = {};
    if (request.headers.cookie == undefined) {
        return cookies;
    }

    request.headers && request.headers.cookie.split(';').forEach(function(cookie) {
        var parts = cookie.match(/(.*?)=(.*)$/)
        cookies[parts[1].trim()] = (parts[2] || '').trim();
    });
    return cookies;
};

exports.start = start;
exports.getBranches = getBranches;
exports.authenticate = authenticate;
exports.merge = merge;
exports.createPull = createPull;
