#!/bin/sh

profile="movement-pass"
app="movement-pass"
version="v1"

# shellcheck disable=SC2039
names=("configuration" "certificates" "jwt" "photos" "database")

cdk bootstrap --profile $profile

# shellcheck disable=SC2039
for name in "${names[@]}"
do
  cdk deploy "$app-$name-$version" --require-approval never --profile $profile
done
