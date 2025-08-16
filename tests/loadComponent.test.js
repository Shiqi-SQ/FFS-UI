const assert = require('assert');

// Prepare minimal window and FFS environment
global.window = {
    FFS: {
        resourceLoader: {},
        debug: {
            isEnabled() { return false; },
            log() {}
        }
    }
};

// Load component manager script
require('../scripts/ffs-components.js');

const componentManager = window.FFS.components;

// Stub resource loader to simulate async loading
let cssStart, jsStart;
let cssLoaded = false;
let jsLoaded = false;
window.FFS.resourceLoader.loadCSS = () => {
    cssStart = Date.now();
    return new Promise(resolve => setTimeout(() => { cssLoaded = true; resolve(); }, 100));
};
window.FFS.resourceLoader.loadJS = () => {
    jsStart = Date.now();
    return new Promise(resolve => setTimeout(() => { jsLoaded = true; resolve(); }, 100));
};

// Register a mock component
componentManager.registerComponent('test', { css: 'test.css', js: 'test.js' });

(async () => {
    const start = Date.now();
    await componentManager.loadComponent('test');
    const duration = Date.now() - start;

    assert(cssLoaded, 'CSS should be loaded');
    assert(jsLoaded, 'JS should be loaded');
    assert(Math.abs(cssStart - jsStart) < 50, 'CSS and JS should start loading concurrently');
    assert(duration < 180, `Parallel loading should finish faster than sequential (took ${duration}ms)`);

    console.log('loadComponent parallel loading test passed');
})();

