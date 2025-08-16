/**
 * FFS UI - 对话框组件
 * 提供基础对话框、信息提示、确认对话框、自定义位置、可拖拽和全屏对话框等功能
 */
(function ($) {
    'use strict';

    /**
     * 初始化基础对话框
     * 处理对话框的显示和隐藏
     */
    function initBasicModal() {
        // 显示对话框
        $.fn.showModal = function () {
            return this.each(function () {
                const $modal = $(this);

                // 添加显示类
                $modal.addClass('show');

                // 阻止滚动
                $('body').css('overflow', 'hidden');

                // 触发显示事件
                $modal.trigger('modal:show');
            });
        };

        // 隐藏对话框
        $.fn.hideModal = function () {
            return this.each(function () {
                const $modal = $(this);

                // 移除显示类
                $modal.removeClass('show');

                // 恢复滚动
                $('body').css('overflow', '');

                // 触发隐藏事件
                $modal.trigger('modal:hide');
            });
        };

        // 点击关闭按钮关闭对话框
        $(document).on('click', '.ffs-modal-close', function () {
            const $close = $(this);
            const $modal = $close.closest('.ffs-modal');

            $modal.hideModal();
        });

        // 点击对话框外部关闭对话框
        $(document).on('click', '.ffs-modal', function (e) {
            if (e.target === this) {
                $(this).hideModal();
            }
        });

        // 按ESC键关闭对话框
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape') {
                $('.ffs-modal.show').hideModal();
            }
        });
    }

    /**
     * 初始化信息提示对话框
     * 处理成功、警告、错误等提示
     */
    function initInfoModal() {
        // 显示信息提示
        window.showInfoModal = function (type, message, description, duration) {
            // 获取或创建信息提示对话框
            let $modal = $('#ffs-info-modal');

            if (!$modal.length) {
                $modal = $(`
                    <div class="ffs-modal" id="ffs-info-modal">
                        <div class="ffs-modal-content">
                            <div class="ffs-modal-body">
                                <div class="ffs-modal-info">
                                    <div class="ffs-modal-info-icon">
                                        <i class="fas"></i>
                                    </div>
                                    <div class="ffs-modal-info-message"></div>
                                    <div class="ffs-modal-info-description"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                `);

                $('body').append($modal);
            }

            // 设置类型
            const $info = $modal.find('.ffs-modal-info');
            $info.removeClass('success warning error').addClass(type);

            // 设置图标
            const $icon = $modal.find('.ffs-modal-info-icon i');
            switch (type) {
                case 'success':
                    $icon.attr('class', 'fas fa-check');
                    break;
                case 'warning':
                    $icon.attr('class', 'fas fa-exclamation-triangle');
                    break;
                case 'error':
                    $icon.attr('class', 'fas fa-times-circle');
                    break;
            }

            // 设置消息和描述
            $modal.find('.ffs-modal-info-message').text(message || getDefaultMessage(type));
            $modal.find('.ffs-modal-info-description').text(description || getDefaultDescription(type));

            // 显示对话框
            $modal.showModal();

            // 自动关闭
            if (duration !== 0) {
                setTimeout(function () {
                    $modal.hideModal();
                }, duration || 3000);
            }

            return $modal;
        };

        // 获取默认消息
        function getDefaultMessage(type) {
            switch (type) {
                case 'success':
                    return '操作成功';
                case 'warning':
                    return '警告提示';
                case 'error':
                    return '操作失败';
                default:
                    return '';
            }
        }

        // 获取默认描述
        function getDefaultDescription(type) {
            switch (type) {
                case 'success':
                    return '您的操作已经成功完成。';
                case 'warning':
                    return '请注意，这是一个警告信息。';
                case 'error':
                    return '抱歉，操作未能完成。';
                default:
                    return '';
            }
        }

        // 成功提示
        window.showSuccessModal = function (message, description, duration) {
            return showInfoModal('success', message, description, duration);
        };

        // 警告提示
        window.showWarningModal = function (message, description, duration) {
            return showInfoModal('warning', message, description, duration);
        };

        // 错误提示
        window.showErrorModal = function (message, description, duration) {
            return showInfoModal('error', message, description, duration);
        };
    }

    /**
     * 初始化确认对话框
     * 处理确认和取消操作
     */
    function initConfirmModal() {
        // 显示确认对话框
        window.showConfirmModal = function (options) {
            const defaults = {
                title: '确认操作',
                content: '您确定要执行此操作吗？',
                confirmText: '确定',
                cancelText: '取消',
                onConfirm: null,
                onCancel: null
            };

            const settings = $.extend({}, defaults, options);

            // 获取或创建确认对话框
            let $modal = $('#ffs-confirm-modal');

            if (!$modal.length) {
                $modal = $(`
                    <div class="ffs-modal" id="ffs-confirm-modal">
                        <div class="ffs-modal-content">
                            <div class="ffs-modal-header">
                                <div class="ffs-modal-title"></div>
                                <div class="ffs-modal-close">
                                    <i class="fas fa-times"></i>
                                </div>
                            </div>
                            <div class="ffs-modal-body">
                                <div class="ffs-modal-confirm">
                                    <div class="ffs-modal-confirm-title"></div>
                                    <div class="ffs-modal-confirm-content"></div>
                                </div>
                            </div>
                            <div class="ffs-modal-footer">
                                <button class="ffs-button ffs-button-cancel"></button>
                                <button class="ffs-button ffs-button-primary ffs-button-confirm"></button>
                            </div>
                        </div>
                    </div>
                `);

                $('body').append($modal);

                // 绑定确认按钮点击事件
                $modal.on('click', '.ffs-button-confirm', function () {
                    const callback = $modal.data('onConfirm');
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                    $modal.hideModal();
                });

                // 绑定取消按钮点击事件
                $modal.on('click', '.ffs-button-cancel', function () {
                    const callback = $modal.data('onCancel');
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                    $modal.hideModal();
                });
            }

            // 设置标题和内容
            $modal.find('.ffs-modal-title').text(settings.title);
            $modal.find('.ffs-modal-confirm-title').text(settings.title);
            $modal.find('.ffs-modal-confirm-content').text(settings.content);

            // 设置按钮文本
            $modal.find('.ffs-button-confirm').text(settings.confirmText);
            $modal.find('.ffs-button-cancel').text(settings.cancelText);

            // 存储回调函数
            $modal.data('onConfirm', settings.onConfirm);
            $modal.data('onCancel', settings.onCancel);

            // 显示对话框
            $modal.showModal();

            return $modal;
        };
    }

    /**
     * 初始化自定义位置对话框
     * 处理顶部和底部对话框
     */
    function initPositionModal() {
        // 显示顶部对话框
        $.fn.showTopModal = function () {
            return this.each(function () {
                const $modal = $(this);

                // 添加顶部类
                $modal.addClass('ffs-modal-top');

                // 显示对话框
                $modal.showModal();
            });
        };

        // 显示底部对话框
        $.fn.showBottomModal = function () {
            return this.each(function () {
                const $modal = $(this);

                // 添加底部类
                $modal.addClass('ffs-modal-bottom');

                // 显示对话框
                $modal.showModal();
            });
        };

        // 隐藏时移除位置类
        $(document).on('modal:hide', '.ffs-modal', function () {
            const $modal = $(this);

            // 移除位置类
            $modal.removeClass('ffs-modal-top ffs-modal-bottom');
        });
    }

    /**
     * 初始化可拖拽对话框
     * 处理对话框的拖拽功能
     */
    function initDraggableModal() {
        // 使对话框可拖拽
        $.fn.makeDraggable = function () {
            return this.each(function () {
                const $modal = $(this);
                const $content = $modal.find('.ffs-modal-content');
                const $header = $content.find('.ffs-modal-header');

                // 添加可拖拽类
                $modal.addClass('ffs-modal-draggable');

                // 初始化拖拽变量
                let isDragging = false;
                let startX, startY;
                let offsetX, offsetY;

                // 鼠标按下事件
                $header.on('mousedown', function (e) {
                    // 只响应鼠标左键
                    if (e.button !== 0) return;

                    // 开始拖拽
                    isDragging = true;

                    // 添加拖拽中类
                    $modal.addClass('ffs-modal-dragging');

                    // 记录起始位置
                    startX = e.clientX;
                    startY = e.clientY;

                    // 记录偏移量
                    const contentRect = $content[0].getBoundingClientRect();
                    offsetX = startX - contentRect.left;
                    offsetY = startY - contentRect.top;

                    // 阻止默认行为和冒泡
                    e.preventDefault();
                    e.stopPropagation();
                });

                // 鼠标移动事件
                $(document).on('mousemove', function (e) {
                    if (!isDragging) return;

                    // 计算新位置
                    const left = e.clientX - offsetX;
                    const top = e.clientY - offsetY;

                    // 设置对话框位置
                    $content.css({
                        position: 'absolute',
                        left: left + 'px',
                        top: top + 'px',
                        transform: 'none'
                    });

                    // 阻止默认行为
                    e.preventDefault();
                });

                // 鼠标松开事件
                $(document).on('mouseup', function () {
                    if (!isDragging) return;

                    // 结束拖拽
                    isDragging = false;

                    // 移除拖拽中类
                    $modal.removeClass('ffs-modal-dragging');
                });
            });
        };

        // 重置对话框位置
        $.fn.resetPosition = function () {
            return this.each(function () {
                const $modal = $(this);
                const $content = $modal.find('.ffs-modal-content');

                // 重置位置
                $content.css({
                    position: '',
                    left: '',
                    top: '',
                    transform: ''
                });
            });
        };

        // 隐藏时重置位置
        $(document).on('modal:hide', '.ffs-modal-draggable', function () {
            $(this).resetPosition();
        });
    }

    /**
     * 初始化全屏对话框
     * 处理全屏显示和退出全屏
     */
    function initFullscreenModal() {
        // 全屏显示对话框
        $.fn.showFullscreenModal = function () {
            return this.each(function () {
                const $modal = $(this);

                // 添加全屏类
                $modal.addClass('ffs-modal-fullscreen');

                // 显示对话框
                $modal.showModal();
            });
        };

        // 退出全屏
        $.fn.exitFullscreen = function () {
            return this.each(function () {
                const $modal = $(this);

                // 移除全屏类
                $modal.removeClass('ffs-modal-fullscreen');
            });
        };

        // 隐藏时退出全屏
        $(document).on('modal:hide', '.ffs-modal', function () {
            const $modal = $(this);

            // 移除全屏类
            $modal.removeClass('ffs-modal-fullscreen');
        });
    }

    /**
     * 初始化异步关闭对话框
     * 处理异步操作和加载状态
     */
    function initAsyncModal() {
        // 开始加载
        $.fn.startLoading = function () {
            return this.each(function () {
                const $modal = $(this);
                const $content = $modal.find('.ffs-modal-content');

                // 添加加载类
                $modal.addClass('ffs-modal-loading');

                // 创建加载图标
                if (!$modal.find('.ffs-modal-loading-icon').length) {
                    const $loading = $('<div class="ffs-modal-loading-icon"><i class="fas fa-spinner"></i></div>');
                    $content.append($loading);
                }

                // 禁用按钮
                $modal.find('.ffs-modal-footer button').prop('disabled', true);

                return $modal;
            });
        };

        // 结束加载
        $.fn.stopLoading = function () {
            return this.each(function () {
                const $modal = $(this);

                // 移除加载类
                $modal.removeClass('ffs-modal-loading');

                // 移除加载图标
                $modal.find('.ffs-modal-loading-icon').remove();

                // 启用按钮
                $modal.find('.ffs-modal-footer button').prop('disabled', false);

                return $modal;
            });
        };

        // 异步关闭对话框
        window.asyncCloseModal = function (modalId, asyncFunction) {
            const $modal = $('#' + modalId);

            if (!$modal.length) return;

            // 开始加载
            $modal.startLoading();

            // 如果提供了异步函数，则执行
            if (asyncFunction && typeof asyncFunction === 'function') {
                // 执行异步函数
                const promise = asyncFunction();

                // 处理异步结果
                if (promise && typeof promise.then === 'function') {
                    promise.then(function () {
                        // 成功时关闭对话框
                        $modal.stopLoading().hideModal();
                    }).catch(function (error) {
                        // 失败时显示错误
                        console.error('Async operation failed:', error);
                        $modal.stopLoading();

                        // 可以选择显示错误消息
                        if (error && error.message) {
                            const $error = $('<div class="ffs-modal-error">' + error.message + '</div>');
                            $modal.find('.ffs-modal-body').append($error);

                            // 自动移除错误消息
                            setTimeout(function () {
                                $error.remove();
                            }, 3000);
                        }
                    });
                } else {
                    // 如果不是Promise，则直接关闭
                    setTimeout(function () {
                        $modal.stopLoading().hideModal();
                    }, 500);
                }
            } else {
                // 模拟异步操作
                setTimeout(function () {
                    $modal.stopLoading().hideModal();
                }, 1000);
            }
        };
    }

    /**
     * 初始化所有对话框组件
     */
    function initAllModals() {
        initBasicModal();
        initInfoModal();
        initConfirmModal();
        initPositionModal();
        initDraggableModal();
        initFullscreenModal();
        initAsyncModal();
    }

    // 在文档加载完成后初始化
    $(document).ready(function () {
        initAllModals();
    });

    // 导出公共API
    return {
        initBasicModal: initBasicModal,
        initInfoModal: initInfoModal,
        initConfirmModal: initConfirmModal,
        initPositionModal: initPositionModal,
        initDraggableModal: initDraggableModal,
        initFullscreenModal: initFullscreenModal,
        initAsyncModal: initAsyncModal,
        initAllModals: initAllModals
    };
})(jQuery);