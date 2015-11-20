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
  "ssl": false,
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
