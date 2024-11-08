FROM node:20
WORKDIR /usr/src/app

RUN ["npm", "install", "--global", "pnpm@9"]

COPY package.json pnpm-lock.yaml .
RUN ["pnpm", "install", "--frozen-lockfile"]

COPY . .
RUN ["pnpm", "build"]

EXPOSE 3000
CMD ["node", "build/app.js"]
