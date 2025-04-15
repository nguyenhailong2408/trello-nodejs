/* eslint-disable no-useless-catch */
// import ApiError from '~/utils/ApiError'
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'

const createNew = async (userId, reqBody) => {
  try {
    //Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    //Gọi tới tầng Model để xử lý lưu bản ghi và DB
    const createdBoard = await boardModel.createNew(userId, newBoard)
    // console.log('createdBoard service', createdBoard)

    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    // console.log('getNewBoard service', getNewBoard)

    return getNewBoard
  } catch (error) {
    throw error
  }
}

const getDetails = async(userId, boardId) => {
  try {
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    const resBoard = cloneDeep(board)
    //Lọc card về đúng column
    resBoard.columns.forEach(column => {
      //equals này là hàm của MongoDB
      // column.cards = resBoard.cards.filter(c => c.columnId.equals(column._id))
      column.cards = resBoard.cards.filter(c => c.columnId.toString() === column._id.toString())
    })

    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async(boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)
    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardToDifferentColumn = async(reqBody) => {
  try {
    //B1: Xóa _id của Card ra khỏi column ban đầu (cũ)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updateAt: Date.now()
    })
    //B2: Cập nhật mảng cardOrderIds của Column tiếp theo (đang được kéo tới)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updateAt: Date.now()
    })
    //B3: Cập nhật lại trường columnId mới của Card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
      updateAt: Date.now()
    })
    return { updateResult: 'Successfully!' }
  } catch (error) {
    throw error
  }
}

const getBoards = async (userId, page, itemsPerPage, queryFilter) => {
  try {
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
    const results = await boardModel.getBoards(userId, parseInt(page, 10), parseInt(itemsPerPage, 10), queryFilter)
    return results
  } catch (error) {
    throw error
  }
}

export const boardService ={
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards
}