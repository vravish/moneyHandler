var hashCash = function(hashMethod, challenge, timestamp, difficulty) {
    var verify = function(hash, bits) {
        var zeros = 0;
        var i;
        for(i = 0; i < hash.length; i++) {
            if(hash.charAt(i) == '0') {
                zeros += 4;
                if(zeros >= bits) {
                    return true;
                }
            } else {
                switch(hash.charAt(i).toUpperCase()) {
                    case '1': zeros += 3; break;
                    case '2' || '3': zeros += 2; break;
                    case '4' || '5' || '6' || '7': zeros += 1; break;
                    case '8' || '9' || 'A' || 'B' || 'C' || 'D' || 'E' || 'F' : break;
                }
                break;
            }
        }
        return zeros >= bits;
    };

    var compute = function(challenge, timestamp, difficulty) {
        var counter = 0;
        var hash, header;
        do {
            header = getPrefix('HASHCASH', challenge, timestamp, difficulty).concat(counter);
            hash = getHash[hashMethod](header, "TEXT", "HEX");
            counter++;
        } while (!verify(hash, difficulty));
        return header;
    };

    return compute(challenge, timestamp, difficulty);
};