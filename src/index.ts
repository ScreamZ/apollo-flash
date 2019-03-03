// @ts-ignore
import { IResolvers } from "apollo-server-express";
import { Request, Response } from "express";
import withAuth from "graphql-auth";
import ContextBuilder from "./ContextBuilder";
import ImportsAutoloader from "./ImportsAutoloader";
import { ApolloFlashConfig, ApolloFlashContext } from "./typings";

/**
 * Helper orchestrator to load you resolver / types definition.
 *
 * Also handle authentication using a jwt cookie / header.
 *
 * For typescript users :
 * - AuthScopeEnum is a string enumeration for authentication scope with graphql-auth
 * - User is your user class / interface.
 *
 * @export
 * @class ApolloFlash
 * @template AuthScopeEnum
 * @template User
 */
export default class ApolloFlash<AuthScopeEnum, User> {
  private config: ApolloFlashConfig<AuthScopeEnum, User>;
  private autoImporter: ImportsAutoloader;
  private contextBuilder: ContextBuilder<AuthScopeEnum, User>;

  constructor(config: ApolloFlashConfig<AuthScopeEnum, User>) {
    this.config = config;
    this.autoImporter = new ImportsAutoloader(
      config.typeDefsFolderPath,
      config.resolversFolderPath,
    );
    this.contextBuilder = new ContextBuilder();
  }

  /**
   * Generate type definition from the graphQL server.
   *
   * @returns
   * @memberof ApolloFlash
   */
  generateTypeDefs() {
    return this.autoImporter.generateTypeDefs();
  }

  /**
   * Generate
   *
   * @returns
   * @memberof ApolloFlash
   */
  generateRootResolver(): IResolvers {
    return this.autoImporter.generateRootResolver();
  }

  /**
   * Build apollo-flash required context.
   * You should merge it with your context.
   *
   * Conflict keys are ['auth', 'response']
   *
   * @returns {ApolloFlashContextBuilder<AuthScopeEnum, User>}
   * @memberof ApolloFlash
   */
  async buildContext(params: {
    req: Request;
    res: Response;
  }): Promise<ApolloFlashContext<AuthScopeEnum, User>> {
    return {
      auth: await this.contextBuilder.getAuthorization(
        params.req,
        this.config.getUserFromId,
        this.config.getScopeFromUser,
        this.config.jwtSigningKey,
      ),
      response: params.res,
    };
  }
}

// Export types
export * from "./typings";
export { withAuth };
