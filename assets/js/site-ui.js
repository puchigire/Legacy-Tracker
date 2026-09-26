(() => {
    const root = document.documentElement;

    const startLoading = () => root.classList.add('site-loading');
    const stopLoading = () => root.classList.remove('site-loading');

    window.addEventListener('pageshow', stopLoading);
    window.addEventListener('beforeunload', startLoading);

    document.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const link = event.target.closest('a[href]');
        if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

        const rawHref = link.getAttribute('href') || '';
        if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;

        startLoading();
    }, true);

    window.LegacyTrackerLoadingCursor = Object.freeze({ start: startLoading, stop: stopLoading });
})();
