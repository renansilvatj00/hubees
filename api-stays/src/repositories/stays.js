const database = require('../config/database');
const getParam = require('../helpers/get-param');
const ObjectId = require('mongodb').ObjectId
const { addQueue } = require('../helpers/gateway')

function getStatus(stay) {

    if (!stay.closedAt) {
        return 'Aberto';
    } else if (!stay.paidAt) {
        return 'Fechado e não pago';
    } else if (!stay.paymentApprovedAt && !stay.paymentDisapprovedAt) {
        return 'Pago mas não confirmado';
    } else if (stay.paymentApprovedAt && !stay.paymentDisapprovedAt) {
        return 'Pagamento aprovado.';
    } else if (!stay.paymentApprovedAt && stay.paymentDisapprovedAt) {
        return 'Pagamento não aprovado.';
    }

}

async function getAll(userId) {
    const db = await database.connect();

    let stays = await db.collection('userStays').find({
        user: ObjectId(userId)
    }, {
        projection: {
            user: 0
        }
    }).toArray();


    stays = stays.map(function (stay) {

        stay.status = getStatus(stay);

        return stay;
    })

    return stays;

}

async function getOpenedStays(userId) {
    const db = await database.connect();

    let stay = await db.collection('userStays')
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

    if (stay[0]) {
        stay[0].status = getStatus(stay[0]);
    }

    return stay;
}

async function getClosedStays(userId) {
    const db = await database.connect();

    let stay = await db.collection('userStays')
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

    if (stay[0]) {
        stay[0].status = getStatus(stay[0]);
    }

    return stay;
}

async function getPaidStays(userId) {
    const db = await database.connect()

    let stay = await db.collection('userStays')
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
        .toArray();

    if (stay[0]) {
        stay[0].status = getStatus(stay[0]);
    }

    return stay
}

async function getOne(userId, stayId) {
    const db = await database.connect()
    let stay = await db.collection('userStays').find({
        user: ObjectId(userId),
        _id: ObjectId(stayId)
    }, {
        projection: {
            user: 0
        }
    }).toArray()

    if (stay[0]) {
        stay[0].status = getStatus(stay[0]);
    }

    return stay[0] || null
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

    await addQueue('stay-pay', {
        userId,
        stayId
    })

    return getOne(userId, stayId)
}

async function confirmPayment(userId, stayId) {
    const db = await database.connect()
    await db.collection('userStays').updateOne({
        user: ObjectId(userId),
        _id: ObjectId(stayId)
    }, {
        $set: {
            paymentApprovedAt: new Date()
        }
    })

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
    pay,
    confirmPayment
}
