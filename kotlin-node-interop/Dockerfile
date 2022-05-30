FROM node:18-buster as build

# Install java
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  openjdk-11-jdk

RUN apt-get update -y
RUN apt-get install -y curl python build-essential

###### Add node sources ######

WORKDIR /usr/node

COPY package*.json ./
RUN npm ci

COPY src ./src

###### Build kotlin lib ######

WORKDIR /usr/kotlin

# Install kotlinc
ENV KOTLIN_VERSION=1.6.21 \
  KOTLIN_HOME=/usr/share/kotlin

RUN cd /tmp && \
  wget "https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-compiler-${KOTLIN_VERSION}.zip" && \
  unzip "kotlin-compiler-${KOTLIN_VERSION}.zip" && \
  mkdir "${KOTLIN_HOME}" && \
  rm "/tmp/kotlinc/bin/"*.bat && \
  mv "/tmp/kotlinc/bin" "/tmp/kotlinc/lib" "${KOTLIN_HOME}" && \
  ln -s "${KOTLIN_HOME}/bin/"* "/usr/bin/" && \
  rm -rf /tmp/* /var/cache/apk/*

COPY src-kotlin ./
RUN kotlinc lib.kt -include-runtime -d libs/lib.jar

###### Build app image ######

FROM node:18

# Install java
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  openjdk-11-jre

COPY --from=build /usr/node .
COPY --from=build /usr/kotlin/libs ./libs

# Start app
ENTRYPOINT [ "node", "src/index.js" ]
