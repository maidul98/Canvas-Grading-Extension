export function login(){
    localStorage.setItem('jtw-token', 'fake-token');
    return true;

}

export function isLoggedIn(){
    if(localStorage.getItem('jtw-token') == null){
        return false;
    }
    return true;
}

export function logout(){
    localStorage.removeItem('jtw-token');
    return true;
}


export default {login, isLoggedIn, logout};

