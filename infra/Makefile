## Terraform

environment ?= dev
action ?= plan

init:
	cd terraform && terraform init

login:
	cd terraform && terraform login
	
start:
	cd terraform && terraform $(action) -var-file="config/$(environment).tfvars" -compact-warnings

plan:
	cd terraform && terraform plan -var-file="config/$(environment).tfvars" -compact-warnings

refresh:
	cd terraform && terraform refresh -var-file="config/$(environment).tfvars" -compact-warnings

output:
	cd terraform && terraform output

## Ansible

.PHONY: playbook
playbook:
	ansible-playbook ansible/playbook/$(playbook).yml -i ansible/inventory

## AWS

PRIVATE_KEY_PATH ?= ~/.ssh/id_rsa

include config/aws.mk

ssh:
	ssh -i $(PRIVATE_KEY_PATH) ubuntu@$(PUBLIC_DNS)

create:
	aws ec2 run-instances \
	--image-id $(image_id) \
	--instance-type $(instance_type) \
	--key-name $(key_name) \
	--security-group-ids $(security_group_ids) \
	--subnet-id $(subnet_id) \
	--tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=$(name)}]' \
	--associate-public-ip-address

terminate:
	aws ec2 terminate-instances --instance-id $(instance_id)