(function () {
    'use strict';
    if (!window.FFS) throw new Error('必须首先加载 ffs-ui.js');

    // 主题管理模块
    const themeManager = {
        // 默认主题当前主题
        defaultTheme: 'default',
        currentTheme: null,
        themeChangeCallbacks: [],
        themeCache: {}, // 缓存已加载的主题变量
        _initialized: false,

        // 取当前主题
        getCurrentTheme() {
            if (this.currentTheme) {
                return this.currentTheme;
            }
            const savedTheme = localStorage.getItem('ffs-ui-theme') || this.defaultTheme;
            this.currentTheme = savedTheme;
            return savedTheme;
        },

        // 置主题 - 使用CSS变量方式
        async setTheme(themeName) {
            if (!themeName) {
                console.error('主题名称不能为空');
                return false;
            }
            try {
                // 尝试从缓存获取主题变量
                let themeVars = this.themeCache[themeName];

                // 如果缓存中没有，则从服务器加载
                if (!themeVars) {
                    const response = await fetch(`themes/${themeName}-vars.json`);
                    if (!response.ok) {
                        throw new Error(`无法加载主题变量: ${response.statusText}`);
                    }
                    themeVars = await response.json();

                    // 缓存主题变量
                    this.themeCache[themeName] = themeVars;
                }

                // 将变量应用到根元素
                const root = document.documentElement;
                Object.entries(themeVars).forEach(([key, value]) => {
                    root.style.setProperty(key, value);
                });

                // 保存主题设置到本地存储
                localStorage.setItem('ffs-ui-theme', themeName);
                this.currentTheme = themeName;

                // 添加主题标识类，方便特定主题的样式覆盖
                root.classList.remove('theme-default', 'theme-dark');
                root.classList.add(`theme-${themeName}`);

                // 触发主题变化事件
                this.triggerThemeChange(themeName);

                if (window.FFS.config.debug) {
                    console.log(`主题已切换为: ${themeName}`);
                }

                return true;
            } catch (error) {
                console.error(`切换主题 ${themeName} 失败:`, error);
                return false;
            }
        },

        // 预加载主题
        async preloadTheme(themeName) {
            if (!themeName || this.themeCache[themeName]) return;

            try {
                const response = await fetch(`themes/${themeName}-vars.json`);
                if (response.ok) {
                    const themeVars = await response.json();
                    this.themeCache[themeName] = themeVars;
                    if (window.FFS.config.debug) {
                        console.log(`主题 ${themeName} 已预加载`);
                    }
                }
            } catch (error) {
                console.warn(`预加载主题 ${themeName} 失败:`, error);
            }
        },

        // 注册主题变化回调
        onThemeChange(callback) {
            if (typeof callback === 'function') {
                this.themeChangeCallbacks.push(callback);
                // 有主题立即回调
                const currentTheme = this.getCurrentTheme();
                try {
                    callback(currentTheme);
                } catch (e) {
                    console.error('主题变化回调执行错误:', e);
                }
                return true;
            }
            return false;
        },

        // 移除主题变化回调
        offThemeChange(callback) {
            const index = this.themeChangeCallbacks.indexOf(callback);
            if (index !== -1) {
                this.themeChangeCallbacks.splice(index, 1);
                return true;
            }
            return false;
        },

        // 触发主题变化事件
        triggerThemeChange(theme) {
            this.themeChangeCallbacks.forEach(callback => {
                try {
                    callback(theme);
                } catch (e) {
                    console.error('主题变化回调执行错误:', e);
                }
            });

            // 触发DOM事件，方便其他模块监听
            document.dispatchEvent(new CustomEvent('ffs-theme-change', {
                detail: {
                    theme: theme
                }
            }));
        },

        // 监听系统主题变化
        watchSystemTheme() {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleSystemThemeChange = (e) => {
                const isDark = e.matches;
                const newTheme = isDark ? 'dark' : 'default';
                this.setTheme(newTheme);
            };

            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handleSystemThemeChange);
            } else if (mediaQuery.addListener) {
                // 兼容旧版浏览器
                mediaQuery.addListener(handleSystemThemeChange);
            }

            // 初始化时执行一次
            handleSystemThemeChange(mediaQuery);

            return true;
        },

        // 初始化主题
        async initTheme() {
            // 确保基础样式表已加载
            if (!document.querySelector('link[href*="themes/base.css"]')) {
                await window.FFS.resourceLoader.loadCSS('themes/base.css');
            }

            // 预加载所有主题变量
            if (this.defaultTheme !== 'default') {
                await this.preloadTheme('default');
            }
            await this.preloadTheme('dark');

            // 应用当前主题变量
            const currentTheme = this.getCurrentTheme();
            await this.setTheme(currentTheme);

            this._initialized = true;
            window.FFS._themeInitialized = true;
            document.dispatchEvent(new CustomEvent('ffs-theme-ready'));

            if (window.FFS.debug.isEnabled()) {
                console.log('主题系统初始化完成，当前主题:', this.getCurrentTheme());
            }
            return true;
        },
        
        // 检查主题系统是否已初始化
        isReady() {
            return this._initialized === true;
        }
    };

    // 将主题管理器添加到FFS对象
    window.FFS.themes = themeManager;

    // 导出公共方法到FFS根对象
    window.FFS.setTheme = themeManager.setTheme.bind(themeManager);
    window.FFS.onThemeChange = themeManager.onThemeChange.bind(themeManager);
    window.FFS.offThemeChange = themeManager.offThemeChange.bind(themeManager);
    window.FFS.preloadTheme = themeManager.preloadTheme.bind(themeManager);
    window.FFS.watchSystemTheme = themeManager.watchSystemTheme.bind(themeManager);
    window.FFS.isThemeReady = themeManager.isReady.bind(themeManager);

    // 初始化
    document.addEventListener('FFS-UI-Ready', () => {
        // 确保在 FFS UI 完全初始化后再初始化主题系统
        setTimeout(() => {
            window.FFS.themes.initTheme()
                .then(() => {
                    if (window.FFS.debug.isEnabled()) {
                        window.FFS.debug.log('主题系统初始化完成');
                    }
                })
                .catch(err => console.error('主题初始化失败:', err));
        }, 100); // 延迟确保组件加载完
    });
})();