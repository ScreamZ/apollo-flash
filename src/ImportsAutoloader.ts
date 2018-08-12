import { gql, IResolvers } from "apollo-server-express";
import * as includeAll from "include-all";
import * as _ from "lodash";
import * as path from "path";

/**
 * This class is responsible of auto-import and assemble resolvers and schema.
 *
 * @export
 * @class ImportsAutoLoader
 */
export default class ImportsAutoloader {
  private typeDefsFolderPath: string;
  private resolversFolderPath: string;

  /**
   * Creates an instance of ImportsAutoLoader.
   *
   * @param {string} [typeDefsFolderPath=path.join(__dirname, "schemas")] - Folder in which schemas lives.
   * @param {string} [resolversFolderPath=path.join(__dirname, "resolvers")] - Folder in which resolvers lives.
   * @memberof ImportsAutoLoader
   */
  constructor(
    typeDefsFolderPath: string = path.join(__dirname, "schemas"),
    resolversFolderPath: string = path.join(__dirname, "resolvers"),
  ) {
    this.typeDefsFolderPath = typeDefsFolderPath;
    this.resolversFolderPath = resolversFolderPath;
  }

  /**
   * Generate GraphQL typedef from schemas folder.
   *
   * @returns {*}
   * @memberof ImportAutoLoader
   */
  generateTypeDefs(): any {
    // Parse folder for schema
    const flatSchemas = includeAll({
      dirname: this.typeDefsFolderPath,
      filter: /(.+)\.js$/,
      flatten: true,
      keepDirectoryPath: true,
    });

    // Extract imports
    const schemas = _.flatMap(flatSchemas, _.property("default"));

    // Transform into graphQL
    return _.map(schemas, this.toGQL);
  }

  /**
   * Generate an object mapping resolvers.
   *
   * This use file name as Resolver name
   *
   * @returns {IResolvers}
   * @memberof ImportAutoLoader
   */
  generateRootResolver(): IResolvers {
    // Parse folder for resolvers
    const flatResolvers = includeAll({
      depth: 1,
      dirname: this.resolversFolderPath,
      filter: /(.+)\.js$/,
    });

    // Extract imports
    return _.mapValues(flatResolvers, "default");
  }

  /**
   * Transform to graphql.
   *
   * @private
   * @param {string} el
   * @returns
   * @memberof ImportAutoLoader
   */
  private toGQL(el: string) {
    return gql(el);
  }
}
