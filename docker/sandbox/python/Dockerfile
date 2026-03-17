FROM python:3.11.11-slim

ENV PYTHONDONTWRITEBYTECODE=1

RUN groupadd --system runner \
  && useradd --system --create-home --gid runner --shell /usr/sbin/nologin runner

WORKDIR /workspace

USER runner
