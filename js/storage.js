const KEY = "finance-assistant";

export function loadUser() {

    return JSON.parse(
        localStorage.getItem(KEY)
    );

}

export function saveUser(data){

    localStorage.setItem(
        KEY,
        JSON.stringify(data)
    );

}
