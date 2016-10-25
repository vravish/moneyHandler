/**
 * Created by kishorenarendran on 7/22/16.
 */
var getHash = {
    sha1: function(header, input, output) {
        var shaObj = new jsSHA("SHA-1", input);
        shaObj.update(header);
        return shaObj.getHash(output);
    },
    sha256: function(header, input, output) {
        var shaObj = new jsSHA("SHA-256", input);
        shaObj.update(header);
        return shaObj.getHash(output);
    },
    sha512: function(header, input, output) {
        var shaObj = new jsSHA("SHA-512", input);
        shaObj.update(header);
        return shaObj.getHash(output);
    }
};

const SEPARATOR = ':';
const VERSION = {
    'HASHCASH': '1',
    'MERKLE': '2'
};

var getPrefix = function(powType, challenge, timestamp, difficulty) {
    return VERSION[powType] + SEPARATOR +
        difficulty.toString() + SEPARATOR +
        timestamp.toString() + SEPARATOR +
        challenge.toString() + SEPARATOR +
        SEPARATOR + SEPARATOR;
};

