export function isEmpty(obj: object | null | undefined | string | number ) {

    if (obj === null || obj === undefined) return true

    if( typeof obj == 'object'){
        return Object.keys(obj).length === 0
    }

    if(typeof obj == 'string'){
        return obj.length === 0
    }

    if(typeof obj == 'number'){
        return obj == 0
    }

  return false
}

