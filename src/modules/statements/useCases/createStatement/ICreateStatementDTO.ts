import { Statement } from "../../entities/Statement";

export type ICreateStatementDTO =
Pick<
  Statement,
  'user_id' |
  'receiver_id' |
  'sender_id' |
  'description' |
  'amount' |
  'type'
>
