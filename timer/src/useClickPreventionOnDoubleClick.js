import React, { useRef } from "react";

export const delay = n => new Promise(resolve => setTimeout(resolve, n));

const cancellablePromise = promise => {
    let isCanceled = false;

    const wrappedPromise = new Promise((resolve, reject) => {
        promise.then(
            value => (isCanceled ? reject({ isCanceled, value }) : resolve(value)),
            error => reject({ isCanceled, error }),
        );
    });

    return {
        promise: wrappedPromise,
        cancel: () => (isCanceled = true),
    };
};

const useCancellablePromises = () => {
    const pendingPromises = useRef([]);

    const appendPendingPromise = promise =>
        pendingPromises.current = [...pendingPromises.current, promise];

    const removePendingPromise = promise =>
        pendingPromises.current = pendingPromises.current.filter(p => p !== promise);

    const clearPendingPromises = () => pendingPromises.current.map(p => p.cancel());

    return {
        appendPendingPromise,
        removePendingPromise,
        clearPendingPromises,
    };
};


const useClickPreventionOnDoubleClick = (onClick, onDoubleClick) => {
    const api = useCancellablePromises();

    const handleClick = () => {
        api.clearPendingPromises();
        const waitForClick = cancellablePromise(delay(300));
        api.appendPendingPromise(waitForClick);

        return waitForClick.promise
            .then(() => {
                api.removePendingPromise(waitForClick);
                onClick();
            })
            .catch(errorInfo => {
                api.removePendingPromise(waitForClick);
                if (!errorInfo.isCanceled) {
                    throw errorInfo.error;
                }
            });
    };

    const handleDoubleClick = () => {
        api.clearPendingPromises();
        onDoubleClick();
    };

    return [handleClick, handleDoubleClick];
};

export default useClickPreventionOnDoubleClick;