/**
 * Copyright (c) 2016 Translation Exchange, Inc.
 *
 *  _______                  _       _   _             ______          _
 * |__   __|                | |     | | (_)           |  ____|        | |
 *    | |_ __ __ _ _ __  ___| | __ _| |_ _  ___  _ __ | |__  __  _____| |__   __ _ _ __   __ _  ___
 *    | | '__/ _` | '_ \/ __| |/ _` | __| |/ _ \| '_ \|  __| \ \/ / __| '_ \ / _` | '_ \ / _` |/ _ \
 *    | | | | (_| | | | \__ \ | (_| | |_| | (_) | | | | |____ >  < (__| | | | (_| | | | | (_| |  __/
 *    |_|_|  \__,_|_| |_|___/_|\__,_|\__|_|\___/|_| |_|______/_/\_\___|_| |_|\__,_|_| |_|\__, |\___|
 *                                                                                        __/ |
 *                                                                                       |___/
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var tml = require('tml-js');

/**
 * File cache adapter
 *
 * @param config
 * @constructor
 */
var File = function(config) {
  this.config = config || {};
  this.fs = require('fs-extra');
};

/**
 * File cache adapter methods
 */
File.prototype = tml.utils.extend(new tml.CacheAdapterBase(), {

  name: "file",

  getVersion: function(callback) {
    callback(0);
  },

  incrementVersion: function(callback) {
    callback(0);
  },

  fetch: function(key, def, callback) {
    callback = callback || function(){};

    var file_path = this.filePath(key);
    var self = this;

    // console.log("Loading " + file_path);

    self.fs.exists(file_path, function (exists) {
      if (!exists) {
        self.info("Cache miss " + key);
        callback(null, null);
      } else {
        self.fs.readFile(file_path, 'utf8', function (err, data) {
          if (data) {
            self.info("cache hit " + key);
          } else {
            self.info("cache miss " + key);
          }
          callback(err, data);
        });
      }
    });
  },

  /**
   * Returns selected cache version
   *
   * @returns {*|string}
   */
  getSelectedVersion: function() {
    return this.config.version || 'current';
  },

  /**
   * Returns base path to the cache
   *
   * @returns {*|string}
   */
  basePath: function() {
    // return "./../../cache/files/current";
    return this.config.path || './cache';
  },

  /**
   * Returns cache path
   *
   * @returns {string}
   */
  cachePath: function() {
    return this.basePath() + '/' + this.getSelectedVersion();
  },

  /**
   * Returns filePath
   *
   * @param key
   * @returns {string}
   */
  filePath: function(key) {
    return this.cachePath() + '/' + this.fileName(key);
  },

  /**
   * Stores data in the cache
   *
   * @param key
   * @param value
   */
  store: function(key, value) {
    this.warn("This is a readonly cache");
  },

  /**
   * Deletes data from cache
   *
   * @param key
   * @returns {null}
   */
  del: function(key) {
    this.warn("This is a readonly cache");
    return null;
  }

});

module.exports = File;