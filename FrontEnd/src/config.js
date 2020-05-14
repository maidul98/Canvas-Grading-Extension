module.exports = {
    header:{
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Credentials': true
        }
    },
    backend:{
        url:'http://localhost:5000'
    }

};