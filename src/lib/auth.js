import Cookies from 'js-cookie';

export const setAuth = (token, user, employee) => {
    Cookies.set('token', token, { expires: 7 });
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
    Cookies.set('employee', JSON.stringify(employee), { expires: 7 });
};

export const getToken = () => Cookies.get('token');

export const getUser = () => {
    const user = Cookies.get('user');
    return user ? JSON.parse(user) : null;
};

export const getEmployee = () => {
    const employee = Cookies.get('employee');
    return employee ? JSON.parse(employee) : null;
};

export const isAdmin = () => {
    const employee = getEmployee();
    return employee?.role === 'admin';
};

export const isAuthenticated = () => !!getToken();

export const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    Cookies.remove('employee');
    window.location.href = '/login';
};