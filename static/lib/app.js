'use strict';

byrd.queuedFiles = null;

document.addEventListener('DOMContentLoaded', function() {

  var chomper = new byrd.Chomper();
  var shredForm = document.getElementById('shred-form');
  var unshredForm = document.getElementById('unshred-form');
  var dropzone = document.getElementById('dropzone');
  var statusline = new byrd.StatusLine();
  var fileInput = document.getElementById('file');
  var nameFields = document.getElementById('distribute-name-fields');
  var goback = document.getElementById('goto-dropzone');
  var search = document.getElementById('byrd-search');
  var searchInput = document.getElementById('unshred-blueprint-name');
  var suggestions = document.getElementsByClassName('suggestion');

  // toggles between file dropzone and file naming form
  function toggleDropzoneNaming() {
    if (!dropzone.getAttribute('style')) {
      dropzone.setAttribute('style', 'display:none');
    } else {
      dropzone.removeAttribute('style');
    }

    if (!nameFields.getAttribute('style')) {
      nameFields.setAttribute('style', 'display:none');
    } else {
      nameFields.removeAttribute('style');
    }
  };

  // do not hard submit search form, but trigger the search action
  search.addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('search-button').click();
  });

  // allow user to go back from the naming form
  goback.addEventListener('click', function(e) {
    e.preventDefault();
    toggleDropzoneNaming();
  });

  // when we get a new file, show the naming form
  fileInput.addEventListener('change', function(e) {
    toggleDropzoneNaming();
    byrd.queuedFiles = this.files;
    e.preventDefault();
  });

  // trigger file dialog when user clicks on the dropzone
  dropzone.addEventListener('click', function(e) {
    document.getElementById('file').click();
  });

  // when user drops file into dropzone, populate the hidden file input with
  // the file dropped
  dropzone.addEventListener('drop', function(e) {
    var files = e.dataTransfer.files;
    var input = document.getElementById('file');

    byrd.queuedFiles = files;
    toggleDropzoneNaming();
    e.preventDefault();
    this.removeAttribute('class');
    return false;
  });

  // styling on file drag over dropzone
  dropzone.addEventListener('dragover', function(e) {
    this.setAttribute('class', 'hover');
  });

  // styling on file drag leaving dropzone
  dropzone.addEventListener('dragleave', function(e) {
    this.removeAttribute('class');
  });

  // do not perform hard submit
  shredForm.addEventListener('submit', function(e) {
    e.preventDefault();
  });

  // prevent default browser drag/drop behavior
  window.addEventListener('dragover',function(e){
    e.preventDefault();
  }, false);

  // prevent default browser drag/drop behavior
  window.addEventListener('drop',function(e){
    e.preventDefault();
  }, false);

  // iterate over all listed suggestions and setup click handler to populate
  // the search input field with the suggestion value
  for (var s = 0; s < suggestions.length; s++) {
    suggestions[s].addEventListener('click', function(e) {
      e.preventDefault();
      searchInput.value = this.innerHTML;
    });
  }

  // shred and distribute a file across network using the API, then publish the
  // file blueprint by it's hash, followed by distributing the blueprint hash
  // addressable by the given alias name
  shredForm.addEventListener('submit', function() {
    var chunksStarted = 0;
    var chunksDistributed = 0;
    var input = document.getElementById('file');
    var file = byrd.queuedFiles[0];
    var shredder = new byrd.Shredder(file);
    var blueprintName = document.getElementById('blueprint-name').value;
    var nameParts = shredder._file.name.split('.');
    var ext = nameParts[nameParts.length - 1];

    chomper.start();
    shredder.shred(distributeChunks);

    // store all the file chunks
    function distributeChunks(err, chunks) {
      statusline.setStatus('success', 'File shredded into ' + chunks.length + ' chunks!');
      async.mapLimit(chunks, 4, storeFileChunk, storeBlueprint);

      // store a single file chunk
      function storeFileChunk(chunk, done) {
        chunksStarted++;
        var hash = sha256(new Buffer(chunk, 'base64')).toString('base64');

        statusline.setStatus('working', 'Distributed ' + chunksDistributed +
                             ' of ' + chunks.length + ' chunks.');

        byrd.dht.put(hash, chunk, function(err) {
          chunksDistributed++;
          done(err, hash);
        });
      }
    }

    // store the file blueprint
    function storeBlueprint(err, chunkHashes) {
      if (err) {
        chomper.stop();
        return statusline.setStatus('failed', 'Failed to distribute all chunks.');
      }

      var blueprint = new byrd.Blueprint(chunkHashes, shredder.getMetadata(), shredder.getHash(), ext);
      var blueprintHash = sha256(new Buffer(JSON.stringify(blueprint), 'base64')).toString('base64');

      statusline.setStatus('working', 'Distributing file blueprint...');

      byrd.dht.put(blueprintHash, JSON.stringify(blueprint), storeAliasName);

      // store alias to file blueprint
      function storeAliasName(err, result) {
        if (err) {
          chomper.stop()();
          return statusline.setStatus('failed', 'Failed to distribute file blueprint!');
        }

        statusline.setStatus('working', 'Registering alias name for file blueprint...');

        byrd.dht.put(blueprintName, blueprintHash, function(err){
          chomper.stop();

          if (err) {
            return statusline.setStatus('failed', 'Failed to register alias name for file blueprint!');
          }

          statusline.setStatus('success', 'File encrypted, shredded, and distributed. Share your alias name!');
        });
      }
    }
  });

  // query the network via the API for a blueprint key using the given alias
  // name, then using the returned hash, lookup the file blueprint and use it
  // to resolve the individual chunks, then unshred them and make the file
  // available for download
  unshredForm.addEventListener('submit', function() {
    var blueprintName = document.getElementById('unshred-blueprint-name').value;
    var container = document.getElementById('downloadme');

    // clear the previous download button
    container.innerHTML = '';

    statusline.setStatus('working', 'Querying network for file blueprint...');
    byrd.dht.get(blueprintName, lookupBlueprintHash);

    // query network for the blueprint hash associated with a given name
    function lookupBlueprintHash(err, blueprintHash) {
      if (err) {
        return statusline.setStatus('failed', 'Failed to lookup blueprint location!');
      }

      if (!blueprintHash) {
        return statusline.setStatus('failed', 'Could not find data for: ' + blueprintName);
      }

      statusline.setStatus('working', 'Querying peers for file blueprint...');
      byrd.dht.get(blueprintHash, lookupBlueprint);
    }

    // using the blueprint hash, lookup the file blueprint
    function lookupBlueprint(err, result) {
      if (err) {
        return statusline.setStatus('failed', 'Failed to find file blueprint!');
      }

      var numChunksReceived = 0;
      var blueprint = JSON.parse(result);
      var shredder = new byrd.Shredder();

      statusline.setStatus('working', 'Got file blueprint, querying peers for chunks...');
      async.mapLimit(blueprint.chunkHashes, 15, fetchFileChunkByHash, assembleFileChunks);

      function fetchFileChunkByHash(hash, done) {
        byrd.dht.get(hash, function(err, result){
          numChunksReceived++;
          statusline.setStatus('working', 'Recieved file chunk ' +
                               numChunksReceived + ' of ' +
                               blueprint.chunkHashes.length);
          done(err, result);
        });
      }

      function assembleFileChunks(err, chunks) {
        if (err) {
          return statusline.setStatus('failed', 'Failed to resolve all file chunks!');
        }

        statusline.setStatus('working', 'Assembling file chunks and decrypting...');
        shredder.unshred(blueprint.fileHash, chunks, presentDownloadButtom);
      }

      function presentDownloadButtom(err, url) {
        if (err) {
          return statusline.setStatus('failed', 'Failed to assemble file chunks and decrypt!');
        }

        var filename = blueprint.ext ? (blueprintName + '.' + blueprint.ext) : null;
        var dataURI = blueprint.metadata + ',' + url;
        var downloadLink = shredder.getDownloadLink(dataURI, filename);

        statusline.setStatus('success', 'File resolved! Thank you, come again!');

        container.innerHTML = '';
        container.appendChild(downloadLink);
      }
    }
  });
});
