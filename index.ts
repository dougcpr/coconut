import express, {Express, Request, Response} from "express";
import {PrismaClient} from '@prisma/client'
import {inferAsyncReturnType, initTRPC} from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import {z} from 'zod';
import cors from "cors";

const dotenv = require('dotenv');

dotenv.config();

const app: Express = express();
const port: (string | undefined) = process.env.PORT;
const origin: (string | boolean | RegExp) = process.env.CLIENT_ORIGIN as unknown as string;
const prisma = new PrismaClient();

app.get('/', (req: Request, res: Response) => {
    res.send('Express + Typescript + Nodemon + Prisma')
});

// created for each request
const createContext = ({
                         req,
                         res,
                       }: trpcExpress.CreateExpressContextOptions) => ({}); // no context
type Context = inferAsyncReturnType<typeof createContext>;
const t = initTRPC.context<Context>().create();
export const appRouter = t.router({
  getUser: t.procedure
    .input(z.string()).query(async (opts) => {
    opts.input; // string
    return prisma.user.findMany({
      where: {
        email: opts.input
      },
      include: {
        posts: true,
        profile: true,
      },
    });
  }),
  createUser: t.procedure
    .input(z.object({
      name: z.string().min(3),
      email: z.string().email(),
    }))
    .mutation(async (opts) => {
      // use prisma to create user
      return prisma.user.create({
        data: {
          name: opts.input.name,
          email: opts.input.email
        },
      });
    }),
});

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

app.use(
  cors({
    origin: [origin, "http://localhost:3000"],
    credentials: true,
  })
);

app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
})