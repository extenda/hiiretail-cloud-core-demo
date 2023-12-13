mkdir -p tmp/in
tar -xf systems_ccc.ccc-api-prod.tar.gz -C tmp/in

./opa build -t wasm -e policy/envoy/ingress/main/main tmp/in

mkdir -p tmp/out
tar -xf bundle.tar.gz -C tmp/out
rm bundle.tar.gz
