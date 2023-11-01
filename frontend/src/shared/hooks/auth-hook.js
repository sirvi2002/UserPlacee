import { useCallback, useState, useEffect } from "react";

let logoutTimer;

export const useAuth = () => {
    const [token, setToken] = useState(null);
    const [tokenExiprationDate, setTokenExpirationDate] = useState();
    const [userId, setUserId] = useState(false);

    const login = useCallback((uid, token, expirationDate) => {
        setToken(token);

        setUserId(uid);
        const tokenExiprationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
        setTokenExpirationDate(tokenExiprationDate);

        localStorage.setItem('userData', JSON.stringify({ userId: uid, token: token, expiration: tokenExiprationDate.toISOString() }));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setTokenExpirationDate(null);
        setUserId(null);
        localStorage.removeItem('userData');
    }, []);

    useEffect(() => {
        if (token && tokenExiprationDate) {
            const remainingTime = tokenExiprationDate.getTime() - new Date().getTime();
            logoutTimer = setTimeout(logout, remainingTime);
        } else {
            clearTimeout(logoutTimer);
        }
    }, [token, logout, tokenExiprationDate]);

    useEffect(() => {
        const storedData = JSON.parse(localStorage.getItem('userData'));
        if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) {
            login(storedData.userId, storedData.token, new Date(storedData.expiration));
        }
    }, [login]);

    return { token, login, logout, userId };
};