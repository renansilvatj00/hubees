const database = require('../config/database');
const getParam = require('../helpers/get-param');
const ObjectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt');

async function getAll(filter) {
    const active = Number(getParam(filter, 'active', 1));

    const db = await database.connect();
    return db.collection('users').find({
        active,
        deletedAt: {
            $exists: false
        }
    }, {
        projection: {
            name: 1,
            email: 1
        }
    }).toArray();
}

async function create(fields) {
    const name = getParam(fields, 'name');
    const email = getParam(fields, 'email');
    const password = getParam(fields, 'password');

    const saltPassword = bcrypt.genSaltSync(10);
    const newPassword = bcrypt.hashSync(password, saltPassword);

    const db = await database.connect();
    const { insertedId } = await db.collection('users').insertOne({
        name,
        email,
        password: newPassword,
        salt: saltPassword,
        active: 1,
        createdAt: new Date()
    });

    return getOne(insertedId);
}

async function getOne(userId, filter) {
    const active = Number(getParam(filter, 'active', 1))

    const db = await database.connect()
    const user = await db.collection('users').find({
        _id: ObjectId(userId),
        active,
        deletedAt: {
            $exists: false
        }
    }, {
        projection: {
            name: 1,
            email: 1
        }
    }).toArray()
    return user[0] || null
}

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

async function update(userId, fields) {
    const name = getParam(fields, 'name')
    const active = getParam(fields, 'active', 1)
    const deletedAt = getParam(fields, 'deletedAt')

    const updateFields = {}

    if (name !== null) updateFields.name = name
    if (active !== null) updateFields.active = active
    if (deletedAt !== null) updateFields.deletedAt = deletedAt

    const db = await database.connect()
    await db.collection('users').updateOne({
        _id: ObjectId(userId)
    }, {
        $set: updateFields
    })

    return getOne(userId, {
        active
    })
}

async function deleteUser(userId) {

    const db = await database.connect()
    await db.collection('users').updateOne({
        _id: ObjectId(userId)
    }, {
        $set: {
            deletedAt: new Date()
        }
    })

    return true
}

module.exports = {
    getAll,
    create,
    getOneByEmail,
    getOne,
    update,
    deleteUser
}