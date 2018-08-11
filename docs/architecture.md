# Folders

## Models : 

File in that directory are reponsible of data-fetching.
One file per content type, use explicit names and do not hesitate creating statics vars that map to expected collection name.

You can use multiple database inside a model file, simply pass the client with the constructor.

**Improvements :** You can pass req in order to use data caching related to the request using facebook dataLoader for example.

## Resolvers

**Resolvers are auto-loaded.** Which mean you must name them accordinly to the problem they are solving.

## Schemas
**Schemas are auto-loaded.** You don't need to check for import while using any type inside any file inside this directory. 

Good pratice is to regroup by thematic and separe `input`, `query` and `type`. Do not forget to define the response payload, generally along with type.