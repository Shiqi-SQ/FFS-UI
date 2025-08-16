/**
 * FFS UI - 通知组件
 * 提供全局通知、状态提示、进度通知等功能
 */
(function($) {
    'use strict';

    // 通知容器ID
    const CONTAINER_ID = 'ffs-notice-container';

    /**
     * 初始化通知容器
     * 如果页面中不存在通知容器，则创建一个
     */
    function initNoticeContainer() {
        if (!$('#' + CONTAINER_ID).length) {
            $('body').append(`<div class="ffs-notice-container" id="${CONTAINER_ID}"></div>`);
        }
        return $('#' + CONTAINER_ID);
    }

    /**
     * 创建通知
     * @param {Object} options - 通知配置项
     * @param {string} options.type - 通知类型：message, loading, success, warning, error
     * @param {string} options.icon - 图标类名
     * @param {string} options.title - 通知标题
     * @param {string} options.message - 通知内容
     * @param {number} options.duration - 显示时间，0表示不自动关闭
     * @param {number} options.progress - 进度值（0-100）
     * @returns {jQuery} 通知元素
     */
    function createNotice(options) {
        // 默认配置
        const defaults = {
            type: 'message',
            icon: '',
            title: '',
            message: '',
            duration: 3000,
            progress: null
        };

        // 合并配置
        const settings = $.extend({}, defaults, options);

        // 获取容器
        const $container = initNoticeContainer();

        // 创建通知元素
        const $notice = $(`
            <div class="ffs-notice ffs-notice-${settings.type}">
                <div class="ffs-notice-icon">
                    <i class="fas ${getIconClass(settings.type, settings.icon)}"></i>
                </div>
                <div class="ffs-notice-content">
                    ${settings.title ? `<div class="ffs-notice-title">${settings.title}</div>` : ''}
                    <div class="ffs-notice-message">${settings.message}</div>
                    ${settings.progress !== null ? `
                        <div class="ffs-notice-progress">
                            <div class="ffs-notice-progress-bar">
                                <div class="ffs-notice-progress-inner" style="width: ${settings.progress}%"></div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="ffs-notice-close">
                    <i class="fas fa-times"></i>
                </div>
            </div>
        `);

        // 添加到容器
        $container.append($notice);

        // 显示通知
        setTimeout(() => $notice.addClass('show'), 10);

        // 绑定关闭事件
        $notice.find('.ffs-notice-close').on('click', function() {
            closeNotice($notice);
        });

        // 自动关闭
        if (settings.duration !== 0) {
            setTimeout(() => closeNotice($notice), settings.duration);
        }

        // 返回通知元素
        return $notice;
    }

    /**
     * 关闭通知
     * @param {jQuery} $notice - 通知元素
     */
    function closeNotice($notice) {
        // 添加隐藏类
        $notice.removeClass('show').addClass('hide');

        // 动画结束后移除元素
        setTimeout(() => $notice.remove(), 300);

        // 触发关闭事件
        $notice.trigger('notice:close');
    }

    /**
     * 获取图标类名
     * @param {string} type - 通知类型
     * @param {string} customIcon - 自定义图标
     * @returns {string} 图标类名
     */
    function getIconClass(type, customIcon) {
        if (customIcon) return customIcon;

        switch (type) {
            case 'message': return 'fa-info-circle';
            case 'loading': return 'fa-spinner fa-spin';
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-times-circle';
            default: return 'fa-info-circle';
        }
    }

    /**
     * 更新通知进度
     * @param {jQuery} $notice - 通知元素
     * @param {number} progress - 进度值（0-100）
     */
    function updateProgress($notice, progress) {
        // 确保值在0-100之间
        progress = Math.min(100, Math.max(0, progress));

        // 更新进度条
        const $progressBar = $notice.find('.ffs-notice-progress-inner');
        if ($progressBar.length) {
            $progressBar.css('width', progress + '%');
        } else {
            // 如果不存在进度条，则创建
            const $progressContainer = $(`
                <div class="ffs-notice-progress">
                    <div class="ffs-notice-progress-bar">
                        <div class="ffs-notice-progress-inner" style="width: ${progress}%"></div>
                    </div>
                </div>
            `);
            $notice.find('.ffs-notice-content').append($progressContainer);
        }

        // 如果进度达到100%，触发完成事件
        if (progress >= 100) {
            $notice.trigger('notice:progress:complete');
        }

        return $notice;
    }

    /**
     * 显示消息通知
     * @param {string} message - 通知内容
     * @param {string} title - 通知标题
     * @param {number} duration - 显示时间
     * @returns {jQuery} 通知元素
     */
    function showMessage(message, title, duration) {
        return createNotice({
            type: 'message',
            title: title,
            message: message,
            duration: duration
        });
    }

    /**
     * 显示加载通知
     * @param {string} message - 通知内容
     * @param {string} title - 通知标题
     * @returns {jQuery} 通知元素
     */
    function showLoading(message, title) {
        return createNotice({
            type: 'loading',
            title: title || '加载中',
            message: message || '正在处理您的请求，请稍候...',
            duration: 0
        });
    }

    /**
     * 显示成功通知
     * @param {string} message - 通知内容
     * @param {string} title - 通知标题
     * @param {number} duration - 显示时间
     * @returns {jQuery} 通知元素
     */
    function showSuccess(message, title, duration) {
        return createNotice({
            type: 'success',
            title: title || '操作成功',
            message: message || '您的操作已经成功完成。',
            duration: duration
        });
    }

    /**
     * 显示警告通知
     * @param {string} message - 通知内容
     * @param {string} title - 通知标题
     * @param {number} duration - 显示时间
     * @returns {jQuery} 通知元素
     */
    function showWarning(message, title, duration) {
        return createNotice({
            type: 'warning',
            title: title || '警告提示',
            message: message || '请注意，这是一个警告信息。',
            duration: duration
        });
    }

    /**
     * 显示错误通知
     * @param {string} message - 通知内容
     * @param {string} title - 通知标题
     * @param {number} duration - 显示时间
     * @returns {jQuery} 通知元素
     */
    function showError(message, title, duration) {
        return createNotice({
            type: 'error',
            title: title || '操作失败',
            message: message || '抱歉，操作未能完成。',
            duration: duration
        });
    }

    /**
     * 显示进度通知
     * @param {string} message - 通知内容
     * @param {string} title - 通知标题
     * @param {number} initialProgress - 初始进度值
     * @returns {jQuery} 通知元素
     */
    function showProgress(message, title, initialProgress = 0) {
        return createNotice({
            type: 'message',
            title: title || '进度提示',
            message: message || '正在处理中...',
            duration: 0,
            progress: initialProgress
        });
    }

    /**
     * 清除所有通知
     */
    function clearAllNotices() {
        const $notices = $('.ffs-notice');
        $notices.each(function() {
            closeNotice($(this));
        });
    }

    /**
     * 初始化通知组件
     */
    function initNotice() {
        // 初始化容器
        initNoticeContainer();

        // 导出全局方法
        window.ffsNotice = {
            show: createNotice,
            close: closeNotice,
            updateProgress: updateProgress,
            message: showMessage,
            loading: showLoading,
            success: showSuccess,
            warning: showWarning,
            error: showError,
            progress: showProgress,
            clear: clearAllNotices
        };
    }

    // 在文档加载完成后初始化
    $(document).ready(function() {
        initNotice();
    });

    // 导出公共API
    return {
        initNotice: initNotice,
        createNotice: createNotice,
        closeNotice: closeNotice,
        updateProgress: updateProgress,
        showMessage: showMessage,
        showLoading: showLoading,
        showSuccess: showSuccess,
        showWarning: showWarning,
        showError: showError,
        showProgress: showProgress,
        clearAllNotices: clearAllNotices
    };
})(jQuery);