#!/bin/sh

set -e

OPA_VERSION="v0.43.0"

case $(uname | tr '[:upper:]' '[:lower:]') in
  linux*)
    export BINARY="opa_linux_amd64_static"
    ;;
  darwin*)
    export BINARY="opa_darwin_amd64"
    ;;
  *)
    echo "Your OS is not supported"
    exit 1
    ;;
esac

curl -L -o opa "https://github.com/open-policy-agent/opa/releases/download/$OPA_VERSION/$BINARY"
chmod +x opa
