import { env } from '~/config/environment'
//Những domain được phép truy cập server
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173',
  'https://trello-reactjs.vercel.app',
  'https://trello-reactjs-git-master-longnhs-projects-9f4f359b.vercel.app',
  'https://trello-reactjs-3cgjj6wu1-longnhs-projects-9f4f359b.vercel.app'
]

export const BOARD_TYPES = {
  PUBLIC:'public',
  PRIVATE:'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT
export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}
export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}

export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}