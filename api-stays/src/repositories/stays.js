const database = require('../config/database');
const getParam = require('../helpers/get-param');
const ObjectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt');

async function getAll(userId) {
    const db = await database.connect();
    return db.collection('userStays').find({
        user: ObjectId(userId)
    }, {
        projection: {
            user: 0
        }
    }).toArray();
}

async function getOpenedStays(userId) {
    const db = await database.connect();

    const stay = await db.collection('userStays')
        .find({
            user: ObjectId(userId),
            closedAt: {
                $exists: false
            },
            paidAt: {
                $exists: false
            },
            paymentApprovedAt: {
                $exists: false
            },
            paymentDisapprovedAt: {
                $exists: false
            }
        })
        .toArray();

    return stay;
}

async function getClosedStays(userId) {
    const db = await database.connect();

    const stay = await db.collection('userStays')
        .find({
            user: ObjectId(userId),
            closedAt: {
                $exists: true
            },
            paidAt: {
                $exists: false
            },
            paymentApprovedAt: {
                $exists: false
            },
            paymentDisapprovedAt: {
                $exists: false
            }
        })
        .toArray();

    return stay;
}

async function create(userId, fields) {
    const openedAtTimestamp = getParam(fields, 'openedAtTimestamp');

    const db = await database.connect();
    const { insertedId } = await db.collection('userStays').insertOne({
        user: ObjectId(userId),
        openedAt: new Date(openedAtTimestamp)
    })

    return getOne(userId, insertedId);
}

async function close(userId, stayId, closedAtTimestamp) {
    const db = await database.connect()
    await db.collection('userStays').updateOne({
        user: ObjectId(userId),
        _id: ObjectId(stayId)
    }, {
        $set: {
            closedAt: new Date(closedAtTimestamp)
        }
    })

    return getOne(userId, stayId)
}

async function update(userId, stayId, newEntryTime) {
    const db = await database.connect()
    await db.collection('userStays').updateOne({
        user: ObjectId(userId),
        _id: ObjectId(stayId)
    }, {
        $set: {
            openedAt: new Date(newEntryTime)
        }
    })

    return getOne(userId, stayId)
}

async function getPaidStays(userId) {
    const db = await database.connect()

    const stay = await db.collection('userStays')
        .find({
            user: ObjectId(userId),
            closedAt: {
                $exists: true
            },
            paidAt: {
                $exists: true
            },
            paymentApprovedAt: {
                $exists: false
            },
            paymentDisapprovedAt: {
                $exists: false
            }
        })
        .toArray()

    return stay
}

async function getOne(userId, stayId) {
    const db = await database.connect()
    const stay = await db.collection('userStays').find({
        user: ObjectId(userId),
        _id: ObjectId(stayId)
    }, {
        projection: {
            user: 0
        }
    }).toArray()
    return stay[0] || null
}

async function pay(userId, stayId, paidAtTimestamp) {
    const db = await database.connect()
    await db.collection('userStays').updateOne({
        user: ObjectId(userId),
        _id: ObjectId(stayId)
    }, {
        $set: {
            paidAt: new Date(paidAtTimestamp)
        }
    })

    // await addQueue('stay-pay', {
    //   userId,
    //   stayId
    // })

    return getOne(userId, stayId)
}

module.exports = {
    getAll,
    getOpenedStays,
    getClosedStays,
    getPaidStays,
    getOne,
    create,
    close,
    update,
    pay
}
