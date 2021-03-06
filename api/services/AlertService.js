var Push = require('pushover-notifications'),
    nma  = require("nma"),
    config,
    push;

module.exports = {
  init: function (callback) {
    config = sails.config.notifications;

    if (!config.enabled || process.env.NODE_ENV === 'test') {
      return callback();
    }

    push = new Push({
      user         : config.push.pushover.userToken,
      token        : config.push.pushover.applicationToken,
      update_sounds: true
    });

    callback(null, push);
  },

  /**
   * Push a notification.
   *
   * @param {string}   [title]
   * @param {string}   [message]
   * @param {int}      [priority]
   * @param {string}   [sound]
   * @param {function} callback
   */
  push: function (title, message, priority, sound, callback) {
    if (typeof priority == 'function') {
      callback = priority;
      priority = null;
    }

    if (typeof sound === 'function') {
      callback = sound;
      sound = null;
    }

    // Just here to prevent a crash.
    callback = callback || function () {
    };

    if (!config.enabled) {
      return callback();
    }

    priority = priority || 0;
    sound = sound || config.push.pushover.sound || 'persistent';

    if (typeof message === 'object' && typeof message.toString === 'function') {
      message = message.toString();
    }

    var notification = {
      message : message,
      title   : title,
      sound   : sound,
      priority: priority
    };

    if (process.env.NODE_ENV === 'test') {
      return callback(null, notification);
    }

    // Pushover
    push.send(notification, callback);

    // Notify my android
    config.push.nma.tokens.forEach(function (token) {
      nma(
        token,
        'Islive.io',
        notification.title,
        notification.message,
        notification.priority
      );
    });
  },

  /**
   * Convenience method.
   *
   * @param {string}   message
   * @param {function} [callback]
   */
  pushEmergency: function (message, callback) {

    // Just here to prevent a crash.
    callback = callback || function () {
    };

    this.push('Emergency', message, 1, callback);
  },

  /**
   * Convenience method.
   *
   * @param {string}   message
   * @param {function} [callback]
   */
  pushError: function (message, callback) {
    // Just here to prevent a crash.
    callback = callback || function () {
    };

    this.push('Error', message, 1, callback);
  },

  /**
   * Convenience method.
   *
   * @param {string}   message
   * @param {function} [callback]
   */
  pushNotification: function (message, callback) {
    // Just here to prevent a crash.
    callback = callback || function () {
    };

    this.push('Notification', message, 0, callback);
  }
};
