const crypto = require('crypto');

class BloomFilter {
    /**
     * @param {number} size - Size of the bit array
     * @param {number} numHashFunctions - Number of hash functions to use
     */
    constructor(size = 1000, numHashFunctions = 3) {
        this.size = size;
        this.numHashFunctions = numHashFunctions;
        // Using a simple array of booleans or integers (0/1) as BitArray for simplicity in JS
        // In a more optimize environment, we'd use a TypedArray or Buffer.
        // Let's use a Uint8Array for better memory usage than standard array.
        this.bitArray = new Uint8Array(Math.ceil(size / 8));
    }

    /**
     * Adds an item to the filter
     * @param {string} item 
     */
    add(item) {
        const hashes = this.getHashes(item);
        hashes.forEach(hash => {
            const index = hash % this.size;
            const byteIndex = Math.floor(index / 8);
            const bitIndex = index % 8;
            this.bitArray[byteIndex] |= (1 << bitIndex);
        });
    }

    /**
     * Checks if an item is in the filter
     * @param {string} item 
     * @returns {boolean} - true if item might exist, false if it definitely does not
     */
    contains(item) {
        const hashes = this.getHashes(item);
        for (let hash of hashes) {
            const index = hash % this.size;
            const byteIndex = Math.floor(index / 8);
            const bitIndex = index % 8;
            if (!(this.bitArray[byteIndex] & (1 << bitIndex))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Generates 'k' hash values for the item
     * @param {string} item 
     * @returns {number[]}
     */
    getHashes(item) {
        const hashes = [];
        // Use standard crypto hash (MD5) and slice it to simulate multiple hashes
        // OR use double hashing technique: h(i) = (h1(x) + i * h2(x)) % m

        const h1 = this.fnv1a(item);
        const h2 = this.djb2(item);

        for (let i = 0; i < this.numHashFunctions; i++) {
            // Ensure positive result
            const hash = (h1 + i * h2) % this.size;
            hashes.push(hash >= 0 ? hash : hash + this.size);
        }
        return hashes;
    }

    // FNV-1a Hash
    fnv1a(str) {
        let hash = 2166136261;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }

    // DJB2 Hash
    djb2(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
        }
        return hash >>> 0;
    }
}

module.exports = BloomFilter;
