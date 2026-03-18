window.Hubgee = window.Hubgee || {};

window.Hubgee.Logger = (function() {
    const prefix = '%c[Hubgee3]';
    const baseStyle = 'font-weight: bold; border-radius: 3px; padding: 2px 6px;';
    
    const styles = {
        info: `${baseStyle} background: #2563eb; color: white;`,
        warn: `${baseStyle} background: #d97706; color: white;`,
        error: `${baseStyle} background: #dc2626; color: white;`,
        debug: `${baseStyle} background: #4b5563; color: white;`
    };

    function isDebug() {
        // Will safely pull the debug state from Config once it's loaded
        return window.Hubgee.Config ? window.Hubgee.Config.isDebug() : true;
    }

    return {
        info: (...args) => console.log(prefix, styles.info, ...args),
        warn: (...args) => console.warn(prefix, styles.warn, ...args),
        error: (...args) => console.error(prefix, styles.error, ...args),
        debug: (...args) => {
            if (isDebug()) console.log(prefix, styles.debug, ...args);
        }
    };
})();
