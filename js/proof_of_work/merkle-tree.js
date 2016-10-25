var merkleTree = function(hashMethod, challenge, timestamp, difficulty) {
    var recordSeparator = String.fromCharCode(30);
    var unitSeparator = String.fromCharCode(31);
    var numberOfVerifications = 4;
    var maxByteSize = 255;
    var merkleTree = [];
    var numNodes;
    var numLeaves;
    var prefix;

    var getParent = function(index) {
        return Math.floor((index - 1)/2);
    };

    var getRoot = function() {
        return merkleTree[0];
    };

    var getLeft = function(index) {
        return 2 * index + 1;
    };

    var getRight = function (index) {
        return 2 * index + 2;
    };

    var getVerificationLeaves = function(seed) {
        var numbers = [];
        seed = atob(seed);

        while(numbers.length < numberOfVerifications) {
            var numByte = (seed.charCodeAt(numbers.length)) & 0xFF;
            var index = numByte * Math.floor(numLeaves / maxByteSize);
            numbers.push(index);
        }
        return numbers;
    };

    var findIntermediates = function(leaf) {
        var find_intermediates = [];
        var temp = leaf;
        var parent;
        while(temp > 0) {
            parent = getParent(temp);
            var left = getLeft(parent);
            var right = getRight(parent);
            var temp_intermediate = {};

            if(left === temp) {
                temp_intermediate.hash = merkleTree[right];
                temp_intermediate.left = false;
                find_intermediates.push(temp_intermediate);
            } else if(right === temp) {
                temp_intermediate.hash = merkleTree[left];
                temp_intermediate.left = true;
                find_intermediates.push(temp_intermediate);
            }
            temp = parent;
        }
        return find_intermediates;
    };

    var encodeIntermediates = function(intermediates) {
        var separator = '';
        var encodedString = '';
        for(var i = 0; i < intermediates.length; i++) {
            var intermediate = intermediates[i];
            encodedString = encodedString.concat(separator)
                .concat(intermediate['hash'])
                .concat(intermediate['left'] ? '1': '0');
            separator = unitSeparator;
        }
        return encodedString;
    };

    var createSolutionString = function() {
        var solution = '';
        var verificationLeaves = getVerificationLeaves(getRoot());
        for(var i = 0; i < verificationLeaves.length; i++) {
            var node = verificationLeaves[i];
            var leaf = node + (numNodes - numLeaves);

            var intermediates = findIntermediates(leaf);
            var encodedString = encodeIntermediates(intermediates);

            solution = solution.concat(encodedString);
            solution = solution.concat(recordSeparator);
        }
        solution = solution.concat(getRoot());

        return solution;
    };

    var generateLevel = function (start, end) {
        for(var i = start; i < end; i+= 2) {
            var left = atob(merkleTree[i]);
            var right = atob(merkleTree[i + 1]);
            var combine = left + right;
            merkleTree[getParent(i)] = getHash[hashMethod](combine, "BYTES", "B64");;
        }
    };

    var generateLeaves = function(prefix) {
        for(var i = numNodes - numLeaves; i < numNodes; i +=2) {
            var id = i - (numNodes - numLeaves);
            merkleTree[i] = getHash[hashMethod](prefix + id.toString(), "TEXT", "B64");
            merkleTree[i + 1] = getHash[hashMethod](prefix + (id + 1).toString(), "TEXT", "B64");
        }
    };

    var generateMerkleTree = function(prefix) {
        generateLeaves(prefix);

        var start = numNodes - numLeaves;
        var end = numNodes - 1;
        while(start > 0) {
            generateLevel(start, end);
            start = getParent(start);
            end = getParent(end);
        }
    };

    var compute = function(challenge, timestamp, difficulty) {
        prefix = getPrefix("MERKLE", challenge, timestamp, difficulty);
        numLeaves = Math.pow(2, difficulty);
        numNodes = 2 * numLeaves - 1;
        for(var i = 0; i < numNodes; i++) {
            merkleTree[i] = '';
        }
        generateMerkleTree(prefix);

        return createSolutionString();
    };

    return compute(challenge, timestamp, difficulty);
};