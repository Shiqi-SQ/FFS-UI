/*!
 * FFS-UI / Button
 * 职责：
 *  - loading/reset API（无 FontAwesome 依赖，内置 CSS spinner）
 *  - 涟漪动画（命名空间事件、一次绑定、动画结束移除）
 *  - 按钮组单选（.ffs-button-group.ffs-button-group-radio）
 *  - 对外 API：FFS.button.{loading,reset,selectInGroup,getSelectedValue,disable,enable,destroy,isBound}
 */

(function ($) {
    'use strict';

    if (!$ || !$.fn || !$.fn.on) {
        console.error('[FFS Button] jQuery is required.');
        return;
    }

    var NS = 'ffs.button';
    var CLICK_NS = 'click.' + NS;
    var DATA_KEY_ORIGINAL_HTML = 'ffs-button-original-html';

    // 全局命名空间
    window.FFS = window.FFS || {};
    var FFS = window.FFS;
    FFS.button = FFS.button || {};

    // 如果已绑定，直接返回（避免重复注册）
    if (FFS.button.__bound) {
        return;
    }

    /* --------------------------------------------------------------------------
     * jQuery 插件方法：buttonLoading / buttonReset
     * ------------------------------------------------------------------------ */
    $.fn.buttonLoading = function (text) {
        return this.each(function () {
            var $btn = $(this);
            if ($btn.data('loading')) return;

            $btn.data('loading', true);
            $btn.attr({
                    'aria-busy': 'true',
                    'aria-disabled': 'true'
                })
                .prop('disabled', true)
                .addClass('ffs-button-loading');

            // 如传入文本，则用内置 CSS spinner + 文本
            if (text != null && text !== '') {
                if ($btn.data(DATA_KEY_ORIGINAL_HTML) == null) {
                    $btn.data(DATA_KEY_ORIGINAL_HTML, $btn.html());
                }
                $btn.html('<span class="ffs-button-spinner" aria-hidden="true"></span>' + text);
            }
        });
    };

    $.fn.buttonReset = function () {
        return this.each(function () {
            var $btn = $(this);
            var original = $btn.data(DATA_KEY_ORIGINAL_HTML);

            if (original != null) $btn.html(original);

            $btn.removeData('loading')
                .removeAttr('aria-busy aria-disabled')
                .prop('disabled', false)
                .removeClass('ffs-button-loading');
        });
    };

    /* --------------------------------------------------------------------------
     * 事件绑定（命名空间化，一次绑定）
     * ------------------------------------------------------------------------ */

    // 先清理潜在旧绑定（防止二次引入）
    $(document).off(CLICK_NS);

    // 涟漪动画：根据点击位置动态计算直径
    $(document).on(CLICK_NS, '.ffs-button', function (e) {
        // 尊重用户动效偏好
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        var $btn = $(this);
        if ($btn.is(':disabled') || $btn.hasClass('ffs-button-loading')) return;

        var offset = $btn.offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;

        var w = $btn.outerWidth();
        var h = $btn.outerHeight();
        var maxDist = Math.sqrt(Math.pow(Math.max(x, w - x), 2) + Math.pow(Math.max(y, h - y), 2));
        var diameter = Math.ceil(maxDist * 2);

        var $ripple = $('<span class="ffs-button-ripple"></span>').css({
            width: diameter,
            height: diameter,
            top: y - diameter / 2,
            left: x - diameter / 2
        });

        $btn.append($ripple);
        $ripple.one('animationend', function () {
            $(this).remove();
        });
    });

    // 按钮组：单选
    $(document).on(CLICK_NS, '.ffs-button-group.ffs-button-group-radio .ffs-button', function () {
        var $btn = $(this);
        var $group = $btn.closest('.ffs-button-group');

        $group.find('.ffs-button').removeClass('ffs-button-active');
        $btn.addClass('ffs-button-active');

        var value = $btn.data('value');
        if (value == null || value === '') value = $btn.text();
        $group.trigger('buttongroup:change', [value, $btn]);
    });

    /* --------------------------------------------------------------------------
     * 对外 API（合并扩展，不覆写已有键）
     * ------------------------------------------------------------------------ */
    function $(sel) {
        return window.jQuery(sel);
    } // 防止压缩器误伤

    var api = {
        loading: function (selector, text) {
            (selector instanceof window.jQuery ? selector : $(selector)).buttonLoading(text);
            return true;
        },
        reset: function (selector) {
            (selector instanceof window.jQuery ? selector : $(selector)).buttonReset();
            return true;
        },
        selectInGroup: function (selector, value) {
            var $group = (selector instanceof window.jQuery ? selector : $(selector));
            if (!$group.hasClass('ffs-button-group-radio')) return;

            var $buttons = $group.find('.ffs-button');
            $buttons.removeClass('ffs-button-active');
            $buttons.each(function () {
                var $b = window.jQuery(this);
                if ($b.data('value') === value || $b.text() === String(value)) {
                    $b.addClass('ffs-button-active');
                    $group.trigger('buttongroup:change', [value, $b]);
                    return false;
                }
            });
        },
        getSelectedValue: function (selector) {
            var $group = (selector instanceof window.jQuery ? selector : $(selector));
            if (!$group.hasClass('ffs-button-group-radio')) return null;
            var $sel = $group.find('.ffs-button-active').first();
            return $sel.length ? ($sel.data('value') != null ? $sel.data('value') : $sel.text()) : null;
        },
        disable: function (selector) {
            (selector instanceof window.jQuery ? selector : $(selector))
            .prop('disabled', true)
                .addClass('ffs-button-disabled');
        },
        enable: function (selector) {
            (selector instanceof window.jQuery ? selector : $(selector))
            .prop('disabled', false)
                .removeClass('ffs-button-disabled');
        },
        destroy: function () {
            $(document).off(CLICK_NS);
            FFS.button.__bound = false;
        },
        isBound: function () {
            return !!FFS.button.__bound;
        },
        __bound: true
    };

    // 仅填充缺失键，避免与其他模块并发扩展时相互覆盖
    for (var k in api) {
        if (!Object.prototype.hasOwnProperty.call(FFS.button, k)) {
            FFS.button[k] = api[k];
        }
    }

})(window.jQuery);