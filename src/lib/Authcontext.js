import React from 'react'

export const UserProvider = ({ children }) => {
    const user: any = {
        id: '1',
        name: 'priya',
        email: 'priya@gmail.com',
        image: ''
    }

    return <div>{children}</div>
}

export default UserProvider 