import express, {Express, Request, Response} from "express";
import { PrismaClient } from '@prisma/client'

const dotenv = require('dotenv');

dotenv.config();

const app: Express = express();
const port: (string | undefined) = process.env.PORT;
const prisma = new PrismaClient();

app.get('/', (req: Request, res: Response) => {
    res.send('Express + Typescript + Nodemon + Prisma')
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
})

async function main() {
    // write queries here
}


main()
  .then(async () => {
      await prisma.$disconnect()
  })
  .catch(async (e) => {
      console.error(e)
      await prisma.$disconnect()
      process.exit(1)
  })