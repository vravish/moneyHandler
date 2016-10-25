## Proof of Work Demo

This demo app uses AngularJS and connects to the secured API, located at http://apigee-bench-prod.e2e.apigee.net/test-java-callout. It asks the user to provide his name, desired coffee type, and how much he likes coffee, and POST it to the server. The Edge proxy will decide, based on the sophistication, how long to make the user wait (see the spinner) before requesting a coffee bag, and will tell him that he did not get one if the 100 bags are already gone.

### Install Dependencies
```
bower install
```

If you do not have bower, the package manager for the web, get it [here](https://bower.io/).

### The Interceptor

`xh-request-interceptor.js` is the interceptor script that uses [XHook](https://github.com/jpillora/xhook) to intercept
all AJAX requests, and check if they are proof of work protected API requests and accordingly intercepts them and performs
POW, and submits a challenge to gain access to the actual APIs response.

### The Proof of Work Scripts

All the scripts inside the directory `js/proof_of_work` are the ones that actually perform the proof of work. The two Proof
of Work mechanisms that have been built in this js library are:
1. HashCash - Find more information [here](https://en.wikipedia.org/wiki/Hashcash)
2. Merkle Tree - Find more information [here](https://revision.aeip.apigee.net/guardians/POWRateLimiting/blob/master/merkletree.md)

### Running the demo

To run this, you may double-click the HTML file (index.html) or start an HTTP server (e.g. using the command `http-server`) from the coffee-demo-frontend directory and navigate to http://localhost:8080. If you don't have `http-server`, then run `npm install -g http-server` to install it. The graphs that show how many people have chosen each type of coffee and how many people come from each sophistication are available at type-graph.html, and include a button to reset the demo.