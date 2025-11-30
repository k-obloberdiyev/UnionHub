# PocketBase Dockerfile for Fly.io
# Builds a small image and runs PocketBase with a persistent data dir

FROM alpine:3.19

ARG PB_VERSION=0.22.14

RUN apk add --no-cache ca-certificates curl unzip && \
    adduser -D -H -s /sbin/nologin pb && \
    mkdir -p /pb/pb_data /pb/public && chown -R pb:pb /pb

WORKDIR /pb

RUN curl -L -o pocketbase.zip \
      https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip \
    && unzip pocketbase.zip \
    && rm pocketbase.zip \
    && chmod +x pocketbase

USER pb

EXPOSE 8080

# By default PocketBase serves on 127.0.0.1; bind to all interfaces for Fly
CMD ["/pb/pocketbase", "serve", "--http", "0.0.0.0:8080", "--dir", "/pb/pb_data", "--publicDir", "/pb/public"]
