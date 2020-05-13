import './main-17127497.js';
import './events-767f970f.js';
import { B as Buffer$2 } from './buffer-es6-e564b388.js';
import './__node-resolve:empty-4a191708.js';
import { s as safeBuffer, b as browser, a as assert, e as elliptic } from './index-870d59f6.js';
import { r as require$$1 } from './empty-685d0a86.js';
import { e as ethUtil } from './index-f995430e.js';

// base-x encoding / decoding
// Copyright (c) 2018 base-x contributors
// Copyright (c) 2014-2018 The Bitcoin Core developers (base58.cpp)
// Distributed under the MIT software license, see the accompanying
// file LICENSE or http://www.opensource.org/licenses/mit-license.php.
// @ts-ignore
var _Buffer = safeBuffer.Buffer;
function base (ALPHABET) {
  if (ALPHABET.length >= 255) { throw new TypeError('Alphabet too long') }
  var BASE_MAP = new Uint8Array(256);
  for (var j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (var i = 0; i < ALPHABET.length; i++) {
    var x = ALPHABET.charAt(i);
    var xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) { throw new TypeError(x + ' is ambiguous') }
    BASE_MAP[xc] = i;
  }
  var BASE = ALPHABET.length;
  var LEADER = ALPHABET.charAt(0);
  var FACTOR = Math.log(BASE) / Math.log(256); // log(BASE) / log(256), rounded up
  var iFACTOR = Math.log(256) / Math.log(BASE); // log(256) / log(BASE), rounded up
  function encode (source) {
    if (Array.isArray(source) || source instanceof Uint8Array) { source = _Buffer.from(source); }
    if (!_Buffer.isBuffer(source)) { throw new TypeError('Expected Buffer') }
    if (source.length === 0) { return '' }
        // Skip & count leading zeroes.
    var zeroes = 0;
    var length = 0;
    var pbegin = 0;
    var pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
        // Allocate enough space in big-endian base58 representation.
    var size = ((pend - pbegin) * iFACTOR + 1) >>> 0;
    var b58 = new Uint8Array(size);
        // Process the bytes.
    while (pbegin !== pend) {
      var carry = source[pbegin];
            // Apply "b58 = b58 * 256 + ch".
      var i = 0;
      for (var it1 = size - 1; (carry !== 0 || i < length) && (it1 !== -1); it1--, i++) {
        carry += (256 * b58[it1]) >>> 0;
        b58[it1] = (carry % BASE) >>> 0;
        carry = (carry / BASE) >>> 0;
      }
      if (carry !== 0) { throw new Error('Non-zero carry') }
      length = i;
      pbegin++;
    }
        // Skip leading zeroes in base58 result.
    var it2 = size - length;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
        // Translate the result into a string.
    var str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) { str += ALPHABET.charAt(b58[it2]); }
    return str
  }
  function decodeUnsafe (source) {
    if (typeof source !== 'string') { throw new TypeError('Expected String') }
    if (source.length === 0) { return _Buffer.alloc(0) }
    var psz = 0;
        // Skip leading spaces.
    if (source[psz] === ' ') { return }
        // Skip and count leading '1's.
    var zeroes = 0;
    var length = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
        // Allocate enough space in big-endian base256 representation.
    var size = (((source.length - psz) * FACTOR) + 1) >>> 0; // log(58) / log(256), rounded up.
    var b256 = new Uint8Array(size);
        // Process the characters.
    while (source[psz]) {
            // Decode character
      var carry = BASE_MAP[source.charCodeAt(psz)];
            // Invalid character
      if (carry === 255) { return }
      var i = 0;
      for (var it3 = size - 1; (carry !== 0 || i < length) && (it3 !== -1); it3--, i++) {
        carry += (BASE * b256[it3]) >>> 0;
        b256[it3] = (carry % 256) >>> 0;
        carry = (carry / 256) >>> 0;
      }
      if (carry !== 0) { throw new Error('Non-zero carry') }
      length = i;
      psz++;
    }
        // Skip trailing spaces.
    if (source[psz] === ' ') { return }
        // Skip leading zeroes in b256.
    var it4 = size - length;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    var vch = _Buffer.allocUnsafe(zeroes + (size - it4));
    vch.fill(0x00, 0, zeroes);
    var j = zeroes;
    while (it4 !== size) {
      vch[j++] = b256[it4++];
    }
    return vch
  }
  function decode (string) {
    var buffer = decodeUnsafe(string);
    if (buffer) { return buffer }
    throw new Error('Non-base' + BASE + ' character')
  }
  return {
    encode: encode,
    decodeUnsafe: decodeUnsafe,
    decode: decode
  }
}
var src = base;

var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

var bs58 = src(ALPHABET);

var Buffer = safeBuffer.Buffer;

var base$1 = function (checksumFn) {
  // Encode a buffer as a base58-check encoded string
  function encode (payload) {
    var checksum = checksumFn(payload);

    return bs58.encode(Buffer.concat([
      payload,
      checksum
    ], payload.length + 4))
  }

  function decodeRaw (buffer) {
    var payload = buffer.slice(0, -4);
    var checksum = buffer.slice(-4);
    var newChecksum = checksumFn(payload);

    if (checksum[0] ^ newChecksum[0] |
        checksum[1] ^ newChecksum[1] |
        checksum[2] ^ newChecksum[2] |
        checksum[3] ^ newChecksum[3]) return

    return payload
  }

  // Decode a base58-check encoded string to a buffer, no result if checksum is wrong
  function decodeUnsafe (string) {
    var buffer = bs58.decodeUnsafe(string);
    if (!buffer) return

    return decodeRaw(buffer)
  }

  function decode (string) {
    var buffer = bs58.decode(string);
    var payload = decodeRaw(buffer);
    if (!payload) throw new Error('Invalid checksum')
    return payload
  }

  return {
    encode: encode,
    decode: decode,
    decodeUnsafe: decodeUnsafe
  }
};

// SHA256(SHA256(buffer))
function sha256x2 (buffer) {
  var tmp = browser('sha256').update(buffer).digest();
  return browser('sha256').update(tmp).digest()
}

var bs58check = base$1(sha256x2);

var Buffer$1 = safeBuffer.Buffer;




var MASTER_SECRET = Buffer$1.from('Bitcoin seed', 'utf8');
var HARDENED_OFFSET = 0x80000000;
var LEN = 78;

// Bitcoin hardcoded by default, can use package `coininfo` for others
var BITCOIN_VERSIONS = {private: 0x0488ADE4, public: 0x0488B21E};

function HDKey (versions) {
  this.versions = versions || BITCOIN_VERSIONS;
  this.depth = 0;
  this.index = 0;
  this._privateKey = null;
  this._publicKey = null;
  this.chainCode = null;
  this._fingerprint = 0;
  this.parentFingerprint = 0;
}

Object.defineProperty(HDKey.prototype, 'fingerprint', { get: function () { return this._fingerprint } });
Object.defineProperty(HDKey.prototype, 'identifier', { get: function () { return this._identifier } });
Object.defineProperty(HDKey.prototype, 'pubKeyHash', { get: function () { return this.identifier } });

Object.defineProperty(HDKey.prototype, 'privateKey', {
  get: function () {
    return this._privateKey
  },
  set: function (value) {
    assert.equal(value.length, 32, 'Private key must be 32 bytes.');
    assert(elliptic.privateKeyVerify(value) === true, 'Invalid private key');

    this._privateKey = value;
    this._publicKey = elliptic.publicKeyCreate(value, true);
    this._identifier = hash160(this.publicKey);
    this._fingerprint = this._identifier.slice(0, 4).readUInt32BE(0);
  }
});

Object.defineProperty(HDKey.prototype, 'publicKey', {
  get: function () {
    return this._publicKey
  },
  set: function (value) {
    assert(value.length === 33 || value.length === 65, 'Public key must be 33 or 65 bytes.');
    assert(elliptic.publicKeyVerify(value) === true, 'Invalid public key');

    this._publicKey = elliptic.publicKeyConvert(value, true); // force compressed point
    this._identifier = hash160(this.publicKey);
    this._fingerprint = this._identifier.slice(0, 4).readUInt32BE(0);
    this._privateKey = null;
  }
});

Object.defineProperty(HDKey.prototype, 'privateExtendedKey', {
  get: function () {
    if (this._privateKey) return bs58check.encode(serialize(this, this.versions.private, Buffer$1.concat([Buffer$1.alloc(1, 0), this.privateKey])))
    else return null
  }
});

Object.defineProperty(HDKey.prototype, 'publicExtendedKey', {
  get: function () {
    return bs58check.encode(serialize(this, this.versions.public, this.publicKey))
  }
});

HDKey.prototype.derive = function (path) {
  if (path === 'm' || path === 'M' || path === "m'" || path === "M'") {
    return this
  }

  var entries = path.split('/');
  var hdkey = this;
  entries.forEach(function (c, i) {
    if (i === 0) {
      assert(/^[mM]{1}/.test(c), 'Path must start with "m" or "M"');
      return
    }

    var hardened = (c.length > 1) && (c[c.length - 1] === "'");
    var childIndex = parseInt(c, 10); // & (HARDENED_OFFSET - 1)
    assert(childIndex < HARDENED_OFFSET, 'Invalid index');
    if (hardened) childIndex += HARDENED_OFFSET;

    hdkey = hdkey.deriveChild(childIndex);
  });

  return hdkey
};

HDKey.prototype.deriveChild = function (index) {
  var isHardened = index >= HARDENED_OFFSET;
  var indexBuffer = Buffer$1.allocUnsafe(4);
  indexBuffer.writeUInt32BE(index, 0);

  var data;

  if (isHardened) { // Hardened child
    assert(this.privateKey, 'Could not derive hardened child key');

    var pk = this.privateKey;
    var zb = Buffer$1.alloc(1, 0);
    pk = Buffer$1.concat([zb, pk]);

    // data = 0x00 || ser256(kpar) || ser32(index)
    data = Buffer$1.concat([pk, indexBuffer]);
  } else { // Normal child
    // data = serP(point(kpar)) || ser32(index)
    //      = serP(Kpar) || ser32(index)
    data = Buffer$1.concat([this.publicKey, indexBuffer]);
  }

  var I = require$$1.createHmac('sha512', this.chainCode).update(data).digest();
  var IL = I.slice(0, 32);
  var IR = I.slice(32);

  var hd = new HDKey(this.versions);

  // Private parent key -> private child key
  if (this.privateKey) {
    // ki = parse256(IL) + kpar (mod n)
    try {
      hd.privateKey = elliptic.privateKeyTweakAdd(this.privateKey, IL);
      // throw if IL >= n || (privateKey + IL) === 0
    } catch (err) {
      // In case parse256(IL) >= n or ki == 0, one should proceed with the next value for i
      return this.deriveChild(index + 1)
    }
  // Public parent key -> public child key
  } else {
    // Ki = point(parse256(IL)) + Kpar
    //    = G*IL + Kpar
    try {
      hd.publicKey = elliptic.publicKeyTweakAdd(this.publicKey, IL, true);
      // throw if IL >= n || (g**IL + publicKey) is infinity
    } catch (err) {
      // In case parse256(IL) >= n or Ki is the point at infinity, one should proceed with the next value for i
      return this.deriveChild(index + 1)
    }
  }

  hd.chainCode = IR;
  hd.depth = this.depth + 1;
  hd.parentFingerprint = this.fingerprint;// .readUInt32BE(0)
  hd.index = index;

  return hd
};

HDKey.prototype.sign = function (hash) {
  return elliptic.sign(hash, this.privateKey).signature
};

HDKey.prototype.verify = function (hash, signature) {
  return elliptic.verify(hash, signature, this.publicKey)
};

HDKey.prototype.wipePrivateData = function () {
  if (this._privateKey) require$$1.randomBytes(this._privateKey.length).copy(this._privateKey);
  this._privateKey = null;
  return this
};

HDKey.prototype.toJSON = function () {
  return {
    xpriv: this.privateExtendedKey,
    xpub: this.publicExtendedKey
  }
};

HDKey.fromMasterSeed = function (seedBuffer, versions) {
  var I = require$$1.createHmac('sha512', MASTER_SECRET).update(seedBuffer).digest();
  var IL = I.slice(0, 32);
  var IR = I.slice(32);

  var hdkey = new HDKey(versions);
  hdkey.chainCode = IR;
  hdkey.privateKey = IL;

  return hdkey
};

HDKey.fromExtendedKey = function (base58key, versions) {
  // => version(4) || depth(1) || fingerprint(4) || index(4) || chain(32) || key(33)
  versions = versions || BITCOIN_VERSIONS;
  var hdkey = new HDKey(versions);

  var keyBuffer = bs58check.decode(base58key);

  var version = keyBuffer.readUInt32BE(0);
  assert(version === versions.private || version === versions.public, 'Version mismatch: does not match private or public');

  hdkey.depth = keyBuffer.readUInt8(4);
  hdkey.parentFingerprint = keyBuffer.readUInt32BE(5);
  hdkey.index = keyBuffer.readUInt32BE(9);
  hdkey.chainCode = keyBuffer.slice(13, 45);

  var key = keyBuffer.slice(45);
  if (key.readUInt8(0) === 0) { // private
    assert(version === versions.private, 'Version mismatch: version does not match private');
    hdkey.privateKey = key.slice(1); // cut off first 0x0 byte
  } else {
    assert(version === versions.public, 'Version mismatch: version does not match public');
    hdkey.publicKey = key;
  }

  return hdkey
};

HDKey.fromJSON = function (obj) {
  return HDKey.fromExtendedKey(obj.xpriv)
};

function serialize (hdkey, version, key) {
  // => version(4) || depth(1) || fingerprint(4) || index(4) || chain(32) || key(33)
  var buffer = Buffer$1.allocUnsafe(LEN);

  buffer.writeUInt32BE(version, 0);
  buffer.writeUInt8(hdkey.depth, 4);

  var fingerprint = hdkey.depth ? hdkey.parentFingerprint : 0x00000000;
  buffer.writeUInt32BE(fingerprint, 5);
  buffer.writeUInt32BE(hdkey.index, 9);

  hdkey.chainCode.copy(buffer, 13);
  key.copy(buffer, 45);

  return buffer
}

function hash160 (buf) {
  var sha = require$$1.createHash('sha256').update(buf).digest();
  return require$$1.createHash('ripemd160').update(sha).digest()
}

HDKey.HARDENED_OFFSET = HARDENED_OFFSET;
var hdkey = HDKey;

var publicToAddress = undefined,
    toChecksumAddress = undefined;
var numberToGet = 5;

function generateAddresses(account, offset) {
  var publicKey = account.publicKey,
      chainCode = account.chainCode,
      path = account.path;
  var hdk = new hdkey();
  hdk.publicKey = new Buffer$2(publicKey, 'hex');
  hdk.chainCode = new Buffer$2(chainCode, 'hex');
  var addresses = [];

  for (var i = offset; i < numberToGet + offset; i++) {
    var dkey = hdk.deriveChild(i);
    var address = publicToAddress(dkey.publicKey, true).toString('hex');
    addresses.push({
      dPath: "".concat(path, "/").concat(i),
      address: toChecksumAddress(address)
    });
  }

  return addresses;
}

function isValidPath(path) {
  var parts = path.split('/');

  if (parts[0] !== 'm') {
    return false;
  }

  if (parts[1] !== "44'") {
    return false;
  }

  if (parts[2] !== "60'" && parts[2] !== "1'") {
    return false;
  }

  if (parts[3] === undefined) {
    return true;
  }

  var accountFieldDigit = Number(parts[3][0]);

  if (isNaN(accountFieldDigit) || accountFieldDigit < 0 || parts[3][1] !== "'") {
    return false;
  }

  if (parts[4] === undefined) {
    return true;
  }

  var changeFieldDigit = Number(parts[4][0]);

  if (isNaN(changeFieldDigit) || changeFieldDigit < 0) {
    return false;
  }

  if (parts[5] === undefined) {
    return true;
  }

  var addressFieldDigit = Number(parts[5][0]);

  if (isNaN(addressFieldDigit) || addressFieldDigit < 0) {
    return false;
  }

  return true;
}

export { generateAddresses, isValidPath };
