Byrd ~ Bring Your Restricted Documents
======================================

BYRD is a distributed network that allows you to share and access content with [plausible deniability](https://en.wikipedia.org/wiki/Plausible_deniability). Files are encrypted, shredded, and disbursed all over the network. The chunks can be later retrieved and reassembled on your computer by using an easy to remember "alias".

Byrd participates in a peer-to-peer network to distribute encrypted chunks of documents amongst available peers. Byrd also serves a web interface that allows you to choose an alias for your document, and upload the file. The interface connects directly to the network and encrypts the file locally and breaks it into chunks, which are then distributed. The individual nodes will only have small, unusable pieces of the documents.

Byrd's interface also allows you reassemble the files when provided the alias of a previously uploaded file. The alias is hashed, and the document's blueprint is fetched, identifying the location of the individual pieces, and the pieces are then fetched, reassembled, decrypted, and displayed or saved.

## Quick Start

Getting the code:

```
git clone https://gitlab.com/counterpoint/byrd.git && cd counterpoint
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

Create the file config/local.json, and populate it with your config in the following format. This will override the default options.

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
