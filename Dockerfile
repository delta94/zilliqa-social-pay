FROM node:10

WORKDIR /app
COPY . .

ARG DEPLOY_ENV="dev"
RUN npm install
RUN npm run build

EXPOSE 3000

ENV DEPLOY_ENV=${DEPLOY_ENV}
ENTRYPOINT ["sh", "run.sh"]
