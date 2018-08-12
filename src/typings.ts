import { Response } from "express";

/**
 * Fetch an user from a given string ID.
 */
export type GetUserFromId<User> = (userID: string) => Promise<User>;

/**
 * Get the user scope from an user object.
 */
export type GetScopeFromUser<AuthScopeEnum, User> = (
  user: User,
) => Promise<AuthScopeEnum[]>;

/**
 * Configuration use to initalize the orchestrator.
 *
 * @export
 * @interface ApolloFlashConfig
 * @template AuthScopeEnum
 * @template User
 */
export interface ApolloFlashConfig<AuthScopeEnum, User> {
  /**
   * Folder where types definitions are defined.
   *
   * @type {string}
   * @memberof ApolloFlashConfig
   */
  typeDefsFolderPath: string;

  /**
   * Folder where resolvers are defined.
   *
   * @type {string}
   * @memberof ApolloFlashConfig
   */
  resolversFolderPath: string;

  /**
   * String or file that is used for encrypt JWT.
   *
   * @type {(string | Buffer)}
   * @memberof ApolloFlashConfig
   */
  jwtSigningKey: string | Buffer;

  /**
   * A function that is used to fetch an user in the system using its ID.
   *
   * Mainly used for jwt authentication.
   *
   * @type {GetUserFromId<User>}
   * @memberof ApolloFlashConfig
   */
  getUserFromId: GetUserFromId<User>;

  /**
   * A function that return the request scope from the request User.
   *
   * @type {GetScopeFromUser<User>}
   * @memberof ApolloFlashConfig
   */
  getScopeFromUser?: GetScopeFromUser<AuthScopeEnum, User>;
}

/**
 * Context that resolvers function should receive.
 * Extends this type to create your own context.
 *
 * @interface ApolloFlashContext
 * @template AuthScopeEnum
 * @template User
 */
export interface ApolloFlashContext<AuthScopeEnum, User> {
  auth: AuthContext<AuthScopeEnum, User>;
  response: Response;
}

/**
 * Authentication context
 *
 * @export
 * @interface AuthContext
 * @template AuthScopeEnumEnum
 * @template User
 */
export interface AuthContext<AuthScopeEnumEnum, User> {
  /**
   * If the user is authenticated through this request.
   *
   * @type {boolean}
   * @memberof AuthContext
   */
  isAuthenticated: boolean;

  /**
   * User scope to handle authorizations.
   *
   * @type {AuthScopeEnumEnum[]}
   * @memberof AuthContext
   */
  scope: AuthScopeEnumEnum[];

  /**
   * The current authenticated user.
   *
   * @type {User}
   * @memberof AuthContext
   */
  user: User;
}
