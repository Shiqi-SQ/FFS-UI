/**
 * FFS UI - 拖拽组件
 * 提供拖拽排序、拖拽列表、拖拽表格和拖拽上传等功能
 */
(function ($) {
    'use strict';

    /**
     * 初始化拖拽排序
     * 为带有 ffs-drag-sort 类的容器内的元素添加拖拽排序功能
     */
    function initDragSort() {
        $('.ffs-drag-sort').each(function () {
            const $container = $(this);
            const $items = $container.find('.ffs-drag-sort-item');

            // 初始化拖拽排序
            $items.attr('draggable', 'true');

            // 拖拽开始
            $container.on('dragstart', '.ffs-drag-sort-item', function (e) {
                const $item = $(this);

                // 设置拖拽数据
                e.originalEvent.dataTransfer.effectAllowed = 'move';
                e.originalEvent.dataTransfer.setData('text/plain', $item.index());

                // 添加拖拽中样式
                $item.addClass('dragging');

                // 触发拖拽开始事件
                $container.trigger('drag:sort-start', [$item]);
            });

            // 拖拽结束
            $container.on('dragend', '.ffs-drag-sort-item', function () {
                const $item = $(this);

                // 移除拖拽中样式
                $item.removeClass('dragging');

                // 移除所有放置目标样式
                $container.find('.ffs-drag-sort-item').removeClass('drag-over');

                // 触发拖拽结束事件
                $container.trigger('drag:sort-end', [$item]);
            });

            // 拖拽经过
            $container.on('dragover', '.ffs-drag-sort-item', function (e) {
                e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'move';

                const $target = $(this);

                // 如果不是拖拽中的元素，添加放置目标样式
                if (!$target.hasClass('dragging')) {
                    $target.addClass('drag-over');
                }
            });

            // 拖拽离开
            $container.on('dragleave', '.ffs-drag-sort-item', function () {
                $(this).removeClass('drag-over');
            });

            // 放置
            $container.on('drop', '.ffs-drag-sort-item', function (e) {
                e.preventDefault();

                const $target = $(this);
                const $items = $container.find('.ffs-drag-sort-item');
                const sourceIndex = parseInt(e.originalEvent.dataTransfer.getData('text/plain'), 10);
                const $source = $items.eq(sourceIndex);
                const targetIndex = $items.index($target);

                // 如果源元素和目标元素相同，不执行操作
                if (sourceIndex === targetIndex) {
                    return;
                }

                // 移动元素
                if (sourceIndex < targetIndex) {
                    $target.after($source);
                } else {
                    $target.before($source);
                }

                // 移除放置目标样式
                $target.removeClass('drag-over');

                // 触发排序完成事件
                $container.trigger('drag:sort-complete', [$source, $target, sourceIndex, targetIndex]);
            });

            // 处理拖拽手柄
            $container.on('mousedown', '.ffs-drag-sort-handle', function (e) {
                e.stopPropagation();

                // 触发父元素的拖拽
                const $item = $(this).closest('.ffs-drag-sort-item');

                // 模拟拖拽开始
                $item.attr('draggable', 'true');
            });
        });
    }

    /**
     * 初始化拖拽列表
     * 为带有 ffs-drag-list 类的容器内的元素添加拖拽列表功能
     */
    function initDragList() {
        $('.ffs-drag-list').each(function () {
            const $container = $(this);
            const $columns = $container.find('.ffs-drag-list-column');
            const $items = $container.find('.ffs-drag-list-item');

            // 初始化拖拽列表
            $items.attr('draggable', 'true');

            // 拖拽开始
            $container.on('dragstart', '.ffs-drag-list-item', function (e) {
                const $item = $(this);

                // 设置拖拽数据
                e.originalEvent.dataTransfer.effectAllowed = 'move';
                e.originalEvent.dataTransfer.setData('text/plain', $item.index());
                e.originalEvent.dataTransfer.setData('text/column', $item.closest('.ffs-drag-list-column').index());

                // 添加拖拽中样式
                $item.addClass('dragging');

                // 触发拖拽开始事件
                $container.trigger('drag:list-start', [$item]);
            });

            // 拖拽结束
            $container.on('dragend', '.ffs-drag-list-item', function () {
                const $item = $(this);

                // 移除拖拽中样式
                $item.removeClass('dragging');

                // 移除所有放置目标样式
                $container.find('.ffs-drag-list-item, .ffs-drag-list-column').removeClass('drag-over');

                // 触发拖拽结束事件
                $container.trigger('drag:list-end', [$item]);
            });

            // 列拖拽经过
            $container.on('dragover', '.ffs-drag-list-column', function (e) {
                e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'move';

                const $column = $(this);
                const $items = $column.find('.ffs-drag-list-item');

                // 如果列中没有项目，添加放置目标样式
                if ($items.length === 0) {
                    $column.addClass('drag-over');
                }
            });

            // 项目拖拽经过
            $container.on('dragover', '.ffs-drag-list-item', function (e) {
                e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'move';

                const $target = $(this);

                // 如果不是拖拽中的元素，添加放置目标样式
                if (!$target.hasClass('dragging')) {
                    $target.addClass('drag-over');
                }
            });

            // 列拖拽离开
            $container.on('dragleave', '.ffs-drag-list-column', function () {
                $(this).removeClass('drag-over');
            });

            // 项目拖拽离开
            $container.on('dragleave', '.ffs-drag-list-item', function () {
                $(this).removeClass('drag-over');
            });

            // 列放置
            $container.on('drop', '.ffs-drag-list-column', function (e) {
                e.preventDefault();

                const $column = $(this);
                const sourceColumnIndex = parseInt(e.originalEvent.dataTransfer.getData('text/column'), 10);
                const sourceItemIndex = parseInt(e.originalEvent.dataTransfer.getData('text/plain'), 10);
                const $sourceColumn = $columns.eq(sourceColumnIndex);
                const $sourceItem = $sourceColumn.find('.ffs-drag-list-item').eq(sourceItemIndex);

                // 如果列中没有项目，直接添加到列中
                if ($column.find('.ffs-drag-list-item').length === 0) {
                    $column.append($sourceItem);

                    // 移除放置目标样式
                    $column.removeClass('drag-over');

                    // 触发列变更事件
                    $container.trigger('drag:list-column-change', [$sourceItem, $sourceColumn, $column]);
                }
            });

            // 项目放置
            $container.on('drop', '.ffs-drag-list-item', function (e) {
                e.preventDefault();

                const $target = $(this);
                const sourceColumnIndex = parseInt(e.originalEvent.dataTransfer.getData('text/column'), 10);
                const sourceItemIndex = parseInt(e.originalEvent.dataTransfer.getData('text/plain'), 10);
                const $sourceColumn = $columns.eq(sourceColumnIndex);
                const $sourceItem = $sourceColumn.find('.ffs-drag-list-item').eq(sourceItemIndex);
                const $targetColumn = $target.closest('.ffs-drag-list-column');

                // 如果源元素和目标元素相同，不执行操作
                if ($sourceItem.get(0) === $target.get(0)) {
                    return;
                }

                // 移动元素
                $target.before($sourceItem);

                // 移除放置目标样式
                $target.removeClass('drag-over');

                // 触发列变更事件
                if ($sourceColumn.get(0) !== $targetColumn.get(0)) {
                    $container.trigger('drag:list-column-change', [$sourceItem, $sourceColumn, $targetColumn]);
                }

                // 触发排序完成事件
                $container.trigger('drag:list-complete', [$sourceItem, $target]);
            });
        });
    }

    /**
     * 初始化拖拽表格
     * 为带有 ffs-drag-table 类的容器内的表格行添加拖拽功能
     */
    function initDragTable() {
        $('.ffs-drag-table').each(function () {
            const $container = $(this);
            const $table = $container.find('table');
            const $tbody = $table.find('tbody');
            const $rows = $tbody.find('tr');

            // 初始化拖拽表格
            $rows.attr('draggable', 'true');

            // 拖拽开始
            $tbody.on('dragstart', 'tr', function (e) {
                const $row = $(this);

                // 设置拖拽数据
                e.originalEvent.dataTransfer.effectAllowed = 'move';
                e.originalEvent.dataTransfer.setData('text/plain', $rows.index($row));

                // 添加拖拽中样式
                $row.addClass('dragging');

                // 触发拖拽开始事件
                $container.trigger('drag:table-start', [$row]);
            });

            // 拖拽结束
            $tbody.on('dragend', 'tr', function () {
                const $row = $(this);

                // 移除拖拽中样式
                $row.removeClass('dragging');

                // 移除所有放置目标样式
                $tbody.find('tr').removeClass('drag-over');

                // 触发拖拽结束事件
                $container.trigger('drag:table-end', [$row]);
            });

            // 拖拽经过
            $tbody.on('dragover', 'tr', function (e) {
                e.preventDefault();
                e.originalEvent.dataTransfer.dropEffect = 'move';

                const $target = $(this);

                // 如果不是拖拽中的元素，添加放置目标样式
                if (!$target.hasClass('dragging')) {
                    $target.addClass('drag-over');
                }
            });

            // 拖拽离开
            $tbody.on('dragleave', 'tr', function () {
                $(this).removeClass('drag-over');
            });

            // 放置
            $tbody.on('drop', 'tr', function (e) {
                e.preventDefault();

                const $target = $(this);
                const sourceIndex = parseInt(e.originalEvent.dataTransfer.getData('text/plain'), 10);
                const $source = $tbody.find('tr').eq(sourceIndex);
                const targetIndex = $tbody.find('tr').index($target);

                // 如果源元素和目标元素相同，不执行操作
                if (sourceIndex === targetIndex) {
                    return;
                }

                // 移动元素
                if (sourceIndex < targetIndex) {
                    $target.after($source);
                } else {
                    $target.before($source);
                }

                // 移除放置目标样式
                $target.removeClass('drag-over');

                // 触发排序完成事件
                $container.trigger('drag:table-complete', [$source, $target, sourceIndex, targetIndex]);
            });
        });
    }

    /**
     * 初始化拖拽上传
     * 为带有 ffs-drag-upload 类的容器添加拖拽上传功能
     */
    function initDragUpload() {
        $('.ffs-drag-upload').each(function () {
            const $container = $(this);

            // 阻止默认拖放行为
            $container.on('dragover', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // 添加拖拽中样式
                $(this).addClass('dragover');

                return false;
            });

            // 拖拽离开
            $container.on('dragleave dragend drop', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // 移除拖拽中样式
                $(this).removeClass('dragover');

                return false;
            });

            // 处理文件放置
            $container.on('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();

                // 获取文件列表
                const files = e.originalEvent.dataTransfer.files;

                // 处理文件上传
                handleFileUpload($container, files);

                return false;
            });

            // 处理文件选择
            $container.on('change', 'input[type="file"]', function () {
                const files = this.files;

                // 处理文件上传
                handleFileUpload($container, files);
            });

            // 处理删除文件
            $container.on('click', '.ffs-drag-upload-item-action', function () {
                const $action = $(this);
                const $item = $action.closest('.ffs-drag-upload-item');

                // 触发文件删除事件
                $container.trigger('drag:upload-remove', [$item]);

                // 移除文件项
                $item.fadeOut(300, function () {
                    $(this).remove();
                });
            });
        });
    }

    /**
     * 处理文件上传
     * @param {jQuery} $container - 上传容器
     * @param {FileList} files - 文件列表
     */
    function handleFileUpload($container, files) {
        if (!files || files.length === 0) {
            return;
        }

        // 获取文件列表容器
        let $fileList = $container.find('.ffs-drag-upload-list');

        // 如果没有文件列表容器，创建一个
        if ($fileList.length === 0) {
            $fileList = $('<div class="ffs-drag-upload-list"></div>');
            $container.append($fileList);
        }

        // 获取配置选项
        const maxFiles = parseInt($container.data('max-files') || 0, 10);
        const maxSize = parseInt($container.data('max-size') || 0, 10);
        const allowedTypes = ($container.data('allowed-types') || '').split(',').map(type => type.trim());

        // 当前文件数量
        const currentFiles = $fileList.find('.ffs-drag-upload-item').length;

        // 处理每个文件
        Array.from(files).forEach(function (file, index) {
            // 检查文件数量限制
            if (maxFiles > 0 && currentFiles + index >= maxFiles) {
                $container.trigger('drag:upload-error', [file, '超出最大文件数量限制']);
                return;
            }

            // 检查文件大小限制
            if (maxSize > 0 && file.size > maxSize * 1024 * 1024) {
                $container.trigger('drag:upload-error', [file, '文件大小超出限制']);
                return;
            }

            // 检查文件类型限制
            if (allowedTypes.length > 0 && allowedTypes[0] !== '') {
                const fileType = file.type.split('/')[0];
                const fileExt = file.name.split('.').pop().toLowerCase();

                if (!allowedTypes.includes(fileType) && !allowedTypes.includes(fileExt)) {
                    $container.trigger('drag:upload-error', [file, '不支持的文件类型']);
                    return;
                }
            }

            // 创建文件项
            const $item = createFileItem(file);

            // 添加到文件列表
            $fileList.append($item);

            // 触发文件添加事件
            $container.trigger('drag:upload-add', [file, $item]);

            // 如果需要自动上传
            if ($container.data('auto-upload') === 'true') {
                // 模拟上传进度
                simulateUploadProgress($item, function () {
                    // 上传完成后触发事件
                    $container.trigger('drag:upload-success', [file, $item]);
                });
            }
        });
    }

    /**
     * 创建文件项
     * @param {File} file - 文件对象
     * @returns {jQuery} 文件项元素
     */
    function createFileItem(file) {
        // 获取文件图标
        const fileIcon = getFileIcon(file.type);

        // 格式化文件大小
        const fileSize = formatFileSize(file.size);

        // 创建文件项
        const $item = $(`
            <div class="ffs-drag-upload-item">
                <i class="${fileIcon} ffs-drag-upload-item-icon"></i>
                <span class="ffs-drag-upload-item-name">${file.name}</span>
                <span class="ffs-drag-upload-item-size">${fileSize}</span>
                <div class="ffs-drag-upload-item-progress">
                    <div class="ffs-drag-upload-item-progress-bar" style="width: 0%"></div>
                </div>
                <div class="ffs-drag-upload-item-actions">
                    <i class="fas fa-times ffs-drag-upload-item-action"></i>
                </div>
            </div>
        `);

        // 保存文件对象
        $item.data('file', file);

        return $item;
    }

    /**
     * 获取文件图标
     * @param {string} fileType - 文件MIME类型
     * @returns {string} 图标类名
     */
    function getFileIcon(fileType) {
        const type = fileType.split('/')[0];

        switch (type) {
            case 'image':
                return 'fas fa-image';
            case 'video':
                return 'fas fa-video';
            case 'audio':
                return 'fas fa-music';
            case 'text':
                return 'fas fa-file-alt';
            case 'application':
                if (fileType.includes('pdf')) {
                    return 'fas fa-file-pdf';
                } else if (fileType.includes('word') || fileType.includes('document')) {
                    return 'fas fa-file-word';
                } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
                    return 'fas fa-file-excel';
                } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
                    return 'fas fa-file-powerpoint';
                } else if (fileType.includes('zip') || fileType.includes('compressed')) {
                    return 'fas fa-file-archive';
                } else {
                    return 'fas fa-file';
                }
                default:
                    return 'fas fa-file';
        }
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 文件大小（字节）
     * @returns {string} 格式化后的文件大小
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 模拟上传进度
     * @param {jQuery} $item - 文件项元素
     * @param {Function} callback - 上传完成后的回调函数
     */
    function simulateUploadProgress($item, callback) {
        const $progressBar = $item.find('.ffs-drag-upload-item-progress-bar');
        let progress = 0;

        // 添加上传中状态
        $item.addClass('uploading');

        // 模拟进度更新
        const interval = setInterval(function () {
            progress += Math.random() * 10;

            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);

                // 移除上传中状态
                $item.removeClass('uploading').addClass('uploaded');

                // 调用回调函数
                if (typeof callback === 'function') {
                    callback();
                }
            }

            $progressBar.css('width', progress + '%');
        }, 200);
    }

    /**
     * 拖拽API
     * 提供拖拽功能的公共方法
     */
    $.ffsDrag = {
        /**
         * 初始化拖拽排序
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        initSort: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                itemSelector: '.ffs-drag-sort-item',
                handleSelector: '.ffs-drag-sort-handle',
                onStart: null,
                onEnd: null,
                onComplete: null
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 添加类
            $container.addClass('ffs-drag-sort');

            // 初始化拖拽
            const $items = $container.find(settings.itemSelector);
            $items.attr('draggable', 'true');

            // 绑定事件
            if (typeof settings.onStart === 'function') {
                $container.on('drag:sort-start', function (e, $item) {
                    settings.onStart($item);
                });
            }

            if (typeof settings.onEnd === 'function') {
                $container.on('drag:sort-end', function (e, $item) {
                    settings.onEnd($item);
                });
            }

            if (typeof settings.onComplete === 'function') {
                $container.on('drag:sort-complete', function (e, $source, $target, sourceIndex, targetIndex) {
                    settings.onComplete($source, $target, sourceIndex, targetIndex);
                });
            }

            return $container;
        },

        /**
         * 初始化拖拽列表
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        initList: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                columnSelector: '.ffs-drag-list-column',
                itemSelector: '.ffs-drag-list-item',
                onStart: null,
                onEnd: null,
                onComplete: null,
                onColumnChange: null
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 添加类
            $container.addClass('ffs-drag-list');

            // 初始化拖拽
            const $items = $container.find(settings.itemSelector);
            $items.attr('draggable', 'true');

            // 绑定事件
            if (typeof settings.onStart === 'function') {
                $container.on('drag:list-start', function (e, $item) {
                    settings.onStart($item);
                });
            }

            if (typeof settings.onEnd === 'function') {
                $container.on('drag:list-end', function (e, $item) {
                    settings.onEnd($item);
                });
            }

            if (typeof settings.onComplete === 'function') {
                $container.on('drag:list-complete', function (e, $source, $target) {
                    settings.onComplete($source, $target);
                });
            }

            if (typeof settings.onColumnChange === 'function') {
                $container.on('drag:list-column-change', function (e, $item, $sourceColumn, $targetColumn) {
                    settings.onColumnChange($item, $sourceColumn, $targetColumn);
                });
            }

            return $container;
        },

        /**
         * 初始化拖拽表格
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        initTable: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                rowSelector: 'tbody tr',
                onStart: null,
                onEnd: null,
                onComplete: null
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 添加类
            $container.addClass('ffs-drag-table');

            // 初始化拖拽
            const $rows = $container.find(settings.rowSelector);
            $rows.attr('draggable', 'true');

            // 绑定事件
            if (typeof settings.onStart === 'function') {
                $container.on('drag:table-start', function (e, $row) {
                    settings.onStart($row);
                });
            }

            if (typeof settings.onEnd === 'function') {
                $container.on('drag:table-end', function (e, $row) {
                    settings.onEnd($row);
                });
            }

            if (typeof settings.onComplete === 'function') {
                $container.on('drag:table-complete', function (e, $source, $target, sourceIndex, targetIndex) {
                    settings.onComplete($source, $target, sourceIndex, targetIndex);
                });
            }

            return $container;
        },

        /**
         * 初始化拖拽上传
         * @param {string} selector - 容器选择器
         * @param {object} options - 配置选项
         */
        initUpload: function (selector, options = {}) {
            const $container = $(selector);

            if (!$container.length) return;

            // 默认配置
            const defaults = {
                maxFiles: 0,
                maxSize: 0,
                allowedTypes: '',
                autoUpload: false,
                onAdd: null,
                onRemove: null,
                onError: null,
                onSuccess: null
            };

            // 合并配置
            const settings = $.extend({}, defaults, options);

            // 添加类
            $container.addClass('ffs-drag-upload');

            // 设置数据属性
            $container.data('max-files', settings.maxFiles);
            $container.data('max-size', settings.maxSize);
            $container.data('allowed-types', settings.allowedTypes);
            $container.data('auto-upload', settings.autoUpload);

            // 绑定事件
            if (typeof settings.onAdd === 'function') {
                $container.on('drag:upload-add', function (e, file, $item) {
                    settings.onAdd(file, $item);
                });
            }

            if (typeof settings.onRemove === 'function') {
                $container.on('drag:upload-remove', function (e, $item) {
                    settings.onRemove($item);
                });
            }

            if (typeof settings.onError === 'function') {
                $container.on('drag:upload-error', function (e, file, errorMessage) {
                    settings.onError(file, errorMessage);
                });
            }

            if (typeof settings.onSuccess === 'function') {
                $container.on('drag:upload-success', function (e, file, $item) {
                    settings.onSuccess(file, $item);
                });
            }

            return $container;
        },

        /**
         * 获取拖拽排序后的项目
         * @param {string} selector - 容器选择器
         * @returns {Array} 排序后的项目数组
         */
        getSortedItems: function (selector) {
            const $container = $(selector);

            if (!$container.length) return [];

            const items = [];

            $container.find('.ffs-drag-sort-item').each(function () {
                const $item = $(this);
                const itemData = $item.data('item') || {};

                items.push({
                    element: $item,
                    data: itemData
                });
            });

            return items;
        },

        /**
         * 获取拖拽列表中的项目
         * @param {string} selector - 容器选择器
         * @returns {Object} 列表中的项目对象
         */
        getListItems: function (selector) {
            const $container = $(selector);

            if (!$container.length) return {};

            const columns = {};

            $container.find('.ffs-drag-list-column').each(function () {
                const $column = $(this);
                const columnId = $column.attr('id') || $column.data('id') || $column.index();
                const items = [];

                $column.find('.ffs-drag-list-item').each(function () {
                    const $item = $(this);
                    const itemData = $item.data('item') || {};

                    items.push({
                        element: $item,
                        data: itemData
                    });
                });

                columns[columnId] = items;
            });

            return columns;
        },

        /**
         * 获取拖拽表格中的行
         * @param {string} selector - 容器选择器
         * @returns {Array} 表格中的行数组
         */
        getTableRows: function (selector) {
            const $container = $(selector);

            if (!$container.length) return [];

            const rows = [];

            $container.find('tbody tr').each(function () {
                const $row = $(this);
                const rowData = $row.data('row') || {};

                rows.push({
                    element: $row,
                    data: rowData
                });
            });

            return rows;
        },

        /**
         * 获取上传的文件
         * @param {string} selector - 容器选择器
         * @returns {Array} 上传的文件数组
         */
        getUploadedFiles: function (selector) {
            const $container = $(selector);

            if (!$container.length) return [];

            const files = [];

            $container.find('.ffs-drag-upload-item').each(function () {
                const $item = $(this);
                const file = $item.data('file');

                if (file) {
                    files.push({
                        file: file,
                        element: $item,
                        status: $item.hasClass('uploaded') ? 'uploaded' : 'pending'
                    });
                }
            });

            return files;
        },

        /**
         * 启动上传
         * @param {string} selector - 容器选择器
         * @param {Function} uploadHandler - 上传处理函数
         */
        startUpload: function (selector, uploadHandler) {
            const $container = $(selector);

            if (!$container.length) return;

            const $items = $container.find('.ffs-drag-upload-item:not(.uploaded)');

            $items.each(function () {
                const $item = $(this);
                const file = $item.data('file');

                if (file && typeof uploadHandler === 'function') {
                    // 添加上传中状态
                    $item.addClass('uploading');

                    // 调用上传处理函数
                    uploadHandler(file, $item, function (progress) {
                        // 更新进度条
                        const $progressBar = $item.find('.ffs-drag-upload-item-progress-bar');
                        $progressBar.css('width', progress + '%');

                        // 如果上传完成
                        if (progress >= 100) {
                            // 移除上传中状态
                            $item.removeClass('uploading').addClass('uploaded');

                            // 触发上传成功事件
                            $container.trigger('drag:upload-success', [file, $item]);
                        }
                    });
                }
            });
        },

        /**
         * 清除上传文件
         * @param {string} selector - 容器选择器
         */
        clearUpload: function (selector) {
            const $container = $(selector);

            if (!$container.length) return;

            // 移除所有文件项
            $container.find('.ffs-drag-upload-item').remove();

            // 移除文件列表
            $container.find('.ffs-drag-upload-list').remove();
        }
    };

    // 初始化拖拽组件
    $(function () {
        initDragSort();
        initDragList();
        initDragTable();
        initDragUpload();
    });

})(jQuery);