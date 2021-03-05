const { ApolloServer, gql } = require("apollo-server");
const { RESTDataSource } = require("apollo-datasource-rest");
const express = require("express");

class CarDataAPI extends RESTDataSource {
  async getCar() {
    const data = await this.get("http://localhost:5000/carData");
    return data;
  }
}

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
const schema = gql(`
enum CarTypes{
    Sedan
    SUV
    Coupe
    Hatchback
}

type Car{
    id: ID!
    brand: String!
    color: String!
    doors: Int!
    type: CarTypes!
}

type Query{
    carByType(type: CarTypes!): [Car]
    carById(id: ID!): Car
    carAPI: Car
}

type Mutation{
    insertCar(brand: String!, color: String!, doors: Int!, type: CarTypes!): [Car]!
}
`);

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
const resolvers = {
  Query: {
    // Query by Car Type
    carByType: (parent, args, context, info) => {
      return context.db.cars.filter((car) => car.type === args.type);
    },

    // Query by ID
    carById: (parent, args, context, info) => {
      return context.db.cars.filter((car) => car.id === args.id)[0];
    },

    carAPI: async (parent, args, context, info) => {
      return await context.dataSources.carDataAPI.getCar();
    },
  },

  Mutation: {
    // Mutation resolver
    insertCar: (_, { brand, color, doors, type }, context, info) => {
      context.db.cars.push({
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

const dbConnection = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(db);
    }, 2000);
  });
};

// Apollo server
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  dataSources: () => {
    return { carDataAPI: new CarDataAPI() };
  },
  context: async () => {
    return { db: await dbConnection() };
  },
});

server.listen().then(({ url }) => {
  console.log(`Server is running at ${url}`);
});

// Rest data
const app = express();
app.get("/carData", function (req, res) {
  res.send({ id: "d", brand: "Honda", color: "Blue", doors: 4, type: "Sedan" });
});

app.listen(5000);
