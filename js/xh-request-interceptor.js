window.protected_apis = {};
xhook.before(function(request, callback) {

    // Ignoring the call if is the solution request
    if(window.protected_apis[request.url] === request.method) {
        window.protected_apis[request.url] = null;
        callback();
    } else {
        window.protected_apis[request.url] = request.method;
        // Requesting with original parameters to check if it is POW protected
        var challengeXhr = new XMLHttpRequest();

        challengeXhr.onreadystatechange = function () {

            // Parsing the POW challenge headers
            var challenge = decodeURIComponent(challengeXhr.getResponseHeader("Pow-Challenge"));

            var regex = /^(\w+)[\x1E](\d+)[\x1E](\d+)[\x1E](\S+)$/g;
            var match = regex.exec(challenge);

            // Checking if POW challenge parameters are present and if a 400 was received
            if (challengeXhr.readyState === 4 && challengeXhr.status === 400 && match !== null) {
                var challengeString = match[1];
                var timestamp = match[2];
                var difficulty = match[3];

                request.headers['Pow-Challenge'] = encodeURIComponent(challenge);

                // Solve solution in a WebWorker if compatible, else solve for POW solution on the main thread
                var solution = '';
                if (window.Worker) {
                    var myWorker = new Worker('js/worker.js');

                    // Function handler for when something goes wrong in the web worker
                    myWorker.onerror = function (event) {
                        throw new Error(event.message + " (" + event.filename + ":" + event.lineno + ")");
                    };

                    // Function handler for when the main thread receives a message from the WebWorker
                    myWorker.onmessage = function (e) {
                        solution = e.data;
                        request.headers['Pow-Solution'] = encodeURIComponent(solution);
                        callback();
                    };

                    // Posting the challenge parameters to the web worker to compute the POW solution
                    myWorker.postMessage([challengeString, timestamp, difficulty]);
                } else {
                    solution = merkleTree('sha1', challengeString, timestamp, difficulty);
                    request.headers['Pow-Solution'] = encodeURIComponent(solution);
                    callback();
                }
            } else if(challengeXhr.readyState === 4) {
                window.protected_apis[request.url] = null;
                callback({
                    status: challengeXhr.status,
                    statusText: challengeXhr.statusText,
                    text: challengeXhr.responseText,
                    headers: challengeXhr.getAllResponseHeaders(),
                    xml: challengeXhr.responseXML,
                    data: challengeXhr.response
                });
            }
        };

        // Intercepting and making original request
        challengeXhr.open(request.method, request.url, true, request.user, request.pass);
        challengeXhr.setRequestHeader("Content-Type", "application/json");
        challengeXhr.send(request.body || {});
    }
});
