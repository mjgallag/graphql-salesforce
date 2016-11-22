import {
  GraphQLFieldConfigMap,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} from 'graphql';
import { Connection } from 'jsforce';

export default class GraphQLSalesforce {
  private static connection = new Connection();

  static async makeSchema(username: string, password: string): Promise<GraphQLSchema> {
    await GraphQLSalesforce.connection.login(username, password);

    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Salesforce',
        fields: await GraphQLSalesforce.makeObjectTypes()
      })
    });
  }

  private static async makeObjectTypes(): Promise<GraphQLFieldConfigMap<any>> {
    const objectTypes: GraphQLFieldConfigMap<any> = {};

    for (const sObject of (await GraphQLSalesforce.connection.describeGlobal()).sobjects)
      objectTypes[sObject.name] = {
        type: new GraphQLObjectType({
          name: sObject.name,
          fields: await GraphQLSalesforce.makeScalarTypes(sObject.name)
        }),
        description: sObject.label
      };

    return objectTypes;
  }

  private static async makeScalarTypes(sObject: string): Promise<GraphQLFieldConfigMap<any>> {
    const scalarTypes: GraphQLFieldConfigMap<any> = {};

    for (const field of (await GraphQLSalesforce.connection.sobject(sObject).describe()).fields)
      scalarTypes[field.name] = {
        type: GraphQLString,
        description: field.label
      };

    return scalarTypes;
  }
}
