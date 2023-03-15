#!/bin/bash
parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

cd "$parent_path"

cd ../app/iam/policies

opa build -t wasm -e 'app/enrollment' enrollment.rego
tar -xzf ./bundle.tar.gz /policy.wasm
mv policy.wasm ./wasm/enrollment.wasm
rm bundle.tar.gz 