#!/bin/bash
set -e

tag=ngekaworu/todo-list-umi

docker build --file ./Dockerfile --tag ${tag} ..;
docker push ${tag};
