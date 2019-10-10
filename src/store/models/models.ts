export interface UserResponse {
  id: number
  name: string
  holidays: number
  sickdays: number
}

export interface UserOnSubmit {
  userid: string
}

export interface UserLeavesResponse {
  id: number
  date: string
  user_id: number
  type: string
}
