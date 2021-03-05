const { ApolloServer, gql, PubSub } = require("apollo-server");
const pubsub = new PubSub();
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
}

type Mutation{
    insertCar(brand: String!, color: String!, doors: Int!, type: CarTypes!): [Car]!
}

type Subscription {
  carInserted: Car
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
      return db.cars.filter((car) => car.type === args.type);
    },

    // Query by ID
    carById: (parent, args, context, info) => {
      return db.cars.filter((car) => car.id === args.id)[0];
    },
  },
  Car: {
    brand: (parent, args, context, info) => {
      return db.cars.filter((car) => car.brand === parent.brand)[0].brand;
    },
  },

  Mutation: {
    // Mutation resolver
    insertCar: (_, { brand, color, doors, type }, context, info) => {
      const id = Math.random().toString();
      const car = {
        id: id,
        brand: brand,
        color: color,
        doors: doors,
        type: type,
      };
      db.cars.push(car);
      pubsub.publish("CAR_INSERTED", {
        carInserted: car,
      });
      return db.cars;
    },
  },

  Subscription: {
    carInserted: {
      subscribe: () => pubsub.asyncIterator(["CAR_INSERTED"]),
    },
  },
};

// Apollo server
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server is running at ${url}`);
});
