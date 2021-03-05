const { graphql, buildSchema } = require('graphql');

// create a memory db
const db = {
    cars: [
        {
            id: 'a',
            brand: 'Ford',
            color: 'Blue',
            doors: 4,
            type: 'Sedan'
        },
        {
            id: 'b',
            brand: 'Tesla',
            color: 'Red',
            doors: 4,
            type: 'SUV'
        },
        {
            id: 'c',
            brand: 'Toyota',
            color: 'White',
            doors: 4,
            type: 'Coupe'
        },
        {
            id: 'd',
            brand: 'Toyota',
            color: 'Red',
            doors: 5,
            type: 'Coupe'
        }
    ]
}


// create the schema
const schema = buildSchema(`
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
`);

// create the resolvers
const resolvers = () => {
    // Query by Car Type
    const carByType = args => {
        return db.cars.filter(car => car.type === args.type);
    }

    // Query by ID
    const carById = args => {
        return db.cars.filter(car => car.id === args.id)[0]
    }

    // Mutation resolver
    const insertCar = ({ brand, color, doors, type }) => {
        db.cars.push({
            id: Math.random().toString(),
            brand: brand,
            color: color,
            doors: doors,
            type: type
        });

        return db.cars;
    }

    return { carByType, carById, insertCar };//Resolver Object
};


// execute the queries/mutations
const executeQuery = async () => {
    const queryByType = `
    {
        carByType(type: Coupe){
            brand
            color
            type
            id
        }
    }
    `
    const queryByID = `
        {
            carById(id: "b"){
                brand
                type
                color
                id
            }
        }
    `

    const insertCarMutation = `
        mutation insertCar ($brand: String!, $color: String!, $doors: Int!, $type: CarTypes!){
            insertCar(brand: $brand, color: $color, doors: $doors, type: $type){
                brand
                color
                type
                id
            }
        }
    `;

    const reponseQueryByType = await graphql(schema, queryByType, resolvers());
    console.log(reponseQueryByType.data);

    const responseQueryById = await graphql(schema, queryByID, resolvers());
    console.log(responseQueryById.data);
    

    const responseMutationInsertCar = await graphql(schema, insertCarMutation, resolvers(), null, {brand: 'Honda', color: 'black', doors: 4, type: 'SUV'});
    console.log(responseMutationInsertCar.data);

}

executeQuery();
