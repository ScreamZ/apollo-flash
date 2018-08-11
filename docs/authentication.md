# Authentication

Apollo flash automatically handle jwt decrypting using http-only cookie. If not found, then it check for a `Authorization: Bearer <token>` header.

You're in charge of setting this jwt cookie, here is an example.

```js
import { withAuth } from "apollo-flash";
import * as JwtTools from "jsonwebtoken";

class Mutation {
  logout = withAuth((root, args, { response }: AppContext) => {
    response.clearCookie("jwt");

    return { _id: "", email: "", firstname: "", lastname: "" };
  });

  login = async (root, params, context) => {
    // Fetch user
    const loggedUser = await context.Usermodel.loginCheck(
      params.credentials.email,
      params.credentials.password
    );

    // Generate JWT
    const jwt = await JwtTools.sign({}, "MySecureKey", {
      issuer: "api.mydomain",
      subject: loggedUser._id.toString()
    });

    // Add cookie to request for authentication.
    context.response.cookie("jwt", jwt, { httpOnly: true });

    return { user: loggedUser, jwt };
  };
}

export default new Mutation();
```

# Authorization

Authorization is mainly handled by graphql-auth.

You can import it from apollo-flash like showed in the example above.

Feel free to browse the documentation here [https://github.com/kkemple/graphql-auth](https://github.com/kkemple/graphql-auth)
