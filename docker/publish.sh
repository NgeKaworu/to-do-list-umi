#!/bin/bash
set -e

docker build -f ./Dockerfile -t ngekaworu/todo-list-umi ..;
docker push ngekaworu/todo-list-umi;