(function () {
    'use strict';
    if (!window.FFS) throw new Error('必须首先加载 ffs-ui.js');

    // 组件管理模块
    const componentManager = {
        _initialized: false,

        // 组件注册表
        registry: {
            // 动画组件
            'interactive': {
                css: 'components/animation/interactive.css',
                js: 'components/animation/interactive.js'
            },
            'load': {
                css: 'components/animation/load.css',
                js: 'components/animation/load.js'
            },
            'transition': {
                css: 'components/animation/transition.css',
                js: 'components/animation/transition.js'
            },

            // 业务组件
            'personpage': {
                css: 'components/business/personpage.css',
                js: 'components/business/personpage.js'
            },
            'prodetail': {
                css: 'components/business/prodetail.css',
                js: 'components/business/prodetail.js'
            },
            'proform': {
                css: 'components/business/proform.css',
                js: 'components/business/proform.js'
            },
            'protable': {
                css: 'components/business/protable.css',
                js: 'components/business/protable.js'
            },
            'resultpage': {
                css: 'components/business/resultpage.css',
                js: 'components/business/resultpage.js'
            },

            // 图表组件
            'chart-common': {
                css: 'components/charts/common.css',
                js: 'components/charts/common.js'
            },
            'chart-map': {
                css: 'components/charts/map.css',
                js: 'components/charts/map.js'
            },
            'chart-pro': {
                css: 'components/charts/pro.css',
                js: 'components/charts/pro.js'
            },

            // 数据组件
            'datax': {
                css: 'components/data/datax.css',
                js: 'components/data/datax.js'
            },
            'list': {
                css: 'components/data/list.css',
                js: 'components/data/list.js'
            },
            'table': {
                css: 'components/data/table.css',
                js: 'components/data/table.js'
            },
            'tree': {
                css: 'components/data/tree.css',
                js: 'components/data/tree.js'
            },

            // 反馈组件
            'bubble': {
                css: 'components/feedback/bubble.css',
                js: 'components/feedback/bubble.js'
            },
            'modal': {
                css: 'components/feedback/modal.css',
                js: 'components/feedback/modal.js'
            },
            'notice': {
                css: 'components/feedback/notice.css',
                js: 'components/feedback/notice.js'
            },
            'progress': {
                css: 'components/feedback/progress.css',
                js: 'components/feedback/progress.js'
            },

            // 表单组件
            'formx': {
                css: 'components/form/formx.css',
                js: 'components/form/formx.js'
            },
            'input': {
                css: 'components/form/input.css',
                js: 'components/form/input.js'
            },
            'select': {
                css: 'components/form/select.css',
                js: 'components/form/select.js'
            },
            'selectdate': {
                css: 'components/form/selectdate.css',
                js: 'components/form/selectdate.js'
            },
            'selectx': {
                css: 'components/form/selectx.css',
                js: 'components/form/selectx.js'
            },

            // 通用组件
            'button': {
                css: 'components/general/button.css',
                js: 'components/general/button.js'
            },
            'icon': {
                css: 'components/general/icon.css',
                js: 'components/general/icon.js'
            },
            'layout': {
                css: 'components/general/layout.css',
                js: 'components/general/layout.js'
            },
            'typography': {
                css: 'components/general/typography.css',
                js: 'components/general/typography.js'
            },

            // 布局组件
            'fixed': {
                css: 'components/layout/fixed.css',
                js: 'components/layout/fixed.js'
            },
            'flex': {
                css: 'components/layout/flex.css',
                js: 'components/layout/flex.js'
            },
            'float': {
                css: 'components/layout/float.css',
                js: 'components/layout/float.js'
            },
            'position': {
                css: 'components/layout/position.css',
                js: 'components/layout/position.js'
            },
            'respgrid': {
                css: 'components/layout/respgrid.css',
                js: 'components/layout/respgrid.js'
            },

            // 媒体组件
            'audio': {
                css: 'components/media/audio.css',
                js: 'components/media/audio.js'
            },
            'image': {
                css: 'components/media/image.css',
                js: 'components/media/image.js'
            },
            'video': {
                css: 'components/media/video.css',
                js: 'components/media/video.js'
            },

            // 导航组件
            'breadcrumb': {
                css: 'components/navigation/breadcrumb.css',
                js: 'components/navigation/breadcrumb.js'
            },
            'menu': {
                css: 'components/navigation/menu.css',
                js: 'components/navigation/menu.js'
            },
            'pagination': {
                css: 'components/navigation/pagination.css',
                js: 'components/navigation/pagination.js'
            },
            'tabs': {
                css: 'components/navigation/tabs.css',
                js: 'components/navigation/tabs.js'
            },

            // 工具组件
            'copy': {
                css: 'components/utils/copy.css',
                js: 'components/utils/copy.js'
            },
            'drag': {
                css: 'components/utils/drag.css',
                js: 'components/utils/drag.js'
            },
            'file': {
                css: 'components/utils/file.css',
                js: 'components/utils/file.js'
            },
            'watermark': {
                css: 'components/utils/watermark.css',
                js: 'components/utils/watermark.js'
            }
        },

        // 组件加载方法
        async loadComponent(name) {
            const component = this.registry[name];
            if (!component) {
                if (window.FFS.debug.isEnabled()) {
                    console.warn(`组件 ${name} 未在注册表中找到`);
                }
                return;
            }

            if (component.loaded) {
                if (window.FFS.debug.isEnabled()) {
                    window.FFS.debug.log(`组件 ${name} 已缓存，跳过加载`);
                }
                return;
            }

            try {
                if (component.css) {
                    await window.FFS.resourceLoader.loadCSS(component.css);
                }
                if (component.js) {
                    await window.FFS.resourceLoader.loadJS(component.js);
                }

                component.loaded = true;

                if (window.FFS.debug.isEnabled()) {
                    window.FFS.debug.log(`组件 ${name} 加载成功`);
                }
            } catch (error) {
                console.error(`加载组件 ${name} 失败:`, error);
            }
        },

        async loadComponents(names) {
            if (!Array.isArray(names) || names.length === 0) {
                return;
            }

            if (window.FFS.debug.isEnabled()) {
                window.FFS.debug.log(`开始加载组件: ${names.join(', ')}`);
            }

            const promises = names.map(name => this.loadComponent(name));
            await Promise.all(promises);
        },

        // 注册新组件
        registerComponent(name, config) {
            if (!name || !config) {
                console.error('注册组件失败: 名称或配置无效');
                return false;
            }

            if (this.registry[name]) {
                console.warn(`组件 ${name} 已存在，将被覆盖`);
            }

            this.registry[name] = { ...config, loaded: false };

            if (window.FFS.debug.isEnabled()) {
                window.FFS.debug.log(`组件 ${name} 已注册`);
            }

            return true;
        },

        // 获取已注册的所有组件名称
        getRegisteredComponents() {
            return Object.keys(this.registry);
        },

        // 检查组件是否已注册
        hasComponent(name) {
            return !!this.registry[name];
        },

        // 初始化组件系统
        init() {
            this._initialized = true;
            window.FFS._componentsInitialized = true;

            Object.values(this.registry).forEach(c => {
                c.loaded = false;
            });

            if (window.FFS.debug.isEnabled()) {
                window.FFS.debug.log('组件系统初始化完成');
            }

            return true;
        },

        // 检查组件系统是否已初始化
        isReady() {
            return this._initialized === true;
        }
    };

    // 将组件管理器添加到FFS对象
    window.FFS.components = componentManager;

    // 导出公共方法到FFS根对象
    window.FFS.loadComponent = componentManager.loadComponent.bind(componentManager);
    window.FFS.loadComponents = componentManager.loadComponents.bind(componentManager);
    window.FFS.registerComponent = componentManager.registerComponent.bind(componentManager);
    window.FFS.hasComponent = componentManager.hasComponent.bind(componentManager);
    window.FFS.isComponentsReady = componentManager.isReady.bind(componentManager);

    // 初始化组件系统
    componentManager.init();
})();