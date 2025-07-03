import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(
    localStorageKey: string,
    initialValue: T,
    parser?: (value: string) => T
) {
    let storedValue: T = initialValue;
    try {
        const storedValueRaw = localStorage.getItem(localStorageKey);
        if (storedValueRaw) {
            if (parser) storedValue = parser(storedValueRaw);
            else storedValue = JSON.parse(storedValueRaw) as T;
        }
    } catch (err) {
        console.error(err);
    }

    const [value, setValue] = useState<T>(storedValue);

    useEffect(() => {
        localStorage.setItem(localStorageKey, JSON.stringify(value));
    }, [value, localStorageKey]);

    const removeValue = useCallback(
        (syncState: boolean = true) => {
            localStorage.removeItem(localStorageKey);
            if (syncState) setValue(initialValue);
        },
        [localStorageKey, initialValue]
    );

    return [value, setValue, removeValue] as const;
}
