#!/usr/bin/env bash
# add GITHUB_TOKEN to your local call (e.g. GITHUB_TOKEN="token" sh ./mass...)
export NODE_ENV="development"

export EVENT_TYPE="pull_request_target"
export REPO_OWNER_NAME="ethereum"
export REPO_NAME="EIPs"
export GITHUB_REPOSITORY="ethereum/EIPs"
export CORE_EDITORS="@alita-moore"
export ERC_EDITORS="@lightclient,@axic"
export NETWORKING_EDITORS="@alita-moore"
export INTERFACE_EDITORS="@alita-moore"
export META_EDITORS="@alita-moore"
export INFORMATIONAL_EDITORS="@alita-moore"
export MAINTAINERS="@alita-moore, @fake-alita-moore"

ALL=("3654_1" "3654_2" "3768_1" "3768_2" "3581" "3596" "3612" "3623" "3670" "3676" "3767" "4189" "4192" "4361" "4393" "4478" "4499" "4506" "4506")
REMAINING=("3768")

for VARIABLE in "${ALL[@]}"; do
  export PULL_NUMBER=$VARIABLE
  yarn mock
done
