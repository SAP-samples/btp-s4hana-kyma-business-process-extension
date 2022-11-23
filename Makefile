
DOCKER_ACCOUNT=<DOCKER_REPOSITORY>

cds-build:
	npm i
	cds build --production

build-dbimage:
	pack build kyma-cap-s4ems-db --path gen/db --builder paketobuildpacks/builder:base
	docker tag kyma-cap-s4ems-db:latest $(DOCKER_ACCOUNT)/kyma-cap-s4ems-db:latest

build-capimage:
	pack build kyma-cap-s4ems-srv --path gen/srv --builder paketobuildpacks/builder:base
	docker tag kyma-cap-s4ems-srv:latest $(DOCKER_ACCOUNT)/kyma-cap-s4ems-srv:latest

build-uiimage:
	docker build --pull --rm -f app/businesspartners/Dockerfile -t $(DOCKER_ACCOUNT)/kyma-cap-s4ems-html5-deployer:latest ./app/businesspartners

push-images: cds-build build-dbimage build-capimage build-uiimage
	docker push $(DOCKER_ACCOUNT)/kyma-cap-s4ems-db:latest
	docker push $(DOCKER_ACCOUNT)/kyma-cap-s4ems-srv:latest
	docker push $(DOCKER_ACCOUNT)/kyma-cap-s4ems-html5-deployer:latest