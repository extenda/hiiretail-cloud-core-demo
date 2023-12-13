mkdir in
tar -xf systems_ccc.ccc-api-prod.tar.gz -C in

# rm -rf in/global/testkit
# rm -rf in/global/testkit2
# rm -rf in/policy/com.styra.envoy.ingress/test/test

# ./opa build -t wasm -e policy/com.styra.envoy.ingress/rules/rules/allow in
./opa build -t wasm -e policy/envoy/ingress/main/main in

mkdir out
tar -xf bundle.tar.gz -C out
rm bundle.tar.gz
