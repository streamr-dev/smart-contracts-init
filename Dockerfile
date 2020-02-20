FROM ubuntu:16.04 AS builder
ARG NODE_VERSION="v12.15.0"
RUN apt-get update && apt-get install -y \
	build-essential \
	curl \
	git \
	python \
	&& rm -rf /var/lib/apt/lists/*
WORKDIR /
RUN curl -s -O "https://nodejs.org/download/release/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.gz"
RUN tar xzf "node-${NODE_VERSION}-linux-x64.tar.gz"
ENV PATH="/node-${NODE_VERSION}-linux-x64/bin:${PATH}"
RUN node --version
RUN npm --version
RUN useradd -ms /bin/bash node
USER node
WORKDIR /home/node
COPY ./ ./
RUN npm ci --only=production

FROM ubuntu:16.04
ARG NODE_VERSION="v12.15.0"

WORKDIR /
ENV PATH="/node-$NODE_VERSION-linux-x64/bin:${PATH}"
COPY --from=builder --chown=root:root /node-$NODE_VERSION-linux-x64/ /node-$NODE_VERSION-linux-x64/
RUN useradd -ms /bin/bash node
USER node
WORKDIR /home/node
COPY --from=builder --chown=node:node /home/node/ ./
CMD node index.js

