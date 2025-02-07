// import ApiError from '~/utils/ApiError'
// import { slugify } from '~/utils/formatters'
import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
// import { cloneDeep } from 'lodash'

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody
    }
    const createdColumn = await columnModel.createNew(newColumn)
    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId)

    if (getNewColumn) {
      getNewColumn.cards=[]
      await boardModel.pushColumnOrderIds(getNewColumn)
    }
    return getNewColumn
  } catch (error) {
    throw error
  }
}

const update = async(columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }
    const updated = await columnModel.update(columnId, updateData)
    return updated
  } catch (error) {
    throw error
  }
}

const deleteItem = async(columnId) => {
  try {
    const targetColumn= await columnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found')
    }
    //Xóa column
    await columnModel.deleteOneById(columnId)
    //Xóa tất cả card trong column
    await cardModel.deleteManyByColumnId(columnId)
    //Xóa columnId trong mảng chứa nó
    await boardModel.pullColumnOrderIds(targetColumn)
    return { deleteResult:'Column and its Cards deleted successfully!' }
  } catch (error) {
    throw error
  }
}

export const columnService ={
  createNew,
  update,
  deleteItem
}