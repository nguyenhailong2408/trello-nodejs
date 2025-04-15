import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { GET_DB } from '~/config/mongodb'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { pagingSkipValue } from '~/utils/algorithms'
import { userModel } from '~/models/userModel'

//Define Collection (Name & Schema)
const BOARD_COLLECTION_NAME ='boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(50).trim().strict(),
  type:Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

//Chỉ định những field không muốn cho cập nhật
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']
const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly:false })
}

const createNew = async(userId, data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)]
    }
    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async(id) => {
  try {
    // console.log(id)
    // console.log(typeof id)
    // const testId = new ObjectId(id)
    // console.log(testId)
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id)
    })
    return result
  } catch (error) { throw new Error(error) }
}

const getDetails = async(userId, boardId) => {
  try {
    const queryConditions = [
      { _id: new ObjectId(boardId) },
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $lookup:{
        from: columnModel.COLUMN_COLLECTION_NAME,
        localField:'_id',
        foreignField:'boardId',
        as:'columns'
      } },
      { $lookup:{
        from: cardModel.CARD_COLLECTION_NAME,
        localField:'_id',
        foreignField:'boardId',
        as:'cards'
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'ownerIds',
        foreignField: '_id',
        as: 'owners',
        // pipeline trong lookup la de xi ly mot hoac nhieu luong can thiet
        // $project de chi dinh vai field khong muon lay ve bang cach gan no gia tri 0
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'memberIds',
        foreignField: '_id',
        as: 'members',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } }
    ]).toArray()
    // console.log('result: ', result)
    return result[0] || null
  } catch (error) { throw new Error(error) }
}

//Push 1 giá trị columnId vào cuối mảng columnOrderIds
const pushColumnOrderIds = async(column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument:'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

//Lấy 1 phần tử ra khỏi mảng
const pullColumnOrderIds = async(column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $pull: { columnOrderIds: new ObjectId(column._id) } },
      { returnDocument:'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async(boardId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })

    if (updateData.columnOrderIds)
    {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(_id)))
    }

    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
      { returnDocument:'after' } // sẽ trả về kết quả mới sau khi cập nhật
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async(userId, page, itemsPerPage, queryFilter) => {
  try {
    const queryConditions = [
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    //xử lý query filter cho search board
    if (queryFilter) {
      Object.keys(queryFilter).forEach(key => {
        //Phân biệt hoa thường
        // queryConditions.push({ [key]: { $regex: queryFilter[key] } })
        //Không phân biệt hoa thường
        queryConditions.push({ [key]: { $regex: new RegExp(queryFilter[key], 'i') } })
      })
    }

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        //sort theo chuan ASCII => B in front a
        { $sort: { title: 1 } },
        //$facet để xử lý nhiều luồng trong 1 query
        { $facet: {
        //01: Query Boards
          'queryBoards': [
            { $skip: pagingSkipValue(page, itemsPerPage) },
            { $limit: itemsPerPage } // take trong PL_SQL
          ],
          //02: Count all data boards with queryConditions
          'queryTotalBoards': [{ $count: 'countedAllBoards' }]
        } }
      ],
      //fix sort theo chuan ASCII => a in front B
      { collation: { locale: 'en' } }
    ).toArray()
    const res = query[0]
    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

const pushMembers = async(boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $push: { memberIds: new ObjectId(userId) } },
      { returnDocument:'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const pushOwners = async(boardId, userId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $push: { ownerIds: new ObjectId(userId) } },
      { returnDocument:'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards,
  pushMembers,
  pushOwners
}