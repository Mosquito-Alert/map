.PHONY: help

.DEFAULT_GOAL	:= help
SHELL			:= /bin/bash

APP_NAME 		:= 'map'
REGISTRY_SERVER	:= ghcr.io
REPOSITORY 		:= '$(REGISTRY_SERVER)/mosquito-alert/map'
TAG				:= $(shell git describe --tags)
RELEASE_TAG		?= latest

DOCKER_USER		?= ''

ENVIRONMENT		:= 'production'

DOCKER_COMPOSE_DEV=docker-compose-local.yml

help: # http://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# ===================================================
# Docker images commands
# ===================================================

login: ## Login to container registry server.
	docker login -u $(DOCKER_USER) $(REGISTRY_SERVER)

build: ## Build the current image version for this app.
	docker build --tag $(APP_NAME)_$(ENVIRONMENT):$(TAG) --build-arg BUILD_ENVIRONMENT=$(ENVIRONMENT) .
	docker tag $(APP_NAME)_$(ENVIRONMENT):$(TAG) $(REPOSITORY):$(TAG)

push: login ## Push the latest image to the repository.
	docker push $(REPOSITORY):$(TAG)

deploy: build login push  ## Build and push a new image version to the reposistory.

release: login  ## Make current docker tag to be retagged as 'latest'.
	docker pull $(REPOSITORY):$(TAG)
	docker tag  $(REPOSITORY):$(TAG) $(REPOSITORY):$(RELEASE_TAG)
	docker push $(REPOSITORY):$(RELEASE_TAG)
