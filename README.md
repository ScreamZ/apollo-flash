<h1 align="center">
  Apollo Flash
</h1>
<p align="center">
  <i style="font-size: 4em">🚀</i>
</p>
<h4 align="center">Tooling and authentication boostraper for Apollo server.</h4>

This tool aim to quickly start an apollo server project with robust tools.

It come with shipped things:

- **TypeDefs Schema and Resolvers auto-loader**. Remove complexity of resolvers object management.
- **`http-only cookie` based authentication with JWT**. Strong stateless authentication that allows horizontal scaling and maximum security.
- **graphql-auth**. Resolver middleware function that enable app security checking.

# Installation and dependencies

Something that add a cookie property to the req object (`cookie-parser` is fine)

That's why we suggest to use apollo-server-express. Context function needs to have a `.cookie` parameter in order to fetch JWT.

JWT is extracted from cookie first, if not found service try to read `Authorization: Bearer <token>` to resolve jwt.

`npm install apollo-flash --save`

# Core concepts

Apollo Flash will automatically load your types definitions and resolvers by parsing your project directories.
It is also shipped with a authentication middleware that add user in the app context.

[Learn How to use the authication middleware](./docs/authentication.md)

```js
import ApolloFlash from "apollo-flash";
// ... Some imports of model, etc

// ... Some database instantation

const userModel = new UserModel(DB)

const flashConfig = {
  getScopeFromUser: user => Promise.resolve([]),
  getUserFromId: userModel.findById,
  jwtSigningKey: "yoursigningstring", // Or readFileSync
  resolversFolderPath: path.resolve(__dirname, "resolvers"),
  typeDefsFolderPath: path.resolve(__dirname, "schemas")
};

const Flash = new ApolloFlash(flashConfig);

const server = new ApolloServer({
  context: async (serverContext) => {
    return {
      ...await Flash.buildContext(serverContext),
      CourseModel: new CourseModel(DB),
      CourseSessionModel: new CourseSessionModel(DB),
      PlaceModel: new PlaceModel(DB),
      Usermodel: userModel,
    },
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

Inside this folder, create a file named `Query.js` and here is an example of content inside this file (You might use an object too, I'm using a class that is auto-instantied while exporting, just a matter of preferences).

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
