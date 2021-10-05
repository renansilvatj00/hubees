const database = require('../config/database')

async function getOneByEmail(email) {
    const db = await database.connect()
    const user = await db.collection('users').find({
        email,
        deletedAt: {
            $exists: false
        }
    }).toArray()
    return user[0] || null
}

module.exports = {
    getOneByEmail
}