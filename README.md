Byrd ~ Bring Your Restricted Documents
======================================

BYRD is a distributed network that allows you to share and access content with
[plausible deniability](https://en.wikipedia.org/wiki/Plausible_deniability).
Files are encrypted, shredded, and disbursed all over the network. The chunks
can be later retrieved and reassembled on your computer by using an easy to
remember "alias".

Byrd participates in a peer-to-peer network to distribute encrypted chunks of
documents amongst available peers. Byrd also serves a web interface that allows
you to choose an alias for your document, and upload the file. The interface
connects directly to the network and encrypts the file locally and breaks it
into chunks, which are then distributed. The individual nodes will only have
small, unusable pieces of the documents.

Byrd's interface also allows you reassemble the files when provided the alias
of a previously uploaded file. The alias is hashed, and the document's
blueprint is fetched, identifying the location of the individual pieces, and
the pieces are then fetched, reassembled, decrypted, and displayed or saved.

## Quick Start

Getting the code:

```
git clone https://gitlab.com/counterpoint/byrd.git && cd byrd
```

Installing the dependencies:

```
npm install --no-optional
bower install
```

Running a Byrd node:

```
npm start
```

Running a local simulation:

```
npm run simulate
```

## Configuration

Create the file config/local.json, and populate it with your config in the
following format. This will override the default options.

```
{
  "ca": [],
  "cert": null,
  "key": null,
  "seeds": [
    { "address": "byrd.io", "port": 443, "protocol": "https" }
  ],
  "address": "127.0.0.1",
  "port": 8080,
  "protocol": "http",
  "logLevel": 4,
  "datadir": "/path/to/desired/byrd.db"
}
```

## Module

Byrd is also packaged as a library, so you can use it within your own
application.

```js
var byrd = require('byrd')(config);

// distribute a file
var filename = 'myfile.txt';
var buffer = fs.readFileSync(filename);

byrd.distribute(filename, buffer, function(err, filekey) {
  console.log(err || 'Success! File lookup key is: ' + filekey);
});

// resolve a file
var filekey = 'sha256hash...';

byrd.resolve(filekey, function(err, file) {
  console.log(err || file.getContents());
});
```

This module is compatible with browserify and can be used in the browser!

## Protocol

Byrd is little more than an interface and set of validation rules that sits on
top of [Kad](https://gitlab.com/gordonhall/kad) (a distributed hash table). In
this regard, the BYRD-specific protocol can be summed up as:

```
key === hex ( sha256( filechunk ) ) &&  bytelength( filechunk ) <= 32000
```

This means that as far as storage nodes are concerned, the only rules are that
values must be less than 32kb and addressable by their hash. The distribution
and resolution magic all happens locally.

### Metadata Discovery

BYRD is designed so that any file can be fetched from the network by a unique
key. This is done by storing metadata file called "eggs" to aid peers in
discovering the location of the individual file chunks and later reassembling
them. In fact, the unique key for a file is actually the SHA-265 hash of the
smallest egg file describing it.

An egg file is a HEX-encoded JSON string with the following properties:

```
{
  "filename": "somefile.pdf",
  "hash": "<sha256_hash_target_file>",
  "chunks": [
    "<sha256_hash_of_chunk_0>",
    "<sha256_hash_of_chunk_1>",
    "<sha256_hash_of_chunk_N>"
  ]
}
```

The client fetches the chunk located at the given key. If that chunk is an egg,
then the client then fetches each chunk in the egg, concatenates them in order,
then decrypts the entire file (AES) using the hash included in the egg. If the
result is another egg file (likely the case for larger files), then the client
recursively discovers for metadata this way until the complete file is resolved.

It's eggs all the way down!

### Content Distribution

The inverse of the aforementioned flow is true for distributing a file. First,
the client loads the selected file into memory and encrypts it with the SHA-256
hash of the original file. Then, the encrypted file is sliced into 32kb chunks
(or a minimum of 10 chunks - whichever yields more chunks). Finally, the client
creates an egg file containing the metadata described above.

If the resulting egg file is less than 32kb, then it is stored by it's SHA-256
hash and that key is returned and may be used to later resolve the original
file. Contrarily, if the resulting egg file is greater than 32kb, then it the
client recursively distributes it in the same manner described above for the
original file until the resulting egg file is small enough to store at a single
key.

## License

BYRD ~ Bring Your Restricted Documents
N©! 2015  Counterpoint Hackers

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
