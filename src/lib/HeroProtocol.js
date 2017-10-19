// Adapted from https://github.com/nydus/heroprotocol

const fs = require('fs');
const path = require('path');
const MPQArchive = exports.MPQArchive = require('mpyqjs/mpyq').MPQArchive;
const protocol29406 = exports.protocol =  require('./Protocol29406');
const decoders = require('./ProtocolDecoders');

// parsable parts
const HEADER            = exports.HEADER            = 'header';
const DETAILS           = exports.DETAILS           = 'replay.details';
const INITDATA          = exports.INITDATA          = 'replay.initdata';
const GAME_EVENTS       = exports.GAME_EVENTS       = 'replay.game.events';
const MESSAGE_EVENTS    = exports.MESSAGE_EVENTS    = 'replay.message.events';
const TRACKER_EVENTS    = exports.TRACKER_EVENTS    = 'replay.tracker.events';
const ATTRIBUTES_EVENTS = exports.ATTRIBUTES_EVENTS = 'replay.attributes.events';

const decoderMap = {
  [HEADER]:             'decodeReplayHeader',
  [DETAILS]:            'decodeReplayDetails',
  [INITDATA]:           'decodeReplayInitdata',
  [GAME_EVENTS]:        'decodeReplayGameEvents',
  [MESSAGE_EVENTS]:     'decodeReplayMessageEvents',
  [TRACKER_EVENTS]:     'decodeReplayTrackerEvents',
  [ATTRIBUTES_EVENTS]:  'decodeReplayAttributesEvents'
};

const parseStrings = function parseStrings(data) {
  if (!data) return data;
  else if (data instanceof Buffer) return data.toString();
  else if (Array.isArray(data)) return data.map(item => parseStrings(item));
  else if (typeof data === 'object') {
    for (let key in data) {
      data[key] = parseStrings(data[key]);
    }
  }
  return data;
};

let lastUsed;

let protocolDir = ''

try {
    const app = require('electron').remote.app
    protocolDir = path.join(app.getPath('appData'), 'HotSTube', 'protocols', 'lib')
} catch (ex) {

}

class ProtocolError {
  constructor(type, version) {
    this.type = type
    this.version = version
  }
}

exports.ProtocolError = ProtocolError

exports.protocolDir = protocolDir

exports.open = function (file, noCache) {
  let archive, header;

  if (!lastUsed || !(lastUsed instanceof MPQArchive) || file !== lastUsed.filename || noCache) {

    if (typeof file === 'string') {
      try {
        if (!path.isAbsolute(file)) {
          file = path.join(process.cwd(), file);
        }
        archive = new MPQArchive(file);
        archive.filename = file;
      } catch (err) {
        lastUsed = null
        throw new ProtocolError('REPLAY_NOT_FOUND')
      }
    } else if (file instanceof MPQArchive) {
      // TODO - need to check what happens when instanciating an MPQArchive with
      // invalid path and setup an error accordingly
      archive = file;
    } else {
      lastUsed = null
      throw new ProtocolError('INVALID_REPLAY')
    }


    if (archive instanceof Error) return archive;
    lastUsed = archive;

    // parse header
    archive.data = {};
    header = archive.data[HEADER] = parseStrings(protocol29406.decodeReplayHeader(archive.header.userDataHeader.content));
    // The header's baseBuild determines which protocol to use
    archive.baseBuild = header.m_version.m_baseBuild;

    try {
      archive.protocol = new Function('decoders',
        fs.readFileSync(`${exports.protocolDir}/protocol${archive.baseBuild}.js`)
      )(decoders)
    } catch(ex) {
      lastUsed = null
      throw new ProtocolError('PROTOCOL_MISSING', archive.baseBuild)
    }

    // set header to proper protocol
    archive.data[HEADER] = parseStrings(archive.protocol.decodeReplayHeader(archive.header.userDataHeader.content));

    archive.get = function (file) {
      return exports.get(file, archive);
    };

  } else {
    // load archive from cache
    archive = lastUsed;
  }

  return archive;
};

// returns the content of a file in a replay archive
exports.get = function (archiveFile, archive, keys) {
  let data;
  archive = exports.open(archive);

  if (archive instanceof Error) {
    return data;
  }

  if (archive.data[archiveFile] && !keys) {
    data = archive.data[archiveFile];
  } else {
    if (archive.protocol) {

      if ([DETAILS, INITDATA, ATTRIBUTES_EVENTS].indexOf(archiveFile) > -1) {
        data = archive.data[archiveFile] =
          parseStrings(archive.protocol[decoderMap[archiveFile]](
            archive.readFile(archiveFile)
          ));
      } else if ([GAME_EVENTS, MESSAGE_EVENTS, TRACKER_EVENTS].indexOf(archiveFile) > -1) {

        if (keys) {
          // protocol function to call is a generator
          data = [];
          for (let event of archive.protocol[decoderMap[archiveFile]](archive.readFile(archiveFile))) {

            keyLoop:
            // check validity with whitelisted keys
            for (var key in keys) {
              for (var i = 0, j = keys[key].length; i < j; i++) {
                if (parseStrings(event)[key] === keys[key][i]){
                    data.push(parseStrings(event));
                    break keyLoop;
                }
              }
            }

          }

        } else {
          data = archive.data[archiveFile] = [];
          for (let event of archive.protocol[decoderMap[archiveFile]](archive.readFile(archiveFile))) {
            data.push(parseStrings(event));
          }
        }

      }

    }
  }

  return data;
};

/**
 * parses a basic MPQ header
 * @function
 * @param {buffer} buffer - Header content from MPQ archive
 * @returns {object} Header information from file
 */
exports.parseHeader = function (buffer) {
  return parseStrings(protocol29406.decodeReplayHeader(buffer));
};

/**
 * parses a buffer based on a given build
 * @function
 * @param {string} filename - Name of the file to assist in parsing
 * @param {buffer} buffer - Binary file contents from MPQ archive
 * @param {string} build - Build in which to parse the contents
 * @returns {object} File contents
 */
exports.parseFile = function (filename, buffer, build) {
  let data, protocol;

  try {
    protocol = new Function('decoders',
      fs.readFileSync(`${exports.protocolDir}/protocol${build}.js`, err => {
        console.log(err)
      })
    )(decoders)
  } catch (err) {
    return undefined;
  }

  if ([DETAILS, INITDATA, ATTRIBUTES_EVENTS].indexOf(filename) > -1) {
    data = parseStrings(protocol[decoderMap[filename]](buffer));
  } else if ([GAME_EVENTS, MESSAGE_EVENTS, TRACKER_EVENTS].indexOf(filename) > -1) {
    data = [];
    for (let event of protocol[decoderMap[filename]](buffer)) {
      data.push(parseStrings(event));
    }
  }

  return data;
};