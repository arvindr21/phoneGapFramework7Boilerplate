/*===============================================================================
************   Swipeout Actions (Swipe to delete)   ************
===============================================================================*/
app.swipeoutOpenedEl = undefined;
app.allowSwipeout = true;
app.initSwipeout = function () {
    var isTouched, isMoved, isScrolling, touchesStart = {}, touchStartTime, touchesDiff, swipeOutEl, swipeOutContent, swipeOutActions, swipeOutActionsWidth, translate, opened;
    $(document).on(app.touchEvents.start, function (e) {
        if (app.swipeoutOpenedEl) {
            var target = $(e.target);
            if (!(
                app.swipeoutOpenedEl.is(target[0]) ||
                target.parents('.swipeout').is(app.swipeoutOpenedEl) ||
                target.hasClass('modal-in') ||
                target.parents('.modal-in').length > 0 ||
                target.hasClass('modal-overlay')
                )) {
                app.swipeoutClose(app.swipeoutOpenedEl);
            }
        }
    });
    

    function handleTouchStart(e) {
        if (!app.allowSwipeout) return;
        isMoved = false;
        isTouched = true;
        isScrolling = undefined;
        touchesStart.x = e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
        touchesStart.y = e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
        touchStartTime = (new Date()).getTime();

    }
    function handleTouchMove(e) {
        if (!isTouched) return;
        var pageX = e.type === 'touchmove' ? e.targetTouches[0].pageX : e.pageX;
        var pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
        if (typeof isScrolling === 'undefined') {
            isScrolling = !!(isScrolling || Math.abs(pageY - touchesStart.y) > Math.abs(pageX - touchesStart.x));
        }
        if (isScrolling) {
            isTouched = false;
            return;
        }

        if (!isMoved) {
            /*jshint validthis:true */
            swipeOutEl = $(this);
            swipeOutContent = swipeOutEl.find('.swipeout-content');
            swipeOutActions = swipeOutEl.find('.swipeout-actions-inner');
            swipeOutActionsWidth = swipeOutActions.width();
            opened = swipeOutEl.hasClass('swipeout-opened');
            swipeOutEl.removeClass('transitioning');
        }
        isMoved = true;

        e.preventDefault();
        touchesDiff = pageX - touchesStart.x;
        translate = touchesDiff  - (opened ? swipeOutActionsWidth : 0);
        if (translate > 0) translate = 0;
        if (translate < -swipeOutActionsWidth) {
            translate = -swipeOutActionsWidth - Math.pow(-translate - swipeOutActionsWidth, 0.8);
        }
        
        swipeOutContent.transform('translate3d(' + translate + 'px,0,0)');

    }
    function handleTouchEnd(e) {
        if (!isTouched || !isMoved) {
            isTouched = false;
            isMoved = false;
            return;
        }
        isTouched = false;
        isMoved = false;
        var timeDiff = (new Date()).getTime() - touchStartTime;
        if (!(translate === 0 || translate === -swipeOutActionsWidth)) app.allowSwipeout = false;
        
        var action;
        if (opened) {
            if (
                timeDiff < 300 && translate > -(swipeOutActionsWidth - 10) ||
                timeDiff >= 300 && translate > -swipeOutActionsWidth / 2
            ) {
                action = 'close';
            }
            else {
                action = 'open';
            }
        }
        else {
            if (
                timeDiff < 300 && translate < -10 ||
                timeDiff >= 300 && translate < -swipeOutActionsWidth / 2
            ) {
                action = 'open';
            }
            else {
                action = 'close';
            }
        }
        if (action === 'open') {
            app.swipeoutOpenedEl = swipeOutEl;
            swipeOutEl.trigger('open');
            swipeOutEl.addClass('swipeout-opened transitioning');
            swipeOutContent.transform('translate3d(' + -swipeOutActionsWidth + 'px,0,0)');
        }
        else {
            swipeOutEl.trigger('close');
            app.swipeoutOpenedEl = undefined;
            swipeOutEl.addClass('transitioning').removeClass('swipeout-opened');
            swipeOutContent.transform('translate3d(' + 0 + 'px,0,0)');
        }
        swipeOutContent.transitionEnd(function () {
            app.allowSwipeout = true;
            swipeOutEl.trigger(action === 'open' ? 'opened' : 'closed');
        });
    }
    $(document).on(app.touchEvents.start, '.list-block li.swipeout', handleTouchStart);
    $(document).on(app.touchEvents.move, '.list-block li.swipeout', handleTouchMove);
    $(document).on(app.touchEvents.end, '.list-block li.swipeout', handleTouchEnd);
};
app.swipeoutOpen = function (el) {
    el = $(el);
    if (!el.hasClass('swipeout')) return;
    if (el.length === 0) return;
    if (el.length > 1) el = $(el[0]);
    el.trigger('open').addClass('transitioning swipeout-opened');
    var swipeOutActions = el.find('.swipeout-actions-inner');
    el.find('.swipeout-content').transform('translate3d(-' + swipeOutActions.width() + 'px,0,0)').transitionEnd(function () {
        el.trigger('opened');
    });
    app.swipeoutOpenedEl = el;
};
app.swipeoutClose = function (el) {
    el = $(el);
    if (el.length === 0) return;
    app.allowSwipeout = false;
    el.trigger('close');
    el.removeClass('swipeout-opened')
        .addClass('transitioning')
    .find('.swipeout-content')
        .transform('translate3d(' + 0 + 'px,0,0)')
        .transitionEnd(function () {
            el.trigger('closed');
            app.allowSwipeout = true;
        });

    if (app.swipeoutOpenedEl[0] === el[0]) app.swipeoutOpenedEl = undefined;
};
app.swipeoutDelete = function (el) {
    el = $(el);
    if (el.length === 0) return;
    if (el.length > 1) el = $(el[0]);
    app.swipeoutOpenedEl = undefined;
    el.trigger('delete');
    el.css({height: el.outerHeight() + 'px'});
    var clientLeft = el[0].clientLeft;
    el.css({height: 0 + 'px'}).addClass('deleting transitioning').transitionEnd(function () {
        el.trigger('deleted');
        el.remove();
    });
    el.find('.swipeout-content').transform('translate3d(-100%,0,0)');
};