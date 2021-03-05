const { ApolloServer, gql } = require("apollo-server");
const { makeExecutableSchema, mergeSchemas } = require("graphql-tools");
const { merge } = require("lodash");
// create a memory db
const db = {
  cars: [
    {
      id: "a",
      brand: "Ford",
      color: "Blue",
      doors: 4,
      type: "Sedan",
    },
    {
      id: "b",
      brand: "Tesla",
      color: "Red",
      doors: 4,
      type: "SUV",
    },
    {
      id: "c",
      brand: "Toyota",
      color: "White",
      doors: 4,
      type: "Coupe",
    },
    {
      id: "d",
      brand: "Toyota",
      color: "Red",
      doors: 5,
      type: "Coupe",
    },
  ],
};

// create the schema

const carEnum = `
enum CarTypes{
    Sedan
    SUV
    Coupe
    Hatchback
}`;

const carType = `
type Car{
    id: ID!
    brand: String!
    color: String!
    doors: Int!
    type: CarTypes!
}`;

const carQueries = `
type Query{
    carByType(type: CarTypes!): [Car]
    carById(id: ID!): Car
}

type Mutation{
    insertCar(brand: String!, color: String!, doors: Int!, type: CarTypes!): [Car]!
}`;

// create the resolvers
// Resolver takes 4 arguments:
// 1. Parent Argument
// - The Parent is an object that is returned from the parent resolver and then passed
// to the next child resolver.
// 2. Args Argument
// - An object of arguments passed to the field.
// 3. Context Argument
// - A shared object between all the resolvers
// - The context should be treated as an immutable object.
// 4. Info Argument
// - Information about the execution state such as:
// -- Return type
// -- Parent type
// -- Operation type - query, mutation

const carResolversQueries = {
  Query: {
    // Query by Car Type
    carByType: (parent, args, context, info) => {
      return db.cars.filter((car) => car.type === args.type);
    },

    // Query by ID
    carById: (parent, args, context, info) => {
      return db.cars.filter((car) => car.id === args.id)[0];
    },
  },
};
const carResolversMutations = {
  Mutation: {
    // Mutation resolver
    insertCar: (_, { brand, color, doors, type }, context, info) => {
      db.cars.push({
        id: Math.random().toString(),
        brand: brand,
        color: color,
        doors: doors,
        type: type,
      });

      return db.cars;
    },
  },
};

const carSchema = makeExecutableSchema({
  typeDefs: [carQueries, carEnum, carType],
  resolvers: merge(carResolversMutations, carResolversQueries),
});

const dealership = `
  type Dealership {
    name: String
    city: String
  }

  type Query {
    dealership: Dealership
  }
`;

const dealershipResolvers = {
  Query: {
    dealership: (parent, args, context, info) => {
      return {
        name: "Honda",
        city: "Calgary",
      };
    },
  },
};

const dealershipSchema = makeExecutableSchema({
  typeDefs: [dealership],
  resolvers: dealershipResolvers,
});

const mergedSchema = mergeSchemas({
  schemas: [carSchema, dealershipSchema],
});

// Apollo server
const server = new ApolloServer({
  schema: mergedSchema,
});

server.listen().then(({ url }) => {
  console.log(`Server is running at ${url}`);
});
