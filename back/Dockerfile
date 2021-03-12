FROM thecodingmachine/workadventure-back-base:latest as builder
WORKDIR /var/www/messages
COPY --chown=docker:docker messages .
RUN yarn install && yarn proto

FROM thecodingmachine/nodejs:12

COPY --chown=docker:docker back .
COPY --from=builder --chown=docker:docker /var/www/messages/generated /usr/src/app/src/Messages/generated
RUN yarn install

ENV NODE_ENV=production
RUN yarn run tsc

RUN GRPC_HEALTH_PROBE_VERSION=v0.3.1 && \
    sudo curl -L -o /usr/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/${GRPC_HEALTH_PROBE_VERSION}/grpc_health_probe-linux-amd64 && \
    sudo chmod +x /usr/bin/grpc_health_probe

CMD ["yarn", "run", "runprod"]
