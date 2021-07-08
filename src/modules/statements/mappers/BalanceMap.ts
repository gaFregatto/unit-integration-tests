import { OperationType, Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({statement, balance}: { statement: Statement[], balance: number}) {
    const parsedStatement = statement.map((statement) => {
      const statementDTO = {
        id: statement.id,
        amount: Number(statement.amount),
        description: statement.description,
        type: statement.type,
        created_at: statement.created_at,
        updated_at: statement.updated_at,
      };
      if (statement.type === OperationType.TRANSFER) {
        const statementDTOTransfer = {
          id: statement.id,
          sender_id: statement.user_id,
          amount: Number(statement.amount),
          description: statement.description,
          type: statement.type,
          created_at: statement.created_at,
          updated_at: statement.updated_at,
        };

        return statementDTOTransfer;
      }

      return statementDTO;
    });

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}
