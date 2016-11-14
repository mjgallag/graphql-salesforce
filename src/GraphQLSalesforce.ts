import { Connection } from 'jsforce';

export default class GraphQLSalesforce {
  static async helloWorld(username: string, password: string): Promise<void> {
    const connection = new Connection();

    await connection.login(username, password);
    console.log(await connection.query('SELECT Name FROM Account LIMIT 1'));
  }
}
