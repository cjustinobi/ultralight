// src/polyfills.js
import { Buffer } from 'buffer';
import process from 'process';
// import { EventEmitter } from 'eventemitter3';

// Set up global variables
window.Buffer = Buffer;
window.process = process;
window.global = window;
// window.EventEmitter = EventEmitter;

if (typeof global === 'undefined') {
  window.global = window;
}

if (!process.env) {
  process.env = {};
}
