/**
 * Removes the alert from the (get) variable and sets it using the (set) method 
 * @param {*} event 
 * @param {*} get 
 * @param {*} set 
 */
export function removeAlert(event, get, set){
    let temp = [...get]
    let index = event.target.parentNode.parentNode.getAttribute('data-index')
    temp.splice(index,1)
    set(temp)
}

export function autoRemoveAlert(get, set){
    let temp = [...get]
    console.log(temp.length)
    while(temp.length != 0){
        console.log('hey')
        temp.pop()
        setTimeout(()=>{
            set(temp)
        }, 2000)
    }
}

