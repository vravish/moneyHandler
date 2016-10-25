onmessage = function(e) {
    importScripts("proof_of_work/hashcash.js", "proof_of_work/merkle-tree.js",
        "proof_of_work/common.js",  "../bower_components/jsSHA/src/sha.js", "../bower_components/jsSHA/src/sha1.js");
    var challenge = e.data[0];
    var timestamp = parseInt(e.data[1]);
    var bits = parseInt(e.data[2]);
    var result = merkleTree('sha1', challenge, timestamp, bits);
    self.postMessage(result);
    self.close();
};
