// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var path = require('path');

var jsonfile = require('jsonfile');

var utils = require('../utils');

var tinyJson = require('./tiny.json');

module.exports = function main(protocols, output) {
  var domains = [];
  var version;
  for (var i = 0; i < protocols.length; i++) {
    var protocol = protocols[i];
    if (!utils.isFile(protocol))
      throw new Error(`Cannot find ${protocol}`);
    var json = require(protocol);
    domains = domains.concat(json.domains);
    version = json.version;
  }

  // TODO: this is so hack, fix it later.
  domains = domains.concat(tinyJson);

  var combinedProtocol = {version, domains};
  jsonfile.writeFileSync(output, combinedProtocol, {spaces: 4});
};
