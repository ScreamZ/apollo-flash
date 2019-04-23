<h1 align="center">
  Apollo Flash
</h1>
<p align="center">
    <img src="./docs/logo.png" alt="Logo Apollo Flash" width="300">
</p>
<h4 align="center">A smart and efficient toolkit to quickly bootstrap an apollo-server project.</h4>

It comes with the following tools:

- **TypeDefs Schema and Resolvers auto-loader**. Remove complexity of schema / resolvers objects management.
- **`http-only cookie` based authentication with JWT**. Strong stateless authentication that allows horizontal scaling and maximum security.
- **graphql-auth**. Resolver's middleware function that enable app security checking. Flash also provide context generator accordingly.

# Installation and dependencies

If you wish to use cookie based auth : you'll need some kind of tool that add a `cookie` property to the request object (`cookie-parser` is fine with express). because apollo-flash will look for a jwt in the cookie object first.

If you choose to not use cookie implementation, while it is recommanded, apollo-flash will only look for `Authorization: Bearer <token>` header.

**In all cases apollo-flash will first try to look for a jwt cookie before looking for the authorizarion header.**

That's why we suggest to use `apollo-server-express` (or koa equivalent).

Then you just need to:

`npm install apollo-flash --save`

# Core concepts

Apollo Flash will automatically load your types definitions and resolvers by parsing your project directories.
It is also shipped with a authentication middleware that add user in the app context.

[Learn How to use the authentication middleware](./docs/authentication.md)

```js
import ApolloFlash from "apollo-flash";
// ... Some imports of model, etc

// ... Some database instantation

// We need the user model to provide getUserFromId
const userModel = new UserModel(DB)

const Flash = new ApolloFlash({
  getScopeFromUser: user => Promise.resolve([]), // An array of string.
  getUserFromId: userModel.findById.bind(this), // Do not forget to bind or wrap in order to maintain scope.
  jwtSigningKey: "yoursigningstring", // Or file Buffer with public key. Use RS256 algorithm with RSA keys and HS256 with string
  verifyOpts: { algorithms: ["RS256"] }, // Passed to jwt verify function. See types or library `jsonwebtoken`.
  resolversFolderPath: path.resolve(__dirname, "resolvers"),
  typeDefsFolderPath: path.resolve(__dirname, "schemas")
});

const server = new ApolloServer({
  context: async (serverContext) => ({
    ...await flash.buildContext(serverContext),
    CourseModel: new CourseModel(DB),
    Usermodel: userModel,
  }),
  resolvers: Flash.generateRootResolver(),
  typeDefs: Flash.generateTypeDefs()
});
```

## Schema auto-loader

Tired of taking care that each type is correctly loaded before being able to use it in your schema definition ? Don't worry this is over.

All you need to do is create a directory which contain files that export `an array of string` representing your scheme.

```js
// <project_root>/schemas/user/index.js`
const UserSchema = `
  "An user of the application"
  type User {
    _id: ID!
    lastname: String!
    firstname: String!
    email: String!
    preferences; UserPreferences
  }
`;

const UserPreferencesSchema = `
  type UserPreferences {
    displayStartHint: Boolean
  }
`;

export default [UserSchema, UserPreferencesSchema];
```

Schema types dependencies are auto-solved due to automated flattening imports using `Flash.generateTypeDefs()`.
Folder structure is up to you and have no impact.

## Resolver auto-loader

Resolvers are loaded the same way, **except that file naming count**.

Let's start by creating a folder named `resolvers`.

Inside this folder, create a file named `Query.js` and here is an example of content inside this file (You might use an object too, I'm using a class that is auto-instantiated while exporting, this is just a matter of preferences).

**`apollo-flash` only search resolver for one level depth in the given folder, if you are using nested folder for destructuring, please use it as import in your resolvers.**

```js
// resolvers/Query.js
class Query {
  me = (root, values, context) => {
    return context.auth.user || { _id: "", email: "", friends: [] };
  };

  getPlaces = async (root, values, context) => {
    return await context.PlaceModel.findAll();
  };
}

export default new Query();
```

Well. We just instantiated the root Query resolver.

Now `me` property is returning an array of string in the `friends` key which are user instance. We are going to transform this to real users instances.

```js
// resolvers/User.js
class User {
  friends = async (parent, values, context) => {
    if (!parent.friends) {
      return null;
    }

    // Trigger calls in parallel then wait for all results.
    return await Promise.all(
      parent.friends.map(userId => context.UserModel.findById(userId))
    );
  };
}
```

See, combining class is simple as that.
