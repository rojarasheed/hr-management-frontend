import Cookies from 'js-cookie';

const AUTH_COOKIE_OPTIONS = {
    expires: 7,
    sameSite: 'strict',
};

const COOKIE_KEYS = {
    token: 'token',
    user: 'user',
    employee: 'employee',
};

const safeJsonParse = (value) => {
    try {
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

export const setAuth = (token, user, employee) => {
    Cookies.set(COOKIE_KEYS.token, token, AUTH_COOKIE_OPTIONS);
    Cookies.set(COOKIE_KEYS.user, JSON.stringify(user), AUTH_COOKIE_OPTIONS);
    Cookies.set(COOKIE_KEYS.employee, JSON.stringify(employee), AUTH_COOKIE_OPTIONS);
};

export const getToken = () => {
    return Cookies.get(COOKIE_KEYS.token) || null;
};

export const getUser = () => {
    return safeJsonParse(Cookies.get(COOKIE_KEYS.user));
};

export const getEmployee = () => {
    return safeJsonParse(Cookies.get(COOKIE_KEYS.employee));
};

export const isAuthenticated = () => {
    return Boolean(getToken());
};

export const isAdmin = () => {
    const employee = getEmployee();
    return employee?.role === 'admin';
};

export const clearAuth = () => {
    Cookies.remove(COOKIE_KEYS.token);
    Cookies.remove(COOKIE_KEYS.user);
    Cookies.remove(COOKIE_KEYS.employee);
};

export const logout = () => {
    clearAuth();

    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
};