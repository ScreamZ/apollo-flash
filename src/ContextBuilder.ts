import { AuthenticationError } from "apollo-server-express";
import { Request } from "express";
import { verify } from "jsonwebtoken";
import * as _ from "lodash";
import { AuthContext, GetScopeFromUser, GetUserFromId } from "./typings";

/**
 * Class responsible to build application context.
 *
 * @export
 * @class ContextBuilder
 * @template AuthScopeEnum
 * @template User
 */
export default class ContextBuilder<AuthScopeEnum, User> {
  /**
   * Get authorization from a JWT token if given with the request.
   *
   * @param {string} authorizationHeader
   * @param {UserModel} model
   * @returns {Promise<AuthContext>}
   */
  async getAuthorization(
    req: Request,
    getUserFromId: GetUserFromId<User>,
    getScopeFromUser: GetScopeFromUser<AuthScopeEnum, User>,
  ): Promise<AuthContext<AuthScopeEnum, User>> {
    const parts = _.get(req.headers, "authorization", "").split(" ");
    let token;

    // No token
    if (parts.length !== 2 && !req.cookies.jwt) {
      return {
        isAuthenticated: false,
        scope: null,
        user: null,
      };
    }

    // Parse authentication method
    if (req.cookies.jwt) {
      // Check cookie auth first
      token = req.cookies.jwt;
    } else {
      // Otherwise fallback to Authorization header
      const scheme = parts[0];
      token = parts[1];

      // Check protocol
      if (!/^Bearer$/i.test(scheme)) {
        throw new AuthenticationError("Bad authorization header");
      }
    }

    // Check token
    try {
      // TODO: Change to RSA key
      const { sub } = (await verify(token, "TODO")) as any;
      const user = await getUserFromId(sub);

      if (!user) {
        throw new AuthenticationError("User doesn't exists anymore.");
      }

      return {
        isAuthenticated: true,
        scope: getScopeFromUser ? await getScopeFromUser(user) : [],
        user,
      };
    } catch (e) {
      throw new AuthenticationError("Invalid or expired jwt token");
    }
  }
}
