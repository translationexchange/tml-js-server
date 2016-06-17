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

var tml       = require('tml-js');
var promise = require('bluebird');

/**
 * Memcache cache adapter
 *
 * @param config
 * @constructor
 */
var MemcacheAdapter = function(config) {
  this.config = config || {};
  this.config.timeout = this.config.timeout || 3600;
  this.cache = this.create();
};

/**
 * Memcache cache adapter methods
 */
MemcacheAdapter.prototype = tml.utils.extend(new tml.CacheAdapterBase(), {

  name : "memcache",
  read_only : false,
  cached_by_source : true,

  /**
   * Create cache adapter
   *
   * @returns {*|exports|module.exports}
   */
  create: function() {
    var Memcached = require("memcached");
    promise.promisifyAll(Memcached.prototype);
    return new Memcached(this.config.hosts, this.config.options);
  },

  /**
   * Fetch key from Memcache
   *
   * @param key
   * @param def
   */
  fetch: function(key, def) {
    return this.cache.getAsync(this.getVersionedKey(key))
        .bind(this)
        .then(function (data) {
          if (!data) {
            throw new Error('Cache response empty');
          }
          this.info("cache hit " + key);
          return data;
        })
        .catch(function (err) {
          this.info("cache miss " + key);

          if (typeof def === "function") {
            return promise.try(def).bind(this)
                .then(function (data) {
                  if (!data) {
                    throw new Error('no data');
                  }
                  return this.store(key, data)
                          .then(function () {
                              return data;
                          });
                });
          }
          else if (def) {
            return this.store(key, def)
                .then(function () {
                    return def;
                });
          }
        });
  },

  /**
   * Store key in Memcache
   *
   * @param key
   * @param value
   */
  store: function(key, value) {
    var versionedKey = this.getVersionedKey(key);
    this.info("cache store " + key);
    return this.cache.setAsync(versionedKey, this.stripExtensions(value), this.config.timeout);
  },

  /**
   * Delete key from memcache
   *
   * @param key
   */
  del: function(key, callback) {
    var versionedKey = this.getVersionedKey(key);
    this.info("cache del " + key);
    return this.cache.delAsync(versionedKey);
  },

  /**
   * Check if key exists in Memcache
   *
   * @param key
   */
  exists: function(key){
    return this.cache.getAsync(this.getVersionedKey(key))
        .then(function (data) {
          return !!data;
        })
        .catch(function (err) {
          return false;
        });
  },

  /**
   * Not supported in Memcache
   */
  clear: function() {
    return promise.resolve();
  }

});

module.exports = MemcacheAdapter;