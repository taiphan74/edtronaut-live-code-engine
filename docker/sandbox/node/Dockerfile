FROM node:20.19.5-bookworm-slim

RUN groupadd --system runner \
  && useradd --system --create-home --gid runner --shell /usr/sbin/nologin runner \
  && npm install --global tsx@4.20.6 \
  && npm cache clean --force

WORKDIR /workspace

USER runner
