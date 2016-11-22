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
    const sObjectDescribePromises: Promise<any>[] = [];

    await GraphQLSalesforce.connection.login(username, password);
    for (const sObject of (await GraphQLSalesforce.connection.describeGlobal()).sobjects)
      sObjectDescribePromises.push(GraphQLSalesforce.connection.sobject(sObject.name).describe());
    await Promise.all(sObjectDescribePromises);

    return new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Salesforce',
        fields: GraphQLSalesforce.makeObjectTypes()
      })
    });
  }

  private static makeObjectTypes(): GraphQLFieldConfigMap<any> {
    const objectTypes: GraphQLFieldConfigMap<any> = {};

    for (const sObject of GraphQLSalesforce.connection.describeGlobal$().sobjects)
      objectTypes[sObject.name] = {
        type: new GraphQLObjectType({
          name: sObject.name,
          fields: GraphQLSalesforce.makeScalarTypes(sObject.name)
        }),
        description: sObject.label
      };

    return objectTypes;
  }

  private static makeScalarTypes(sObject: string): GraphQLFieldConfigMap<any> {
    const scalarTypes: GraphQLFieldConfigMap<any> = {};

    for (const field of GraphQLSalesforce.connection.sobject(sObject).describe$().fields)
      scalarTypes[field.name] = {
        type: GraphQLString,
        description: field.label
      };

    return scalarTypes;
  }
}
