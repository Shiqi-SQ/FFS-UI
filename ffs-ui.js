(function () {
    'use strict';

    if (window.FFS && (window.FFS._initialized || window.FFS._initializing)) {
        console.warn('检测到多次引入 FFS-UI，只有第一次引入的有效。这不会影响运行，但建议移除重复引入。');
        return;
    }

    const currentScript = document.currentScript;
    const scriptPath = currentScript ? currentScript.src : '';
    const basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);

    // 从当前 script 标签的 data-* 属性读取配置
    const dataset = currentScript ? { ...currentScript.dataset } : {};
    const datasetConfig = {};
    for (const [key, value] of Object.entries(dataset)) {
        // 转换布尔值字符串为布尔类型
        if (value === 'true') datasetConfig[key] = true;
        else if (value === 'false') datasetConfig[key] = false;
        else datasetConfig[key] = value;
    }
    // data-base => baseUrl
    if (datasetConfig.base !== undefined) {
        datasetConfig.baseUrl = datasetConfig.base;
        delete datasetConfig.base;
    }

    const config = Object.assign({
        baseUrl: basePath,
        autoload: true,
        debug: currentScript && currentScript.getAttribute('mode') === 'debug'
    }, datasetConfig);

    if (config.debug) {
        console.log('FFS-UI 初始化开始，调试模式已开启');
        console.log('基础路径:', config.baseUrl);
    }

    const resourceLoader = {
        loadedResources: new Set(),
        async loadCSS(url) {
            if (this.loadedResources.has(url)) return;
            return new Promise((resolve, reject) => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = config.baseUrl + url;
                link.onload = () => {
                    this.loadedResources.add(url);
                    if (config.debug) console.log(`CSS 加载成功: ${url}`);
                    resolve();
                };
                link.onerror = (err) => {
                    console.error(`CSS 加载失败: ${url}`, err);
                    reject(err);
                };
                document.head.appendChild(link);
            });
        },
        async loadJS(url) {
            if (this.loadedResources.has(url)) return;
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = config.baseUrl + url;
                script.onload = () => {
                    this.loadedResources.add(url);
                    if (config.debug) console.log(`JS 加载成功: ${url}`);
                    resolve();
                };
                script.onerror = (err) => {
                    console.error(`JS 加载失败: ${url}`, err);
                    reject(err);
                };
                document.head.appendChild(script);
            });
        }
    };

    const dependencyLoader = {
        hasJQuery() {
            return typeof jQuery !== 'undefined';
        },
        hasFontAwesome() {
            for (let s of document.styleSheets) {
                try {
                    if (s.href && s.href.includes('font-awesome')) return true;
                } catch (e) {}
            }
            const el = document.createElement('i');
            el.className = 'fa fa-check';
            el.style.display = 'none';
            document.body.appendChild(el);
            const style = window.getComputedStyle(el);
            const result = style.fontFamily.includes('Font Awesome') || style.fontFamily.includes('FontAwesome');
            document.body.removeChild(el);
            return result;
        },
        async loadJQuery() {
            if (this.hasJQuery()) return;
            try {
                await resourceLoader.loadJS('assets/jquery/3.7.1.min.js');
                if (config.debug) console.log('jQuery 加载成功');
            } catch (e) {
                console.error('加载 jQuery 失败:', e);
            }
        },
        async loadFontAwesome() {
            if (this.hasFontAwesome()) return;
            const files = [
                'assets/font-awesome/6.5.1.pro.all.min.css',
                'assets/font-awesome/6.5.1.pro.sharp-light.min.css',
                'assets/font-awesome/6.5.1.pro.sharp-regular.min.css',
                'assets/font-awesome/6.5.1.pro.sharp-solid.min.css',
                'assets/font-awesome/6.5.1.pro.sharp-thin.min.css'
            ];
            try {
                await Promise.all(files.map(f => resourceLoader.loadCSS(f)));
                if (config.debug) console.log('Font Awesome 加载成功');
            } catch (e) {
                console.error('加载 Font Awesome 失败:', e);
            }
        },
        async loadDependencies() {
            await this.loadJQuery();
            await this.loadFontAwesome();
        }
    };

    async function init() {
        try {
            await dependencyLoader.loadDependencies();
            await resourceLoader.loadCSS('styles/ffs-base.css');
            await Promise.all([
                resourceLoader.loadJS('scripts/ffs-components.js'),
                resourceLoader.loadJS('scripts/ffs-theme.js')
            ]);
            // 设置占位符，避免初始化前访问未定义属性导致错误
            window.FFS.components = window.FFS.components || {
                registry: {},
                loadComponents: async () => {
                    console.warn('组件管理器尚未初始化');
                    return [];
                }
            };
            window.FFS.themes = window.FFS.themes || {
                getCurrentTheme: () => 'default',
                setTheme: async () => {
                    console.warn('主题管理器尚未初始化');
                    return false;
                }
            };
            window.FFS.resourceLoader = resourceLoader;
            if (config.debug) console.log('开始检测页面中使用的组件...');
            const elements = document.querySelectorAll('[class*="ffs-"]');
            const used = new Set();
            for (const el of elements) {
                for (const cls of el.classList) {
                    if (cls.startsWith('ffs-')) {
                        const name = cls.slice(4);
                        if (window.FFS.components.registry[name]) {
                            used.add(name);
                        }
                    }
                }
            }
            const usedArray = [...used];
            if (config.debug) {
                console.log('检测到组件:', usedArray);
                console.log('开始加载组件...');
            }
            if (window.FFS.components) await window.FFS.components.loadComponents(usedArray);
            window.FFS._initialized = true;
            delete window.FFS._initializing;
            document.dispatchEvent(new Event('FFS-UI-Ready'));
        } catch (err) {
            console.error('FFS UI 初始化失败:', err);
            delete window.FFS._initializing;
        }
    }

    window.FFS = {
        ...(window.FFS || {}),
        config,
        _initialized: false,
        _initializing: true,
        _themeInitialized: false,
        _componentsInitialized: false,
        resourceLoader,
        res: resourceLoader,
        ready(callback) {
            if (this._initialized) callback();
            else document.addEventListener('FFS-UI-Ready', callback);
        },
        debug: Object.assign(function (v) {
            if (arguments.length === 0) return config.debug;
            config.debug = !!v;
            console.log(`FFS-UI 调试模式已${config.debug ? '启用' : '禁用'}`);
            return config.debug;
        }, {
            enable() {
                config.debug = true;
                console.log('FFS-UI 调试模式已启用');
            },
            disable() {
                config.debug = false;
                console.log('FFS-UI 调试模式已禁用');
            },
            isEnabled() {
                return config.debug;
            },
            log(msg, ...args) {
                if (config.debug) console.log(msg, ...args);
            }
        }),
        utils: {
            isString: v => typeof v === 'string',
            isFunction: v => typeof v === 'function',
            isObject: v => v !== null && typeof v === 'object',
            isArray: Array.isArray,
            isEmpty: v => v == null || (Array.isArray(v) || typeof v === 'string') ? v.length === 0 : (typeof v === 'object' ? Object.keys(v).length === 0 : false),
            debounce: (f, w) => {
                let t;
                return function (...args) {
                    clearTimeout(t);
                    t = setTimeout(() => f.apply(this, args), w);
                }
            },
            throttle: (f, l) => {
                let t = false;
                return function (...args) {
                    if (!t) {
                        f.apply(this, args);
                        t = true;
                        setTimeout(() => t = false, l);
                    }
                }
            }
        },
        version: '1.0.0'
    };

    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
})();
